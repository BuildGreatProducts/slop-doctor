import { describe, expect, test } from "vitest";
import { ARCHETYPE, BIRTHPLACE, PROGNOSIS, TIERS } from "../convex/lib/taxonomy";
import { describeDeterminations, isHealthy } from "../src/lib/determinations";
import type { PublicScan } from "../src/lib/types";

type D = NonNullable<PublicScan["determinations"]>;
const choice = (c: string, confidence: number) => ({ choice: c, confidence, probabilities: {} });
const score = { score: 2, confidence: 0.8 };
const det = (a: string, ac: number, b: string, bc: number, p: string, pc: number, confirmed = false): D => ({
  archetype: choice(a, ac),
  birthplace: choice(b, bc),
  birthplaceConfirmed: confirmed,
  prognosis: choice(p, pc),
  templatedness: score,
  copyTemperament: score,
});

describe("describeDeterminations", () => {
  test("the production chart that showed three inconclusives now shows three answers, without certainty", () => {
    // buildgreatproducts.com, 23 Sep 2026: confidences 0.16, 0.23 and 0.40.
    const r = describeDeterminations(det("linear_lookalike", 0.16, "human_designer", 0.23, "manageable", 0.4), "clean");
    expect(r.archetype).toEqual({ name: "The Linear Lookalike", line: "Moody, precise and suspiciously familiar.", mood: "meh" });
    expect(r.birthplace).toEqual({
      name: "A human designer",
      line: "Raised by a human designer. Increasingly rare.",
      mood: "happy",
      meta: undefined,
    });
    expect(r.prognosis.name).toBe("Manageable with treatment");
    expect(r.prognosis.note).toBeUndefined(); // an unsure prognosis doesn't argue with the lab
  });

  test("a confident prognosis that doesn't match the tier is called out", () => {
    const r = describeDeterminations(det("saas_clone", 0.81, "lovable", 0.62, "full_recovery", 0.9), "code_purple");
    expect(r.prognosis.note).toBe("The doctor and the lab disagree.");
  });

  test("a lab-confirmed birthplace says so", () => {
    const r = describeDeterminations(det("saas_clone", 0.8, "framer", 1, "chronic", 0.8, true), "chronic");
    expect(r.birthplace.meta).toBe("Confirmed by lab");
  });

  test("missing or invalid answers fall back to something fun, and prognosis follows the tier", () => {
    const r = describeDeterminations(det("", 0, "", 0, "", 0), "slopitis");
    expect(r.archetype.name).toBe("A medical mystery");
    expect(r.birthplace.name).toBe("Place of birth unknown");
    expect(r.prognosis).toEqual({
      name: "Manageable with treatment",
      line: "A short course of prescriptions should clear it up.",
      mood: "meh",
    });
    expect(r.archetype.mood).toBe("meh");
    expect(r.birthplace.mood).toBe("meh");
    expect(describeDeterminations(undefined, "code_purple").prognosis.name).toBe("Terminal");
  });

  test("every possible answer and every tier has a name and a line", () => {
    for (const a of Object.keys(ARCHETYPE.options))
      for (const b of Object.keys(BIRTHPLACE.options))
        for (const p of Object.keys(PROGNOSIS.options))
          for (const { key } of TIERS) {
            const r = describeDeterminations(det(a, 0.3, b, 0.3, p, 0.3), key);
            for (const card of [r.archetype, r.birthplace, r.prognosis]) {
              expect(card.name.length).toBeGreaterThan(0);
              expect(card.line.length).toBeGreaterThan(0);
              expect(["happy", "meh", "sad"]).toContain(card.mood);
            }
          }
  });
});

describe("moods and verdict", () => {
  test("good answers smile and bad ones frown", () => {
    const good = describeDeterminations(det("actually_designed", 0.9, "human_designer", 0.9, "full_recovery", 0.9), "clean");
    expect([good.archetype.mood, good.birthplace.mood, good.prognosis.mood]).toEqual(["happy", "happy", "happy"]);
    const bad = describeDeterminations(det("saas_clone", 0.9, "lovable", 0.9, "terminal", 0.9), "code_purple");
    expect([bad.archetype.mood, bad.birthplace.mood, bad.prognosis.mood]).toEqual(["sad", "sad", "sad"]);
  });

  test("clean and sniffles are healthy; slopitis and worse need treatment", () => {
    expect(TIERS.map((t) => [t.key, isHealthy(t.key)])).toEqual([
      ["clean", true],
      ["sniffles", true],
      ["slopitis", false],
      ["chronic", false],
      ["code_purple", false],
    ]);
  });
});
