import { v } from "convex/values";
import { query } from "./_generated/server";
import schema from "./schema";

export const finding = v.object({
  _id: v.id("findings"),
  _creationTime: v.number(),
  ...schema.tables.findings.validator.fields,
});

export const byScan = query({
  args: { scanId: v.string() },
  returns: v.array(finding),
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("scans", args.scanId);
    if (!id) return [];
    return await ctx.db
      .query("findings")
      .withIndex("by_scan_order", (q) => q.eq("scanId", id))
      .collect();
  },
});
