// Ordering for the scanner's reveal queue (docs/PRD.md FR-013). Pure so it can be unit tested.

type Revealable = { _id: string; source: "lab" | "exam"; regionId?: string; order: number };
type Rank = [number, number, number];

/** Lab findings first, then region findings in region order, then page-level findings. */
export function revealRank(f: Revealable, regionIndex: Map<string, number>): Rank {
  if (f.source === "lab") return [0, 0, f.order];
  if (f.regionId !== undefined) return [1, regionIndex.get(f.regionId) ?? 999, f.order];
  return [2, 0, f.order];
}

const compare = (a: Rank, b: Rank) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** The next unrevealed finding in reveal order, among those that have arrived so far. */
export function nextToReveal<T extends Revealable>(
  findings: T[],
  revealed: ReadonlySet<string>,
  regionIndex: Map<string, number>,
): T | undefined {
  let best: T | undefined;
  for (const f of findings) {
    if (revealed.has(f._id)) continue;
    if (!best || compare(revealRank(f, regionIndex), revealRank(best, regionIndex)) < 0) best = f;
  }
  return best;
}

export function sortForReveal<T extends Revealable>(findings: T[], regionIndex: Map<string, number>): T[] {
  return [...findings].sort((a, b) => compare(revealRank(a, regionIndex), revealRank(b, regionIndex)));
}
