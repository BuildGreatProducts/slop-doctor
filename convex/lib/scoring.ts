// Slop Index maths (docs/SLOP-TAXONOMY.md § Scoring). Pure: shared by the pipeline and the Slop-o-meter.

import {
  ALL_SYMPTOMS,
  CONFIDENCE_MIN,
  INCONCLUSIVE_MIN,
  PRESENT_MIN,
  SATURATION,
  TIERS,
  type TierKey,
  VITAL_SIGN_BONUS,
} from "./taxonomy";

export type ScoredFinding = {
  key: string;
  kind: "symptom" | "vital";
  band: "present" | "inconclusive" | "absent";
  probability: number;
  weight: number;
};

export type Band = "present" | "inconclusive" | "absent";

export function bandFor(p: number): Band {
  if (p >= PRESENT_MIN) return "present";
  if (p >= INCONCLUSIVE_MIN) return "inconclusive";
  return "absent";
}

/** Highest probability per present symptom, across regions. */
export function aggregateSymptoms(findings: ScoredFinding[]): Map<string, { p: number; weight: number }> {
  const out = new Map<string, { p: number; weight: number }>();
  for (const f of findings) {
    if (f.kind !== "symptom" || f.band !== "present") continue;
    const prev = out.get(f.key);
    if (!prev || f.probability > prev.p) out.set(f.key, { p: f.probability, weight: f.weight });
  }
  return out;
}

export function countVitalSigns(findings: ScoredFinding[]): number {
  return new Set(findings.filter((f) => f.kind === "vital" && f.band === "present").map((f) => f.key)).size;
}

export function computeSlopIndex(input: {
  findings: ScoredFinding[];
  templatedness?: { score: number; confidence: number };
}): number {
  let raw = 0;
  for (const { p, weight } of aggregateSymptoms(input.findings).values()) raw += weight * p;
  const s = Math.min(1, raw / SATURATION);

  const t = input.templatedness;
  const blended = t && t.confidence >= CONFIDENCE_MIN ? 0.7 * s + 0.3 * (t.score / 4) : s;
  const index = Math.round(100 * blended) - VITAL_SIGN_BONUS * countVitalSigns(input.findings);
  return Math.max(0, Math.min(100, index));
}

export function tierFor(index: number): TierKey {
  return (TIERS.find((t) => index <= t.max) ?? TIERS[TIERS.length - 1]).key;
}

const TAXONOMY_ORDER = new Map(ALL_SYMPTOMS.map((s, i) => [s.key, i]));

/** Present symptoms, highest weight × p first; ties go to taxonomy order. */
export function rankSymptoms(findings: ScoredFinding[]): [string, { p: number; weight: number }][] {
  return [...aggregateSymptoms(findings).entries()].sort(
    ([ka, a], [kb, b]) =>
      b.weight * b.p - a.weight * a.p || (TAXONOMY_ORDER.get(ka) ?? 999) - (TAXONOMY_ORDER.get(kb) ?? 999),
  );
}

/** Up to three symptom keys with the highest weight × p; ties go to taxonomy order. */
export function pickPrescriptions(findings: ScoredFinding[]): string[] {
  return rankSymptoms(findings)
    .slice(0, 3)
    .map(([key]) => key);
}
