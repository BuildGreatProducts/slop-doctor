import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const scanStatus = v.union(
  v.literal("queued"),
  v.literal("capturing"),
  v.literal("examining"),
  v.literal("diagnosing"),
  v.literal("complete"),
  v.literal("failed"),
);

export const scanError = v.union(
  v.literal("capture_failed"),
  v.literal("examine_failed"),
  v.literal("diagnose_failed"),
  v.literal("generic"),
);

export const regionKind = v.union(
  v.literal("nav"),
  v.literal("hero"),
  v.literal("logos"),
  v.literal("features"),
  v.literal("testimonials"),
  v.literal("pricing"),
  v.literal("stats"),
  v.literal("steps"),
  v.literal("cta"),
  v.literal("footer"),
  v.literal("other"),
);

export const tier = v.union(
  v.literal("clean"),
  v.literal("sniffles"),
  v.literal("slopitis"),
  v.literal("chronic"),
  v.literal("code_purple"),
);

// 0–1, relative to the stored screenshot.
export const box = v.object({ x: v.number(), y: v.number(), w: v.number(), h: v.number() });

export const region = v.object({
  id: v.string(), // "r01", "r02", … in top-to-bottom order
  kind: regionKind,
  box,
  description: v.string(), // ≤ 1,200 chars
  visibleText: v.string(), // ≤ 600 chars
});

export const signals = v.object({
  fonts: v.array(v.string()), // primary first
  palette: v.array(v.string()), // English colour names, deduped
  colourScheme: v.union(v.literal("light"), v.literal("dark"), v.literal("unknown")),
  generator: v.optional(v.string()), // birthplace key if fingerprinted
  wordCount: v.number(),
  emDashCount: v.number(),
  buzzwordHits: v.array(v.string()),
  loremHits: v.array(v.string()),
  copyExcerpt: v.string(), // markdown trimmed to 4,000 chars
});

const choiceAnswer = v.object({
  choice: v.string(),
  confidence: v.number(),
  probabilities: v.record(v.string(), v.number()),
});

const scoreAnswer = v.object({ score: v.number(), confidence: v.number() });

export const determinations = v.object({
  archetype: choiceAnswer,
  birthplace: choiceAnswer,
  birthplaceConfirmed: v.boolean(),
  prognosis: choiceAnswer,
  templatedness: scoreAnswer,
  copyTemperament: scoreAnswer,
});

export const findingInput = v.object({
  key: v.string(),
  kind: v.union(v.literal("symptom"), v.literal("vital")),
  source: v.union(v.literal("lab"), v.literal("exam")),
  regionId: v.optional(v.string()),
  probability: v.number(),
  band: v.union(v.literal("present"), v.literal("inconclusive")),
  weight: v.number(),
});

export default defineSchema({
  ...authTables,

  scans: defineTable({
    userId: v.id("users"),
    url: v.string(),
    normalizedUrl: v.string(),
    host: v.string(),
    status: scanStatus,
    stageStartedAt: v.object({
      queued: v.number(),
      capturing: v.optional(v.number()),
      examining: v.optional(v.number()),
      diagnosing: v.optional(v.number()),
      complete: v.optional(v.number()),
    }),
    error: v.optional(scanError),
    screenshotId: v.optional(v.id("_storage")),
    screenshotWidth: v.optional(v.number()),
    screenshotHeight: v.optional(v.number()),
    pageTitle: v.optional(v.string()),
    signals: v.optional(signals),
    regions: v.optional(v.array(region)),
    jevModel: v.optional(v.string()),
    determinations: v.optional(determinations),
    slopIndex: v.optional(v.number()),
    tier: v.optional(tier),
    prescriptions: v.optional(v.array(v.string())), // symptom keys, max 3
    createdAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_normalizedUrl_created", ["normalizedUrl", "createdAt"])
    .index("by_status_created", ["status", "createdAt"]),

  findings: defineTable({
    scanId: v.id("scans"),
    ...findingInput.fields,
    order: v.number(),
    createdAt: v.number(),
  }).index("by_scan_order", ["scanId", "order"]),
});
