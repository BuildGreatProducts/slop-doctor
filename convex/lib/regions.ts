// Normalizes Gemini's regions (docs/PRD.md FR-006). Pure.

import { REGION_KINDS, type RegionKind } from "./taxonomy";

export type RawRegion = { kind?: string; box_2d?: number[]; description?: string; visibleText?: string };

export type Region = {
  id: string;
  kind: RegionKind;
  box: { x: number; y: number; w: number; h: number };
  description: string;
  visibleText: string;
};

const MAX_REGIONS = 10;
const MAX_DESCRIPTION = 1200;
const MAX_VISIBLE_TEXT = 600;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const round4 = (n: number) => Math.round(n * 10000) / 10000;

/** Gemini box_2d is [ymin, xmin, ymax, xmax] in 0–1000. */
export function normalizeRegions(raw: RawRegion[]): Region[] {
  const regions = raw
    .map((r) => {
      const b = r.box_2d;
      if (!Array.isArray(b) || b.length !== 4 || b.some((n) => typeof n !== "number" || !Number.isFinite(n))) return null;
      const [ymin, xmin, ymax, xmax] = b.map((n) => clamp01(n / 1000));
      if (ymax <= ymin || xmax <= xmin) return null;
      const kind = REGION_KINDS.includes(r.kind as RegionKind) ? (r.kind as RegionKind) : "other";
      return {
        kind,
        box: { x: round4(xmin), y: round4(ymin), w: round4(xmax - xmin), h: round4(ymax - ymin) },
        description: (r.description ?? "").slice(0, MAX_DESCRIPTION),
        visibleText: (r.visibleText ?? "").slice(0, MAX_VISIBLE_TEXT),
      };
    })
    .filter((r): r is Omit<Region, "id"> => r !== null)
    .sort((a, b) => a.box.y - b.box.y)
    .slice(0, MAX_REGIONS)
    .map((r, i) => ({ id: `r${String(i + 1).padStart(2, "0")}`, ...r }));

  if (regions.length > 0) return regions;
  return [
    {
      id: "r01",
      kind: "other",
      box: { x: 0, y: 0, w: 1, h: 1 },
      description: (raw[0]?.description ?? "").slice(0, MAX_DESCRIPTION),
      visibleText: (raw[0]?.visibleText ?? "").slice(0, MAX_VISIBLE_TEXT),
    },
  ];
}
