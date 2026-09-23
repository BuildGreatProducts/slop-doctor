import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import type { UrlResult } from "./lib/urls";
import { validateUrl } from "./lib/urls";
import { rateLimiter } from "./rateLimits";
import schema from "./schema";

const CACHE_MS = 24 * 60 * 60 * 1000;
const fields = schema.tables.scans.validator.fields;

// An explicit allow-list: new scan fields stay private until they're added here.
// The fetch URL and page signals never leave the server (the query string can carry preview tokens).
export const publicScan = v.object({
  _id: v.id("scans"),
  _creationTime: v.number(),
  displayUrl: v.string(),
  host: fields.host,
  status: fields.status,
  stageStartedAt: fields.stageStartedAt,
  error: fields.error,
  screenshotUrl: v.union(v.string(), v.null()),
  screenshotWidth: fields.screenshotWidth,
  screenshotHeight: fields.screenshotHeight,
  pageTitle: fields.pageTitle,
  regions: fields.regions,
  determinations: fields.determinations,
  slopIndex: fields.slopIndex,
  tier: fields.tier,
  prescriptions: fields.prescriptions,
  createdAt: fields.createdAt,
});

function toPublic(scan: Doc<"scans">, screenshotUrl: string | null) {
  return {
    _id: scan._id,
    _creationTime: scan._creationTime,
    displayUrl: scan.displayUrl ?? `https://${scan.host}`,
    host: scan.host,
    status: scan.status,
    stageStartedAt: scan.stageStartedAt,
    error: scan.error,
    screenshotUrl,
    screenshotWidth: scan.screenshotWidth,
    screenshotHeight: scan.screenshotHeight,
    pageTitle: scan.pageTitle,
    regions: scan.regions,
    determinations: scan.determinations,
    slopIndex: scan.slopIndex,
    tier: scan.tier,
    prescriptions: scan.prescriptions,
    createdAt: scan.createdAt,
  };
}

/** Inserts a queued scan and schedules the pipeline. Shared by `create`, `rescan` and the dev helpers. */
export async function startScan(
  ctx: MutationCtx,
  userId: Id<"users">,
  parsed: Extract<UrlResult, { ok: true }>,
): Promise<Id<"scans">> {
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
  await ctx.scheduler.runAfter(0, internal.pipeline.capture.run, { scanId });
  return scanId;
}

async function chargeLimits(ctx: MutationCtx, userId: Id<"users">) {
  const perUser = await rateLimiter.limit(ctx, "userDaily", { key: userId });
  if (!perUser.ok) throw new ConvexError({ code: "rate_limited", retryAfterMs: perUser.retryAfter });
  const global = await rateLimiter.limit(ctx, "globalDaily");
  if (!global.ok) throw new ConvexError({ code: "clinic_full" });
}

export const create = mutation({
  args: { url: v.string() },
  returns: v.object({ scanId: v.id("scans"), cached: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: "signed_out" });

    const parsed = validateUrl(args.url);
    if (!parsed.ok) throw new ConvexError({ code: parsed.code });

    // 24-hour cache (docs/PRD.md FR-018). Fixture replays never count as real examinations.
    const recent = await ctx.db
      .query("scans")
      .withIndex("by_normalizedUrl_created", (q) =>
        q.eq("normalizedUrl", parsed.normalizedUrl).gt("createdAt", Date.now() - CACHE_MS),
      )
      .order("desc")
      .take(10);
    const hit = recent.find((s) => s.status === "complete" && s.jevModel !== "fixture");
    if (hit) return { scanId: hit._id, cached: true };

    await chargeLimits(ctx, userId);
    return { scanId: await startScan(ctx, userId, parsed), cached: false };
  },
});

/** A second opinion (docs/PRD.md FR-017): re-examines a chart's URL, read server-side, skipping the cache. */
export const rescan = mutation({
  args: { scanId: v.string() },
  returns: v.id("scans"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: "signed_out" });
    const id = ctx.db.normalizeId("scans", args.scanId);
    const scan = id ? await ctx.db.get(id) : null;
    if (!scan) throw new ConvexError({ code: "not_found" });

    const parsed = validateUrl(scan.url);
    if (!parsed.ok) throw new ConvexError({ code: parsed.code });
    await chargeLimits(ctx, userId);
    return await startScan(ctx, userId, parsed);
  },
});

export const get = query({
  args: { scanId: v.string() },
  returns: v.union(v.null(), publicScan),
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("scans", args.scanId);
    if (!id) return null;
    const scan = await ctx.db.get(id);
    if (!scan) return null;
    const screenshotUrl = scan.screenshotId ? await ctx.storage.getUrl(scan.screenshotId) : null;
    return toPublic(scan, screenshotUrl);
  },
});

export const mine = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("scans"),
      host: v.string(),
      status: fields.status,
      slopIndex: v.optional(v.number()),
      tier: fields.tier,
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("scans")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
    return rows.map((s) => ({
      _id: s._id,
      host: s.host,
      status: s.status,
      slopIndex: s.slopIndex,
      tier: s.tier,
      createdAt: s.createdAt,
    }));
  },
});
