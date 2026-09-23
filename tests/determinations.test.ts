import { describe, expect, test } from "vitest";
import { ARCHETYPE, BIRTHPLACE, PROGNOSIS, TIERS } from "../convex/lib/taxonomy";
import { describeDeterminations } from "../src/lib/determinations";
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
  test("the production chart that showed three inconclusives now shows three answers as hunches", () => {
    // buildgreatproducts.com, 23 Sep 2026: confidences 0.16, 0.23 and 0.40.
    const r = describeDeterminations(det("linear_lookalike", 0.16, "human_designer", 0.23, "manageable", 0.4), "clean");
    expect(r.archetype).toEqual({
      name: "The Linear Lookalike",
      line: "Moody, precise and suspiciously familiar.",
      meta: "A hunch · 16% sure",
    });
    expect(r.birthplace.name).toBe("A human designer");
    expect(r.birthplace.meta).toBe("A hunch · 23% sure");
    expect(r.prognosis.name).toBe("Manageable with treatment");
    expect(r.prognosis.meta).toBe("A hunch · 40% sure");
    expect(r.prognosis.note).toBeUndefined(); // a hunch can't disagree with the lab
  });

  test("confident answers show the doctor's certainty, and a confident mismatch is called out", () => {
    const r = describeDeterminations(det("saas_clone", 0.81, "lovable", 0.62, "full_recovery", 0.9), "code_purple");
    expect(r.archetype.meta).toBe("Doctor's certainty 81%");
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
    expect(r.prognosis).toMatchObject({ name: "Manageable with treatment", meta: "Based on the lab results" });
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
            }
          }
  });
});
