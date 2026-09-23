import { describe, expect, test } from "vitest";
import {
  ALL_SYMPTOMS,
  appliesToKind,
  ARCHETYPE,
  BIRTHPLACE,
  COPY_TEMPERAMENT,
  PROGNOSIS,
  PROGNOSIS_TIERS,
  REGION_KINDS,
  TEMPLATEDNESS,
  TIERS,
  VISUAL_SYMPTOMS,
  VITAL_SIGNS,
} from "../convex/lib/taxonomy";
import { birthplaceLabels } from "../src/lib/copy";

describe("taxonomy completeness", () => {
  test("symptom keys are unique", () => {
    const keys = ALL_SYMPTOMS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test.each(ALL_SYMPTOMS)("$key has a name, weight and prescription", (s) => {
    expect(s.name.length).toBeGreaterThan(0);
    expect(s.about).toMatch(/^[A-Z"].+[.]$/); // one plain sentence
    expect(s.about).not.toContain("\u2014");
    expect(s.weight).toBeGreaterThanOrEqual(1);
    expect(s.weight).toBeLessThanOrEqual(3);
    expect(s.rx.length).toBeGreaterThan(0);
  });

  test.each(ALL_SYMPTOMS.filter((s) => s.source === "exam"))("$key has a full Noul spec", (s) => {
    expect(s.noul?.question).toMatch(/\?$/);
    expect(s.noul?.whenTrue.length).toBeGreaterThan(0);
    expect(s.noul?.whenFalse.length).toBeGreaterThan(0);
  });

  test("every visual symptom is region-scoped with appliesTo", () => {
    for (const s of VISUAL_SYMPTOMS) {
      expect(s.scope).toBe("region");
      expect(s.appliesTo).toBeDefined();
    }
  });

  test("every region kind has at least one applicable symptom", () => {
    for (const kind of REGION_KINDS) {
      expect(VISUAL_SYMPTOMS.some((s) => appliesToKind(s, kind))).toBe(true);
    }
  });

  test("exam vital signs have Noul specs", () => {
    for (const v of VITAL_SIGNS.filter((v) => v.source === "exam")) expect(v.noul?.question).toMatch(/\?$/);
  });

  test("determinations have options or levels", () => {
    expect(Object.keys(ARCHETYPE.options)).toHaveLength(8);
    expect(Object.keys(BIRTHPLACE.options)).toHaveLength(8);
    expect(Object.keys(PROGNOSIS.options)).toHaveLength(4);
    expect(TEMPLATEDNESS.levels).toHaveLength(5);
    expect(COPY_TEMPERAMENT.levels).toHaveLength(4);
  });

  test("every birthplace option has a display label", () => {
    for (const key of Object.keys(BIRTHPLACE.options)) expect(birthplaceLabels[key]).toBeDefined();
  });

  test("tiers cover 0–100 and every prognosis maps to tiers", () => {
    expect(TIERS.at(-1)?.max).toBe(100);
    const mapped = Object.values(PROGNOSIS_TIERS).flat().sort();
    expect(mapped).toEqual(TIERS.map((t) => t.key).sort());
    expect(Object.keys(PROGNOSIS_TIERS).sort()).toEqual(Object.keys(PROGNOSIS.options).sort());
  });
});
