// What the chart's three determination cards say (docs/COPY.md § Chart). Every card always says something:
// Jev's top answer with a fun line, or a fallback when there's no usable answer. Certainty isn't shown.

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

export type Mood = "happy" | "meh" | "sad";

export type Determination = { name: string; line: string; mood: Mood; meta?: string; note?: string };

// Whether each answer is good news for the patient. Anything unknown is "meh".
const ARCHETYPE_MOOD: Record<string, Mood> = {
  actually_designed: "happy",
  linear_lookalike: "meh",
  stripe_tribute: "meh",
  notion_wannabe: "meh",
  saas_clone: "sad",
  demo_day: "sad",
  crypto_fever: "sad",
  template_special: "sad",
};
const BIRTHPLACE_MOOD: Record<string, Mood> = {
  human_designer: "happy",
  framer: "meh",
  webflow: "meh",
  website_builder: "meh",
  v0: "sad",
  lovable: "sad",
  bolt: "sad",
  tailwind_starter: "sad",
};
const PROGNOSIS_MOOD: Record<string, Mood> = {
  full_recovery: "happy",
  manageable: "meh",
  chronic: "sad",
  terminal: "sad",
};

/** The diagnosis line's tick or cross: a clean bill of health or the sniffles is healthy; anything worse needs treatment. */
export function isHealthy(tier: TierKey): boolean {
  return tier === "clean" || tier === "sniffles";
}

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
          mood: ARCHETYPE_MOOD[d.archetype.choice] ?? "meh",
        }
      : { ...unknownArchetype, mood: "meh" };

  const birthplace: Determination =
    d && Object.hasOwn(birthplaceLabels, d.birthplace.choice)
      ? {
          name: birthplaceLabels[d.birthplace.choice],
          line: birthplaceLines[d.birthplace.choice],
          mood: BIRTHPLACE_MOOD[d.birthplace.choice] ?? "meh",
          meta: d.birthplaceConfirmed ? chart.birthplaceConfirmed : undefined,
        }
      : { ...unknownBirthplace, mood: "meh" };

  let prognosis: Determination;
  if (d && Object.hasOwn(PROGNOSIS_NAMES, d.prognosis.choice)) {
    const disagrees = d.prognosis.confidence >= CONFIDENCE_MIN && !PROGNOSIS_TIERS[d.prognosis.choice]?.includes(tier);
    prognosis = {
      name: PROGNOSIS_NAMES[d.prognosis.choice],
      line: prognosisLines[d.prognosis.choice],
      mood: PROGNOSIS_MOOD[d.prognosis.choice] ?? "meh",
      note: disagrees ? chart.disagreement : undefined,
    };
  } else {
    const fromTier = PROGNOSIS_FOR_TIER[tier];
    prognosis = { name: PROGNOSIS_NAMES[fromTier], line: prognosisLines[fromTier], mood: PROGNOSIS_MOOD[fromTier] ?? "meh" };
  }
  return { archetype, birthplace, prognosis };
}
