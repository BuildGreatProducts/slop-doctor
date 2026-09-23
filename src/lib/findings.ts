import { SYMPTOMS_BY_KEY, VITAL_SIGNS_BY_KEY } from "../../convex/lib/taxonomy";
import type { Finding } from "./types";

export function findingName(key: string): string {
  return SYMPTOMS_BY_KEY[key]?.name ?? VITAL_SIGNS_BY_KEY[key]?.name ?? key;
}

export type BarTone = "low" | "mid" | "high";

/** Symptom bar colour: green under 20%, yellow from 20% up to 70%, red over 70%. */
export function barTone(p: number): BarTone {
  const pct = Math.round(p * 100);
  if (pct < 20) return "low";
  if (pct <= 70) return "mid";
  return "high";
}

export type RegionHeadline =
  | { state: "present" | "inconclusive"; lead: Finding; more: number }
  | { state: "clear" };

/**
 * What a region's tag says: its highest weight × p symptom that's present (plus how many others are),
 * else its strongest inconclusive one, else that the doctor found nothing.
 */
export function regionHeadline(findings: Finding[]): RegionHeadline | null {
  const symptoms = findings.filter((f) => f.kind === "symptom");
  if (symptoms.length === 0) return null;
  const strongest = (pool: Finding[]) => [...pool].sort((a, b) => b.weight * b.probability - a.weight * a.probability)[0];
  const present = symptoms.filter((f) => f.band === "present");
  if (present.length > 0) return { state: "present", lead: strongest(present), more: present.length - 1 };
  const inconclusive = symptoms.filter((f) => f.band === "inconclusive");
  if (inconclusive.length > 0) return { state: "inconclusive", lead: strongest(inconclusive), more: 0 };
  return { state: "clear" };
}
