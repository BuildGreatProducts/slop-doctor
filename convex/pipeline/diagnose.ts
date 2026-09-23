"use node";

import { TypeSafeClient } from "@typesafe-ai/sdk";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import {
  type Answer,
  interpretPageAnswers,
  interpretRegionAnswers,
  pageQuestions,
  pageState,
  regionQuestions,
  regionState,
} from "../lib/jevQuestions";
import { computeSlopIndex, pickPrescriptions, tierFor } from "../lib/scoring";

export const run = internalAction({
  args: { scanId: v.id("scans") },
  returns: v.null(),
  handler: async (ctx, { scanId }) => {
    const scan = await ctx.runQuery(internal.pipeline.store.getForPipeline, { scanId });
    if (!scan?.signals || !scan.regions) return null;
    const { signals, regions } = scan;

    try {
      const jev = new TypeSafeClient();
      const ask = async (label: string, state: Parameters<TypeSafeClient["systemOne"]>[0]["state"], questions: object) => {
        const res = await jev.systemOne({ state, questions: questions as Parameters<TypeSafeClient["systemOne"]>[0]["questions"] });
        console.log(`jev ${label}: ${res.usage.input_tokens} in / ${res.usage.output_tokens} out (${res.model})`);
        return { model: res.model, answers: res.answers as unknown as Record<string, Answer> };
      };

      // Page call and region calls run concurrently; each writes its findings as soon as it resolves,
      // so the scanner can reveal them while the rest are still in flight.
      const pageCall = ask("page", pageState({ ...scan, signals, regions }), pageQuestions()).then(async (res) => {
        const page = interpretPageAnswers(res.answers, signals);
        if (page.findings.length > 0) {
          await ctx.runMutation(internal.pipeline.store.addFindings, { scanId, findings: page.findings });
        }
        return { model: res.model, determinations: page.determinations };
      });

      const regionCalls = regions
        .filter((r) => Object.keys(regionQuestions(r.kind)).length > 0)
        .map((r) =>
          ask(r.id, regionState(r, signals), regionQuestions(r.kind)).then(async (res) => {
            const findings = interpretRegionAnswers(r.id, res.answers);
            if (findings.length > 0) await ctx.runMutation(internal.pipeline.store.addFindings, { scanId, findings });
          }),
        );

      const [page, ...regionResults] = await Promise.allSettled([pageCall, ...regionCalls]);
      for (const r of regionResults) if (r.status === "rejected") console.warn("jev region call failed", r.reason);
      if (page.status === "rejected") throw page.reason;

      const { model, determinations } = (page as PromiseFulfilledResult<Awaited<typeof pageCall>>).value;
      const findings = await ctx.runQuery(internal.pipeline.store.findingsForScan, { scanId });
      const slopIndex = computeSlopIndex({ findings, templatedness: determinations.templatedness });

      await ctx.runMutation(internal.pipeline.store.complete, {
        scanId,
        jevModel: model,
        determinations,
        slopIndex,
        tier: tierFor(slopIndex),
        prescriptions: pickPrescriptions(findings),
      });
    } catch (error) {
      console.error(`diagnose failed for ${scan.url}`, error);
      await ctx.runMutation(internal.pipeline.store.fail, { scanId, error: "diagnose_failed" });
    }
    return null;
  },
});
