// CLI-only fixture seeding (scripts/seed-fixture.ts). Replays a recorded examination through the same
// pipeline store mutations, with delays, so the scanner UI can be built and tested without provider keys.

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
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

export const seed = internalMutation({
  args: {
    url: v.string(),
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
  },
  returns: v.id("scans"),
  handler: async (ctx, a) => {
    assertDevHelpersAllowed();
    const parsed = validateUrl(a.url);
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

    const s = internal.pipeline.store;
    let t = 0;
    const at = (ms: number) => (t += a.live ? ms : 1); // scheduled steps keep their order
    await ctx.scheduler.runAfter(at(800), s.setStatus, { scanId, status: "capturing" });
    await ctx.scheduler.runAfter(at(3000), s.setCapture, {
      scanId,
      screenshotId: a.storageId,
      width: a.width,
      height: a.height,
      pageTitle: a.pageTitle,
      signals: a.signals,
    });
    await ctx.scheduler.runAfter(at(0), s.addFindings, { scanId, findings: a.labFindings });
    await ctx.scheduler.runAfter(at(0), s.setStatus, { scanId, status: "examining" });
    await ctx.scheduler.runAfter(at(3000), s.setRegions, { scanId, regions: a.regions });
    await ctx.scheduler.runAfter(at(0), s.setStatus, { scanId, status: "diagnosing" });
    for (const r of a.regions) {
      const findings = a.regionFindings.filter((f) => f.regionId === r.id);
      if (findings.length > 0) await ctx.scheduler.runAfter(at(250), s.addFindings, { scanId, findings });
    }
    await ctx.scheduler.runAfter(at(300), s.addFindings, { scanId, findings: a.pageFindings });

    const all = [...a.labFindings, ...a.regionFindings, ...a.pageFindings];
    const slopIndex = computeSlopIndex({ findings: all, templatedness: a.determinations.templatedness });
    await ctx.scheduler.runAfter(at(200), s.complete, {
      scanId,
      jevModel: "fixture",
      determinations: a.determinations,
      slopIndex,
      tier: tierFor(slopIndex),
      prescriptions: pickPrescriptions(all),
    });
    return scanId;
  },
});
