import { SYMPTOMS_BY_KEY, VITAL_SIGNS_BY_KEY } from "../../convex/lib/taxonomy";
import type { Finding } from "./types";

export function findingName(key: string): string {
  return SYMPTOMS_BY_KEY[key]?.name ?? VITAL_SIGNS_BY_KEY[key]?.name ?? key;
}

/** The finding a region's tag names: highest weight × p among present symptoms, else the strongest inconclusive one. */
export function regionHeadline(findings: Finding[]): { lead: Finding; more: number; inconclusive: boolean } | null {
  const symptoms = findings.filter((f) => f.kind === "symptom");
  const present = symptoms.filter((f) => f.band === "present");
  const pool = present.length > 0 ? present : symptoms;
  if (pool.length === 0) return null;
  const lead = [...pool].sort((a, b) => b.weight * b.probability - a.weight * a.probability)[0];
  return { lead, more: present.length > 0 ? present.length - 1 : 0, inconclusive: present.length === 0 };
}
