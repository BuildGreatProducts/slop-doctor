// Internal writes for the examination pipeline. Unreachable from clients.

import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import schema, { determinations, findingInput, region, scanError, scanStatus, signals, tier } from "../schema";

export const getForPipeline = internalQuery({
  args: { scanId: v.id("scans") },
  returns: v.union(
    v.null(),
    v.object({ _id: v.id("scans"), _creationTime: v.number(), ...schema.tables.scans.validator.fields }),
  ),
  handler: async (ctx, args) => await ctx.db.get(args.scanId),
});

export const findingsForScan = internalQuery({
  args: { scanId: v.id("scans") },
  returns: v.array(findingInput),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("findings")
      .withIndex("by_scan_order", (q) => q.eq("scanId", args.scanId))
      .collect();
    return rows.map(({ key, kind, source, regionId, probability, band, weight }) => ({
      key,
      kind,
      source,
      probability,
      band,
      weight,
      ...(regionId ? { regionId } : {}),
    }));
  },
});

export const setStatus = internalMutation({
  args: { scanId: v.id("scans"), status: scanStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scan = await ctx.db.get(args.scanId);
    if (!scan) return null;
    const stageStartedAt =
      args.status === "failed" || args.status === "queued"
        ? scan.stageStartedAt
        : { ...scan.stageStartedAt, [args.status]: Date.now() };
    await ctx.db.patch(args.scanId, { status: args.status, stageStartedAt });
    return null;
  },
});

export const setCapture = internalMutation({
  args: {
    scanId: v.id("scans"),
    screenshotId: v.id("_storage"),
    width: v.number(),
    height: v.number(),
    pageTitle: v.optional(v.string()),
    signals,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scanId, {
      screenshotId: args.screenshotId,
      screenshotWidth: args.width,
      screenshotHeight: args.height,
      pageTitle: args.pageTitle,
      signals: args.signals,
    });
    return null;
  },
});

export const setRegions = internalMutation({
  args: { scanId: v.id("scans"), regions: v.array(region) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.scanId, { regions: args.regions });
    return null;
  },
});

export const addFindings = internalMutation({
  args: { scanId: v.id("scans"), findings: v.array(findingInput) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("findings")
      .withIndex("by_scan_order", (q) => q.eq("scanId", args.scanId))
      .collect();
    const now = Date.now();
    for (const [i, f] of args.findings.entries()) {
      await ctx.db.insert("findings", { scanId: args.scanId, ...f, order: existing.length + i, createdAt: now });
    }
    return null;
  },
});

export const complete = internalMutation({
  args: {
    scanId: v.id("scans"),
    jevModel: v.string(),
    determinations,
    slopIndex: v.number(),
    tier,
    prescriptions: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { scanId, ...result }) => {
    const scan = await ctx.db.get(scanId);
    if (!scan) return null;
    await ctx.db.patch(scanId, {
      ...result,
      status: "complete",
      stageStartedAt: { ...scan.stageStartedAt, complete: Date.now() },
    });
    return null;
  },
});

export const fail = internalMutation({
  args: { scanId: v.id("scans"), error: scanError },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scan = await ctx.db.get(args.scanId);
    if (!scan || scan.status === "complete" || scan.status === "failed") return null;
    await ctx.db.patch(args.scanId, { status: "failed", error: args.error });
    return null;
  },
});

const STUCK_AFTER_MS = 3 * 60 * 1000;

/** Marks scans that never reached a terminal status as failed (docs/PRD.md § 7 Reliability). */
export const failStuck = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cutoff = Date.now() - STUCK_AFTER_MS;
    let count = 0;
    for (const status of ["queued", "capturing", "examining", "diagnosing"] as const) {
      const stuck = await ctx.db
        .query("scans")
        .withIndex("by_status_created", (q) => q.eq("status", status).lt("createdAt", cutoff))
        .take(100);
      for (const scan of stuck) {
        await ctx.db.patch(scan._id, { status: "failed", error: "generic" });
        count++;
      }
    }
    return count;
  },
});
