import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import type { UrlResult } from "./lib/urls";
import { validateUrl } from "./lib/urls";
import { rateLimiter } from "./rateLimits";
import schema from "./schema";

const { userId: _userId, ...publicScanFields } = schema.tables.scans.validator.fields;

export const publicScan = v.object({
  _id: v.id("scans"),
  _creationTime: v.number(),
  ...publicScanFields,
  screenshotUrl: v.union(v.string(), v.null()),
});

/** Inserts a queued scan and schedules the pipeline. Shared by `create` and `dev.startScanForDev`. */
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
    host: parsed.host,
    status: "queued",
    stageStartedAt: { queued: now },
    createdAt: now,
  });
  await ctx.scheduler.runAfter(0, internal.pipeline.capture.run, { scanId });
  return scanId;
}

export const create = mutation({
  args: { url: v.string() },
  returns: v.object({ scanId: v.id("scans"), cached: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError({ code: "signed_out" });

    const parsed = validateUrl(args.url);
    if (!parsed.ok) throw new ConvexError({ code: parsed.code });

    const perUser = await rateLimiter.limit(ctx, "userDaily", { key: userId });
    if (!perUser.ok) throw new ConvexError({ code: "rate_limited", retryAfterMs: perUser.retryAfter });
    const global = await rateLimiter.limit(ctx, "globalDaily");
    if (!global.ok) throw new ConvexError({ code: "clinic_full" });

    const scanId = await startScan(ctx, userId, parsed);
    return { scanId, cached: false };
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
    const { userId: _owner, ...rest } = scan;
    const screenshotUrl = scan.screenshotId ? await ctx.storage.getUrl(scan.screenshotId) : null;
    return { ...rest, screenshotUrl };
  },
});

export const mine = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("scans"),
      host: v.string(),
      status: publicScanFields.status,
      slopIndex: v.optional(v.number()),
      tier: publicScanFields.tier,
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
