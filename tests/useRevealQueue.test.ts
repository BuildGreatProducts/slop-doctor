import { describe, expect, test } from "vitest";
import { nextToReveal, revealDelay, sortForReveal } from "../src/lib/revealQueue";

type F = { _id: string; source: "lab" | "exam"; regionId?: string; order: number };
const regionIndex = new Map([
  ["r01", 0],
  ["r02", 1],
  ["r03", 2],
]);

const findings: F[] = [
  { _id: "page", source: "exam", order: 0 },
  { _id: "r03a", source: "exam", regionId: "r03", order: 1 },
  { _id: "lab", source: "lab", order: 2 },
  { _id: "r01a", source: "exam", regionId: "r01", order: 3 },
  { _id: "r01b", source: "exam", regionId: "r01", order: 4 },
];

describe("reveal order", () => {
  test("lab first, then regions top to bottom, then page", () => {
    expect(sortForReveal(findings, regionIndex).map((f) => f._id)).toEqual(["lab", "r01a", "r01b", "r03a", "page"]);
  });

  test("stepping reveals one at a time in order", () => {
    const revealed = new Set<string>();
    const steps: string[] = [];
    for (let f = nextToReveal(findings, revealed, regionIndex); f; f = nextToReveal(findings, revealed, regionIndex)) {
      revealed.add(f._id);
      steps.push(f._id);
    }
    expect(steps).toEqual(["lab", "r01a", "r01b", "r03a", "page"]);
  });

  test("a late arrival for an earlier region is revealed next", () => {
    const revealed = new Set(["lab", "r01a", "r01b"]);
    const withLate = [...findings, { _id: "r02a", source: "exam" as const, regionId: "r02", order: 5 }];
    expect(nextToReveal(withLate, revealed, regionIndex)?._id).toBe("r02a");
  });

  test("nothing left returns undefined", () => {
    expect(nextToReveal(findings, new Set(findings.map((f) => f._id)), regionIndex)).toBeUndefined();
  });
});

describe("reveal pacing", () => {
  const pace = { intervalMs: 160, groupPauseMs: 650 };
  const a = (id: string, regionId?: string, source: "lab" | "exam" = "exam") => ({ _id: id, source, regionId, order: 0 });

  test("the first reveal and every move to a new part of the page pause longer", () => {
    expect(revealDelay(a("x", "r01"), undefined, pace)).toBe(650);
    expect(revealDelay(a("y", "r02"), a("x", "r01"), pace)).toBe(650);
    expect(revealDelay(a("p"), a("x", "r02"), pace)).toBe(650);
    expect(revealDelay(a("x", "r01"), a("l", undefined, "lab"), pace)).toBe(650);
  });

  test("checks within the same region follow quickly", () => {
    expect(revealDelay(a("y", "r01"), a("x", "r01"), pace)).toBe(160);
    expect(revealDelay(a("m", undefined, "lab"), a("l", undefined, "lab"), pace)).toBe(160);
  });
});
