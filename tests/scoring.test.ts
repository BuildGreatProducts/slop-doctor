import { describe, expect, test } from "vitest";
import {
  aggregateSymptoms,
  bandFor,
  computeSlopIndex,
  pickPrescriptions,
  type ScoredFinding,
  tierFor,
} from "../convex/lib/scoring";

const sym = (key: string, weight: number, probability = 1, band: "present" | "inconclusive" = "present"): ScoredFinding => ({
  key,
  kind: "symptom",
  band,
  probability,
  weight,
});
const vital = (key: string): ScoredFinding => ({ key, kind: "vital", band: "present", probability: 1, weight: 0 });

describe("bandFor", () => {
  test.each([
    [0.65, "present"],
    [0.9, "present"],
    [0.649, "inconclusive"],
    [0.35, "inconclusive"],
    [0.349, "absent"],
    [0, "absent"],
  ])("%s → %s", (p, band) => expect(bandFor(p)).toBe(band));
});

describe("aggregateSymptoms", () => {
  test("takes the max p per symptom and ignores inconclusive and vital findings", () => {
    const agg = aggregateSymptoms([
      sym("purple_gradient", 3, 0.7),
      sym("purple_gradient", 3, 0.9),
      sym("glow_orbs", 2, 0.5, "inconclusive"),
      vital("product_ui"),
    ]);
    expect([...agg.entries()]).toEqual([["purple_gradient", { p: 0.9, weight: 3 }]]);
  });
});

describe("computeSlopIndex", () => {
  test("no findings is 0", () => {
    expect(computeSlopIndex({ findings: [] })).toBe(0);
  });

  test("symptom points saturate at 16", () => {
    const findings = [sym("a", 3), sym("b", 3), sym("c", 3), sym("d", 3), sym("e", 3), sym("f", 3)]; // 18 points
    expect(computeSlopIndex({ findings })).toBe(100);
  });

  test("8 points with no templatedness is 50", () => {
    expect(computeSlopIndex({ findings: [sym("a", 3), sym("b", 3), sym("c", 2)] })).toBe(50);
  });

  test("blends templatedness when confident", () => {
    // s = 8/16 = 0.5; t = 4/4 = 1 → 0.7×0.5 + 0.3×1 = 0.65 → 65
    const findings = [sym("a", 3), sym("b", 3), sym("c", 2)];
    expect(computeSlopIndex({ findings, templatedness: { score: 4, confidence: 0.8 } })).toBe(65);
  });

  test("ignores inconclusive templatedness", () => {
    const findings = [sym("a", 3), sym("b", 3), sym("c", 2)];
    expect(computeSlopIndex({ findings, templatedness: { score: 4, confidence: 0.49 } })).toBe(50);
  });

  test("weights symptoms by probability", () => {
    expect(computeSlopIndex({ findings: [sym("a", 2, 0.8)] })).toBe(10); // 1.6/16
  });

  test("each vital sign subtracts 5, deduped", () => {
    const findings = [sym("a", 3), sym("b", 3), sym("c", 2), vital("product_ui"), vital("product_ui"), vital("custom_imagery")];
    expect(computeSlopIndex({ findings })).toBe(40);
  });

  test("clamps at 0", () => {
    expect(computeSlopIndex({ findings: [vital("product_ui"), vital("concrete_copy")] })).toBe(0);
  });
});

describe("tierFor", () => {
  test.each([
    [0, "clean"],
    [15, "clean"],
    [16, "sniffles"],
    [35, "sniffles"],
    [36, "slopitis"],
    [55, "slopitis"],
    [56, "chronic"],
    [75, "chronic"],
    [76, "code_purple"],
    [100, "code_purple"],
  ])("%s → %s", (index, tier) => expect(tierFor(index)).toBe(tier));
});

describe("pickPrescriptions", () => {
  test("top three by weight × p", () => {
    const findings = [
      sym("sparkle", 1),
      sym("purple_gradient", 3, 0.7), // 2.1
      sym("glow_orbs", 2), // 2
      sym("lorem", 3), // 3
      sym("bento", 2, 0.66), // 1.32
    ];
    expect(pickPrescriptions(findings)).toEqual(["lorem", "purple_gradient", "glow_orbs"]);
  });

  test("ties go to taxonomy order", () => {
    expect(pickPrescriptions([sym("glassmorphism", 2), sym("glow_orbs", 2)])).toEqual(["glow_orbs", "glassmorphism"]);
  });

  test("none when nothing is present", () => {
    expect(pickPrescriptions([sym("glow_orbs", 2, 0.5, "inconclusive")])).toEqual([]);
  });
});
