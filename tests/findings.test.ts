import { describe, expect, test } from "vitest";
import { barTone, regionHeadline } from "../src/lib/findings";
import type { Finding } from "../src/lib/types";

describe("barTone", () => {
  test.each([
    [0, "low"],
    [0.19, "low"],
    [0.194, "low"],
    [0.2, "mid"],
    [0.55, "mid"],
    [0.7, "mid"],
    [0.704, "mid"],
    [0.71, "high"],
    [0.98, "high"],
    [1, "high"],
  ])("%s → %s", (p, tone) => expect(barTone(p)).toBe(tone));
});

const f = (key: string, probability: number, band: Finding["band"], weight = 2): Finding =>
  ({ _id: key, key, kind: "symptom", source: "exam", probability, band, weight }) as unknown as Finding;

describe("regionHeadline", () => {
  test("leads with the strongest present symptom and counts the rest", () => {
    const h = regionHeadline([f("a", 0.9, "present", 1), f("b", 0.8, "present", 3), f("c", 0.1, "absent")]);
    expect(h).toMatchObject({ state: "present", more: 1 });
    expect(h?.state === "present" && h.lead.key).toBe("b");
  });

  test("falls back to the strongest inconclusive symptom", () => {
    const h = regionHeadline([f("a", 0.4, "inconclusive"), f("b", 0.6, "inconclusive"), f("c", 0.1, "absent")]);
    expect(h?.state === "inconclusive" && h.lead.key).toBe("b");
  });

  test("a region with only low scores is clear", () => {
    expect(regionHeadline([f("a", 0.05, "absent"), f("b", 0.2, "absent")])).toEqual({ state: "clear" });
  });

  test("no symptom checks yet means no headline", () => {
    expect(regionHeadline([])).toBeNull();
  });
});
