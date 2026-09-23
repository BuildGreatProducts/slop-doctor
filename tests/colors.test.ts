import { describe, expect, test } from "vitest";
import { colorName, paletteFromBranding, schemeFromBranding } from "../convex/lib/colors";

describe("colorName", () => {
  test.each([
    ["#6366F1", "indigo"],
    ["#8B5CF6", "violet"],
    ["#A855F7", "purple"],
    ["#0A0A0A", "near-black"],
    ["#F55200", "orange"],
    ["#22C55E", "green"],
    ["#E5E7EB", "light grey"],
    ["#3B82F6", "blue"],
    ["#EC4899", "pink"],
    ["#EF4444", "red"],
    ["#FFFFFF", "white"],
    ["#6B7280", "grey"],
    ["#374151", "dark grey"],
    ["#C4B5FD", "lavender"],
    ["#fff", "white"],
    ["rgb(99, 102, 241)", "indigo"],
    ["rgba(10,10,10,0.5)", "near-black"],
  ])("%s → %s", (input, name) => {
    expect(colorName(input)).toBe(name);
  });

  test("near-white paper reads as white or cream", () => {
    expect(["white", "cream"]).toContain(colorName("#FDFCFA"));
  });

  test("returns null for unparseable input", () => {
    expect(colorName("not-a-colour")).toBeNull();
    expect(colorName("#12")).toBeNull();
  });
});

describe("paletteFromBranding", () => {
  test("dedupes names and ignores non-colours", () => {
    expect(
      paletteFromBranding({ primary: "#6366F1", accent: "#6366F1", background: "#0A0A0A", note: 3, bad: "x" }),
    ).toEqual(["indigo", "near-black"]);
  });

  test("handles missing colours", () => {
    expect(paletteFromBranding(undefined)).toEqual([]);
  });
});

describe("schemeFromBranding", () => {
  test("uses the declared scheme", () => {
    expect(schemeFromBranding({ colorScheme: "dark" })).toBe("dark");
  });

  test("falls back to background lightness", () => {
    expect(schemeFromBranding({ colors: { background: "#0B0B12" } })).toBe("dark");
    expect(schemeFromBranding({ colors: { background: "#FFFFFF" } })).toBe("light");
  });

  test("unknown without evidence", () => {
    expect(schemeFromBranding(null)).toBe("unknown");
  });
});
