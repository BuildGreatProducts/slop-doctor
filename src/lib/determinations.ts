// What the chart's three determination cards say (docs/COPY.md § Chart). Every card always says something:
// Jev's answer with a fun line, flagged as a hunch when it's unsure, or a fallback when there's no usable answer.

import {
  ARCHETYPE_NAMES,
  CONFIDENCE_MIN,
  PROGNOSIS_NAMES,
  PROGNOSIS_TIERS,
  type TierKey,
} from "../../convex/lib/taxonomy";
import {
  archetypeLines,
  birthplaceLabels,
  birthplaceLines,
  chart,
  prognosisLines,
  unknownArchetype,
  unknownBirthplace,
} from "./copy";
import type { PublicScan } from "./types";

export type Determination = { name: string; line: string; meta?: string; note?: string };

const pct = (confidence: number) => Math.round(confidence * 100);
const sureness = (confidence: number) =>
  confidence >= CONFIDENCE_MIN ? chart.certainty(pct(confidence)) : chart.hunch(pct(confidence));

// The prognosis a tier implies, for when Jev's answer is missing.
const PROGNOSIS_FOR_TIER = Object.fromEntries(
  Object.entries(PROGNOSIS_TIERS).flatMap(([prognosis, tierKeys]) => tierKeys.map((t) => [t, prognosis])),
) as Record<TierKey, string>;

export function describeDeterminations(d: PublicScan["determinations"], tier: TierKey) {
  const archetype: Determination =
    d && Object.hasOwn(ARCHETYPE_NAMES, d.archetype.choice)
      ? {
          name: ARCHETYPE_NAMES[d.archetype.choice],
          line: archetypeLines[d.archetype.choice],
          meta: sureness(d.archetype.confidence),
        }
      : unknownArchetype;

  const birthplace: Determination =
    d && Object.hasOwn(birthplaceLabels, d.birthplace.choice)
      ? {
          name: birthplaceLabels[d.birthplace.choice],
          line: birthplaceLines[d.birthplace.choice],
          meta: d.birthplaceConfirmed ? chart.birthplaceConfirmed : sureness(d.birthplace.confidence),
        }
      : unknownBirthplace;

  let prognosis: Determination;
  if (d && Object.hasOwn(PROGNOSIS_NAMES, d.prognosis.choice)) {
    const disagrees = d.prognosis.confidence >= CONFIDENCE_MIN && !PROGNOSIS_TIERS[d.prognosis.choice]?.includes(tier);
    prognosis = {
      name: PROGNOSIS_NAMES[d.prognosis.choice],
      line: prognosisLines[d.prognosis.choice],
      meta: sureness(d.prognosis.confidence),
      note: disagrees ? chart.disagreement : undefined,
    };
  } else {
    const fromTier = PROGNOSIS_FOR_TIER[tier];
    prognosis = { name: PROGNOSIS_NAMES[fromTier], line: prognosisLines[fromTier], meta: chart.fromLab };
  }
  return { archetype, birthplace, prognosis };
}
