// Sharing a chart: its link, the post text and each network's share URL (docs/PRD.md FR-021).
import { SYMPTOMS_BY_KEY } from "../../convex/lib/taxonomy";
import { findingName } from "./findings";
import type { Finding } from "./types";

export const chartUrl = (origin: string, scanId: string) => `${origin}/chart/${scanId}`;
export const shareImageUrl = (scanId: string) => `/chart/${scanId}/opengraph-image`;

/** X's prefilled post composer. The link unfurls into the chart's share image. */
export const xShareUrl = (text: string, url: string) =>
  `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

/** LinkedIn only takes the link; the post shows the chart's share image as its preview. */
export const linkedInShareUrl = (url: string) =>
  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

export const downloadName = (host: string) => `slop-chart-${host.replace(/[^a-z0-9.-]+/gi, "-")}.png`;

/**
 * The share card's headline symptoms: the highest-scoring visual symptoms (it's a picture of a page), topped up
 * with copy and lab symptoms only if there aren't enough visual ones. One row per symptom, at its best score.
 */
export function topSymptoms(findings: Pick<Finding, "key" | "kind" | "probability">[], count = 3) {
  const best = new Map<string, number>();
  for (const f of findings) {
    if (f.kind !== "symptom") continue;
    best.set(f.key, Math.max(best.get(f.key) ?? 0, f.probability));
  }
  const isVisual = (key: string) => (SYMPTOMS_BY_KEY[key]?.group === "visual" ? 1 : 0);
  return [...best.entries()]
    .sort((a, b) => isVisual(b[0]) - isVisual(a[0]) || b[1] - a[1])
    .slice(0, count)
    .map(([key, p]) => ({ key, name: findingName(key), p }));
}
