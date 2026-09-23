import { describe, expect, test } from "vitest";
import { countWords, detectGenerator, runLabs } from "../convex/lib/labs";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
/** Keys of the lab tests that found something. */
const keys = (r: ReturnType<typeof runLabs>) =>
  r.findings
    .filter((f) => f.band === "present")
    .map((f) => f.key)
    .sort();
const base = { html: "", host: "example.com", fonts: [] as string[] };

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
    expect(r.findings.filter((f) => f.kind === "vital")).toEqual([
      { key: "distinctive_type", kind: "vital", source: "lab", probability: 1, band: "present", weight: 0 },
    ]);
  });

  test("no fonts skips font labs", () => {
    const r = runLabs({ ...base, markdown: "" });
    expect(r.findings.map((f) => f.key)).not.toContain("inter_itis");
    expect(r.findings.map((f) => f.key)).not.toContain("font_fashion");
  });
});

describe("generator fingerprints", () => {
  test.each([
    ['<meta name="generator" content="Lovable">', "example.com", "lovable"],
    ['<script type="module" src="https://cdn.gpteng.co/gptengineer.js"></script>', "example.com", "lovable"],
    ["<html></html>", "my-app.lovable.app", "lovable"],
    ["<html></html>", "calm-otter.bolt.host", "bolt"],
    ['<meta name="generator" content="v0.app">', "example.com", "v0"],
    ["<html></html>", "demo.v0.app", "v0"],
    ['<meta name="generator" content="Framer 3f2a">', "example.com", "framer"],
    ['<img src="https://framerusercontent.com/images/a.png">', "example.com", "framer"],
    ['<meta name="generator" content="Webflow">', "example.com", "webflow"],
    ['<link href="https://cdn.prod.website-files.com/x.css" rel="stylesheet">', "example.com", "webflow"],
    ['<meta name="generator" content="WordPress 6.8">', "example.com", "website_builder"],
    ["<html><body>Hello</body></html>", "example.com", undefined],
  ])("%s on %s → %s", (html, host, expected) => {
    expect(detectGenerator(html, host)).toBe(expected);
  });

  test("an ordinary link to a builder is not evidence", () => {
    expect(detectGenerator('<a href="https://bolt.new">Built with Bolt</a> <a href="https://v0.dev">v0</a>', "example.com")).toBeUndefined();
  });

  test("first match wins", () => {
    expect(detectGenerator('<meta name="generator" content="Framer">', "x.lovable.app")).toBe("lovable");
  });

  test("pathological HTML finishes quickly", () => {
    const html = `<meta ${'name="generator" '.repeat(50_000)}` + "<".repeat(200_000);
    const started = performance.now();
    detectGenerator(html, "example.com");
    runLabs({ markdown: "[".repeat(300_000), html, host: "example.com", fonts: [] });
    expect(performance.now() - started).toBeLessThan(1000);
  });
});

test("every lab test is recorded, found (100%) or not (0%)", () => {
  const r = runLabs({ ...base, markdown: "Invoices for plumbers in Leeds.", fonts: ["Switzer"] });
  const symptoms = r.findings.filter((f) => f.kind === "symptom");
  expect(symptoms.map((f) => [f.key, f.probability, f.band])).toEqual([
    ["em_dash", 0, "absent"],
    ["buzzwords", 0, "absent"],
    ["lorem", 0, "absent"],
    ["inter_itis", 0, "absent"],
    ["font_fashion", 0, "absent"],
  ]);
});

test("countWords strips markdown syntax", () => {
  expect(countWords("# Hello **world**\n\n[Link text](https://x.com) ![img](a.png)")).toBe(4);
});

test("copy excerpt is capped at 4,000 characters", () => {
  expect(runLabs({ ...base, markdown: "a".repeat(5000) }).signals.copyExcerpt).toHaveLength(4000);
});
