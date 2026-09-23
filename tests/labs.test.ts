import { describe, expect, test } from "vitest";
import { countWords, detectGenerator, runLabs } from "../convex/lib/labs";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
const keys = (r: ReturnType<typeof runLabs>) => r.findings.map((f) => f.key).sort();
const base = { html: "", fonts: [] as string[] };

describe("em dash", () => {
  test("3 em dashes in 600 words (0.5 per 100) is present", () => {
    const md = `${words(597)} a — b — c —`;
    const r = runLabs({ ...base, markdown: md });
    expect(r.signals.emDashCount).toBe(3);
    expect(keys(r)).toContain("em_dash");
  });

  test("3 em dashes in 1,000 words is under the rate", () => {
    const md = `${words(997)} a — b — c —`;
    expect(keys(runLabs({ ...base, markdown: md }))).not.toContain("em_dash");
  });

  test("2 em dashes in 20 words is under the count", () => {
    expect(keys(runLabs({ ...base, markdown: `${words(18)} x — y —` }))).not.toContain("em_dash");
  });
});

describe("buzzwords", () => {
  test("3 distinct terms is present", () => {
    const r = runLabs({ ...base, markdown: "Seamless workflows. Unlock growth. Supercharge your team." });
    expect(r.signals.buzzwordHits).toEqual(["seamless", "unlock", "supercharge"]);
    expect(keys(r)).toContain("buzzwords");
  });

  test("2 distinct terms, repeated, is not", () => {
    const r = runLabs({ ...base, markdown: "Seamless. Seamless. Unlock. Unlock." });
    expect(keys(r)).not.toContain("buzzwords");
  });

  test("whole words only", () => {
    const r = runLabs({ ...base, markdown: "unlocking robustness seamlessness" });
    expect(r.signals.buzzwordHits).toEqual([]);
  });

  test("multi-word and apostrophe phrases", () => {
    const r = runLabs({ ...base, markdown: "In today’s fast-paced world, transform your 10x all-in-one stack." });
    expect(r.signals.buzzwordHits).toEqual(["all-in-one", "transform your", "10x", "in today's fast-paced"]);
  });
});

describe("lorem", () => {
  test("any placeholder phrase is present", () => {
    const r = runLabs({ ...base, markdown: "Trusted by Acme Inc and friends" });
    expect(r.signals.loremHits).toEqual(["Acme Inc"]);
    expect(keys(r)).toContain("lorem");
  });

  test("clean copy has none", () => {
    expect(keys(runLabs({ ...base, markdown: "Invoices for plumbers in Leeds." }))).toEqual([]);
  });
});

describe("fonts", () => {
  test("Inter as primary is Inter-itis", () => {
    expect(keys(runLabs({ ...base, markdown: "", fonts: ["Inter", "Geist Mono"] }))).toEqual(["inter_itis"]);
  });

  test("a trend font anywhere is font fashion", () => {
    expect(keys(runLabs({ ...base, markdown: "", fonts: ["Inter", "Instrument Serif"] }))).toEqual([
      "font_fashion",
      "inter_itis",
    ]);
  });

  test("a distinctive primary font is a vital sign", () => {
    const r = runLabs({ ...base, markdown: "", fonts: ['"Switzer"'] });
    expect(r.findings).toEqual([
      { key: "distinctive_type", kind: "vital", source: "lab", probability: 1, band: "present", weight: 0 },
    ]);
  });

  test("no fonts skips font labs", () => {
    expect(keys(runLabs({ ...base, markdown: "" }))).toEqual([]);
  });
});

describe("generator fingerprints", () => {
  test.each([
    ['<a href="https://lovable.dev">Edit with Lovable</a>', "lovable"],
    ['<script src="https://bolt.new/x.js"></script>', "bolt"],
    ['<meta name="generator" content="v0.app">', "v0"],
    ['<meta name="generator" content="Framer 3f2a">', "framer"],
    ['<img src="https://framerusercontent.com/images/a.png">', "framer"],
    ['<meta name="generator" content="Webflow">', "webflow"],
    ['<meta name="generator" content="WordPress 6.8">', "website_builder"],
    ["<html><body>Hello</body></html>", undefined],
  ])("%s → %s", (html, expected) => {
    expect(detectGenerator(html)).toBe(expected);
  });

  test("first match wins", () => {
    expect(detectGenerator('<meta name="generator" content="Framer"> lovable.app')).toBe("lovable");
  });
});

test("countWords strips markdown syntax", () => {
  expect(countWords("# Hello **world**\n\n[Link text](https://x.com) ![img](a.png)")).toBe(4);
});

test("copy excerpt is capped at 4,000 characters", () => {
  expect(runLabs({ ...base, markdown: "a".repeat(5000) }).signals.copyExcerpt).toHaveLength(4000);
});
