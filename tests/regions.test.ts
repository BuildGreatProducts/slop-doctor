import { expect, test } from "vitest";
import { normalizeRegions } from "../convex/lib/regions";

test("converts box_2d to 0–1 boxes, sorts by y and assigns ids", () => {
  const regions = normalizeRegions([
    { kind: "features", box_2d: [400, 0, 700, 1000], description: "Cards", visibleText: "Fast" },
    { kind: "hero", box_2d: [50, 100, 380, 900], description: "Hero", visibleText: "Build" },
  ]);
  expect(regions).toEqual([
    { id: "r01", kind: "hero", box: { x: 0.1, y: 0.05, w: 0.8, h: 0.33 }, description: "Hero", visibleText: "Build" },
    { id: "r02", kind: "features", box: { x: 0, y: 0.4, w: 1, h: 0.3 }, description: "Cards", visibleText: "Fast" },
  ]);
});

test("clamps out-of-range coordinates and drops empty boxes", () => {
  const regions = normalizeRegions([
    { kind: "hero", box_2d: [-20, -5, 300, 1200] },
    { kind: "cta", box_2d: [500, 0, 500, 1000] },
    { kind: "footer", box_2d: [1, 2, 3] },
  ]);
  expect(regions).toHaveLength(1);
  expect(regions[0].box).toEqual({ x: 0, y: 0, w: 1, h: 0.3 });
});

test("unknown kinds become other", () => {
  expect(normalizeRegions([{ kind: "carousel", box_2d: [0, 0, 100, 1000] }])[0].kind).toBe("other");
});

test("caps at 10 regions and truncates text", () => {
  const raw = Array.from({ length: 14 }, (_, i) => ({
    kind: "other",
    box_2d: [i * 70, 0, i * 70 + 60, 1000],
    description: "d".repeat(2000),
    visibleText: "t".repeat(900),
  }));
  const regions = normalizeRegions(raw);
  expect(regions).toHaveLength(10);
  expect(regions[9].id).toBe("r10");
  expect(regions[0].description).toHaveLength(1200);
  expect(regions[0].visibleText).toHaveLength(600);
});

test("falls back to one full-page region when nothing is usable", () => {
  expect(normalizeRegions([])).toEqual([
    { id: "r01", kind: "other", box: { x: 0, y: 0, w: 1, h: 1 }, description: "", visibleText: "" },
  ]);
});
