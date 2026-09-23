// CLI-only helpers: `npx convex run dev:startScanForDev '{"url":"https://example.com"}'`.
// Internal, so clients can't call them. Used by scripts/calibrate.ts and to test the scanner without OAuth.
// They refuse to run unless ALLOW_DEV_HELPERS=1 is set on the deployment (never on production).

import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { validateUrl } from "./lib/urls";
import { startScan } from "./scans";

const DEV_EMAIL = "dev@slop.doctor";

export function assertDevHelpersAllowed() {
  if (process.env.ALLOW_DEV_HELPERS !== "1") throw new Error("Dev helpers are disabled on this deployment");
}

export const startScanForDev = internalMutation({
  args: { url: v.string() },
  returns: v.id("scans"),
  handler: async (ctx, args) => {
    assertDevHelpersAllowed();
    const parsed = validateUrl(args.url);
    if (!parsed.ok) throw new ConvexError({ code: parsed.code });

    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", DEV_EMAIL))
      .unique();
    const userId = existing?._id ?? (await ctx.db.insert("users", { email: DEV_EMAIL, name: "Dev" }));
    return await startScan(ctx, userId, parsed);
  },
});
