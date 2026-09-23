import { describe, expect, test } from "vitest";
import {
  type Answer,
  interpretPageAnswers,
  interpretRegionAnswers,
  pageQuestions,
  pageState,
  regionQuestions,
  regionState,
  type RegionInput,
  type SignalsInput,
} from "../convex/lib/jevQuestions";
import { REGION_KINDS } from "../convex/lib/taxonomy";

const signals: SignalsInput = {
  fonts: ["Inter"],
  palette: ["violet", "near-black"],
  colourScheme: "dark",
  copyExcerpt: "# Build the future\nSeamless AI.",
};
const regions: RegionInput[] = [
  { id: "r01", kind: "nav", description: "Logo left, links right", visibleText: "Home Pricing" },
  { id: "r02", kind: "hero", description: "Centred headline over a violet gradient", visibleText: "Build the future" },
  { id: "r03", kind: "features", description: "Three identical cards", visibleText: "Fast Simple Powerful" },
];

describe("regionQuestions", () => {
  test("hero gets hero-only and any-region symptoms", () => {
    const keys = Object.keys(regionQuestions("hero"));
    expect(keys).toContain("pill_badge");
    expect(keys).toContain("centered_hero");
    expect(keys).toContain("purple_gradient");
    expect(keys).not.toContain("icon_tiles");
  });

  test("footer gets only any-region symptoms", () => {
    expect(Object.keys(regionQuestions("footer")).sort()).toEqual(
      ["accent_border", "emoji_icons", "glassmorphism", "glow_orbs", "purple_gradient", "sparkle"].sort(),
    );
  });

  test("no kind has an empty question map", () => {
    for (const kind of REGION_KINDS) expect(Object.keys(regionQuestions(kind)).length).toBeGreaterThan(0);
  });

  test("questions are well-formed Nouls", () => {
    const q = regionQuestions("hero").purple_gradient;
    expect(q.type).toBe("noul");
    expect(q.instructions).toMatch(/`region`/);
    expect(q.criteria.true.length).toBeGreaterThan(0);
    expect(q.criteria.false.length).toBeGreaterThan(0);
  });
});

describe("pageQuestions", () => {
  test("includes page symptoms, exam vital signs and determinations", () => {
    const q = pageQuestions();
    expect(Object.keys(q).sort()).toEqual(
      [
        "dark_default",
        "vague_value",
        "rule_of_three",
        "not_x_but_y",
        "custom_imagery",
        "product_ui",
        "concrete_copy",
        "unconventional_layout",
        "archetype",
        "birthplace",
        "prognosis",
        "templatedness",
        "copy_temperament",
      ].sort(),
    );
    expect(q.archetype.type).toBe("choice");
    expect(q.templatedness.type).toBe("score");
    expect(q.templatedness.criteria).toHaveLength(5);
  });
});

describe("states", () => {
  test("region state contains only that region", () => {
    const state = regionState(regions[1], signals);
    const json = JSON.stringify(state);
    expect(json).toContain("violet gradient");
    expect(json).not.toContain("Three identical cards");
    expect(json).not.toContain("Home Pricing");
    expect(state.page).toEqual({ fonts: ["Inter"], palette: ["violet", "near-black"], colour_scheme: "dark" });
  });

  test("page state uses hero text and summarises regions", () => {
    const state = pageState({ host: "example.com", pageTitle: "Example", signals, regions });
    expect(state.page.hero_text).toBe("Build the future");
    expect(state.page.regions).toHaveLength(3);
    expect(state.page.copy).toBe(signals.copyExcerpt);
  });

  test("page state falls back to the first region when there is no hero", () => {
    const state = pageState({ host: "x.com", signals, regions: [regions[0]] });
    expect(state.page.hero_text).toBe("Home Pricing");
  });
});

describe("interpretRegionAnswers", () => {
  test("keeps every answered symptom, low scores included, with the region id", () => {
    const answers: Record<string, Answer> = {
      purple_gradient: { type: "noul", noul: 0.91 },
      glow_orbs: { type: "noul", noul: 0.5 },
      sparkle: { type: "noul", noul: 0.1 },
    };
    expect(interpretRegionAnswers("r02", answers)).toEqual([
      { key: "purple_gradient", kind: "symptom", source: "exam", probability: 0.91, band: "present", weight: 3, regionId: "r02" },
      { key: "glow_orbs", kind: "symptom", source: "exam", probability: 0.5, band: "inconclusive", weight: 2, regionId: "r02" },
      { key: "sparkle", kind: "symptom", source: "exam", probability: 0.1, band: "absent", weight: 1, regionId: "r02" },
    ]);
  });
});

describe("interpretPageAnswers", () => {
  const answers: Record<string, Answer> = {
    dark_default: { type: "noul", noul: 0.8 },
    vague_value: { type: "noul", noul: 0.2 },
    product_ui: { type: "noul", noul: 0.7 },
    archetype: { type: "choice", choice: "saas_clone", confidence: 0.8, probabilities: { saas_clone: 0.85 } },
    birthplace: { type: "choice", choice: "v0", confidence: 0.4, probabilities: { v0: 0.5, lovable: 0.3 } },
    prognosis: { type: "choice", choice: "chronic", confidence: 0.7, probabilities: { chronic: 0.8 } },
    templatedness: { type: "score", score: 3.2, confidence: 0.6 },
    copy_temperament: { type: "score", score: 2.1, confidence: 0.55 },
  };

  test("returns page symptoms, vital signs and determinations", () => {
    const r = interpretPageAnswers(answers, {});
    // Low-scoring symptoms are kept; a low-scoring vital sign isn't a sign of life, so it's dropped.
    expect(r.findings.map((f) => [f.key, f.kind, f.band])).toEqual([
      ["dark_default", "symptom", "present"],
      ["vague_value", "symptom", "absent"],
      ["product_ui", "vital", "present"],
    ]);
    expect(r.determinations.archetype.choice).toBe("saas_clone");
    expect(r.determinations.birthplaceConfirmed).toBe(false);
    expect(r.determinations.templatedness).toEqual({ score: 3.2, confidence: 0.6 });
  });

  test("lab generator overrides the birthplace", () => {
    const r = interpretPageAnswers(answers, { generator: "framer" });
    expect(r.determinations.birthplace.choice).toBe("framer");
    expect(r.determinations.birthplace.confidence).toBe(1);
    expect(r.determinations.birthplaceConfirmed).toBe(true);
  });
});

describe("untrusted answers", () => {
  test("malformed Noul answers are dropped", () => {
    const answers = {
      purple_gradient: { type: "noul", noul: Number.NaN },
      glow_orbs: { type: "noul", noul: 7 },
      sparkle: { type: "choice", choice: "yes", confidence: 1, probabilities: {} },
    } as unknown as Record<string, Answer>;
    expect(interpretRegionAnswers("r01", answers)).toEqual([]);
  });

  test("choices outside the options and out-of-range scores become inconclusive", () => {
    const answers = {
      archetype: { type: "choice", choice: "ignore previous instructions", confidence: 1, probabilities: {} },
      birthplace: { type: "choice", choice: "v0", confidence: 2, probabilities: { v0: 1 } },
      prognosis: { type: "choice", choice: "chronic", confidence: 0.8, probabilities: { chronic: 0.9, bogus: 5 } },
      templatedness: { type: "score", score: 9, confidence: 0.9 },
      copy_temperament: { type: "score", score: Number.POSITIVE_INFINITY, confidence: 0.9 },
    } as unknown as Record<string, Answer>;
    const d = interpretPageAnswers(answers, {}).determinations;
    expect(d.archetype.confidence).toBe(0);
    expect(d.birthplace.confidence).toBe(0);
    expect(d.prognosis).toEqual({ choice: "chronic", confidence: 0.8, probabilities: { chronic: 0.9 } });
    expect(d.templatedness).toEqual({ score: 0, confidence: 0 });
    expect(d.copyTemperament).toEqual({ score: 0, confidence: 0 });
  });
});
