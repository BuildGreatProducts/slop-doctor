import { describe, expect, test } from "vitest";
import { share } from "../src/lib/copy";
import { chartUrl, downloadName, linkedInShareUrl, shareImageUrl, topSymptoms, xShareUrl } from "../src/lib/share";

describe("share links", () => {
  const url = chartUrl("https://www.slopdoctor.app", "k123");
  const text = share.text("example.com", "Code Purple", 98);

  test("chart and image URLs", () => {
    expect(url).toBe("https://www.slopdoctor.app/chart/k123");
    expect(shareImageUrl("k123")).toBe("/chart/k123/opengraph-image");
  });

  test("X gets the text and the link, encoded", () => {
    const x = new URL(xShareUrl(text, url));
    expect(x.origin + x.pathname).toBe("https://x.com/intent/post");
    expect(x.searchParams.get("text")).toBe(
      "Dr. Slop diagnosed example.com with Code Purple (Slop Index 98). Get your landing page examined:",
    );
    expect(x.searchParams.get("url")).toBe(url);
  });

  test("LinkedIn gets the link", () => {
    const l = new URL(linkedInShareUrl(url));
    expect(l.origin + l.pathname).toBe("https://www.linkedin.com/sharing/share-offsite/");
    expect(l.searchParams.get("url")).toBe(url);
  });

  test("download names are safe filenames", () => {
    expect(downloadName("www.example.co.uk")).toBe("slop-chart-www.example.co.uk.png");
    expect(downloadName("a/b c")).toBe("slop-chart-a-b-c.png");
  });
});

describe("topSymptoms", () => {
  const f = (key: string, probability: number, kind: "symptom" | "vital" = "symptom") => ({ key, kind, probability });

  test("prefers visual symptoms at their best score, and ignores vital signs", () => {
    expect(
      topSymptoms([
        f("glow_orbs", 0.5),
        f("glow_orbs", 0.97),
        f("sparkle", 0.6),
        f("product_ui", 0.99, "vital"),
        f("bento", 0.1),
        f("lorem", 1),
        f("em_dash", 1),
      ]),
    ).toEqual([
      { key: "glow_orbs", name: "Aura Glowmatosis", p: 0.97 },
      { key: "sparkle", name: "Sparkle Infection", p: 0.6 },
      { key: "bento", name: "Bento Box Disorder", p: 0.1 },
    ]);
  });

  test("tops up with copy and lab symptoms when there aren't three visual ones", () => {
    expect(topSymptoms([f("glow_orbs", 0.3), f("lorem", 1), f("vague_value", 0.7), f("em_dash", 0)]).map((s) => s.key)).toEqual([
      "glow_orbs",
      "lorem",
      "vague_value",
    ]);
  });
});
