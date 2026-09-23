// CLI-only fixture seeding (scripts/seed-fixture.ts). Replays a recorded examination through the same
// pipeline store mutations, with delays, so the scanner UI can be built and tested without provider keys.

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { assertDevHelpersAllowed } from "./dev";
import { computeSlopIndex, pickPrescriptions, tierFor } from "./lib/scoring";
import { validateUrl } from "./lib/urls";
import { determinations, findingInput, region, signals } from "./schema";

export const uploadUrl = internalMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    assertDevHelpersAllowed();
    return await ctx.storage.generateUploadUrl();
  },
});

const fixture = {
  storageId: v.id("_storage"),
  width: v.number(),
  height: v.number(),
  pageTitle: v.string(),
  signals,
  labFindings: v.array(findingInput),
  regions: v.array(region),
  regionFindings: v.array(findingInput),
  pageFindings: v.array(findingInput),
  determinations,
  live: v.boolean(),
};

export const seed = internalMutation({
  args: { url: v.string(), ...fixture },
  returns: v.id("scans"),
  handler: async (ctx, { url, ...a }) => {
    assertDevHelpersAllowed();
    const parsed = validateUrl(url);
    if (!parsed.ok) throw new Error(parsed.code);
    const email = "dev@slop.doctor";
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .unique();
    const userId = user?._id ?? (await ctx.db.insert("users", { email, name: "Dev" }));
    const now = Date.now();
    const scanId = await ctx.db.insert("scans", {
      userId,
      url: parsed.url,
      normalizedUrl: parsed.normalizedUrl,
      displayUrl: parsed.displayUrl,
      host: parsed.host,
      status: "queued",
      stageStartedAt: { queued: now },
      createdAt: now,
    });
    await ctx.scheduler.runAfter(0, internal.devFixtures.replay, { scanId, ...a });
    return scanId;
  },
});

/** Plays the recorded examination back step by step, awaiting each write so they land in order. */
export const replay = internalAction({
  args: { scanId: v.id("scans"), ...fixture },
  returns: v.null(),
  handler: async (ctx, { scanId, live, ...a }) => {
    const s = internal.pipeline.store;
    const wait = (ms: number) => (live ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

    await wait(800);
    await ctx.runMutation(s.setStatus, { scanId, status: "capturing" });
    await wait(3000);
    await ctx.runMutation(s.setCapture, {
      scanId,
      screenshotId: a.storageId,
      width: a.width,
      height: a.height,
      pageTitle: a.pageTitle,
      signals: a.signals,
    });
    await ctx.runMutation(s.addFindings, { scanId, findings: a.labFindings });
    await ctx.runMutation(s.setStatus, { scanId, status: "examining" });
    await wait(3000);
    await ctx.runMutation(s.setRegions, { scanId, regions: a.regions });
    await ctx.runMutation(s.setStatus, { scanId, status: "diagnosing" });
    for (const r of a.regions) {
      const findings = a.regionFindings.filter((f) => f.regionId === r.id);
      if (findings.length === 0) continue;
      await wait(250);
      await ctx.runMutation(s.addFindings, { scanId, findings });
    }
    await wait(300);
    await ctx.runMutation(s.addFindings, { scanId, findings: a.pageFindings });

    const all = [...a.labFindings, ...a.regionFindings, ...a.pageFindings];
    const slopIndex = computeSlopIndex({ findings: all, templatedness: a.determinations.templatedness });
    await ctx.runMutation(s.complete, {
      scanId,
      jevModel: "fixture",
      determinations: a.determinations,
      slopIndex,
      tier: tierFor(slopIndex),
      prescriptions: pickPrescriptions(all),
    });
    return null;
  },
});
