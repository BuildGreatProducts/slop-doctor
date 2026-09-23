// Seeds a recorded examination of scripts/fixtures/sloppy.html into the dev deployment.
// Usage: pnpm seed:fixture [--live]
// --live replays it over ~15 s so the waiting room and scanner can be watched; otherwise it completes at once.
// The screenshot and region boxes are real (Playwright + DOM); region descriptions and Jev answers are recorded by hand.

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { regionQuestions } from "../convex/lib/jevQuestions";
import { runLabs } from "../convex/lib/labs";
import { bandFor } from "../convex/lib/scoring";
import type { RegionKind } from "../convex/lib/taxonomy";

const live = process.argv.includes("--live");
const convexRun = (fn: string, args: object) =>
  JSON.parse(execFileSync("npx", ["convex", "run", fn, JSON.stringify(args)], { encoding: "utf8" }).trim());

const REGIONS = [
  { sel: "nav", kind: "nav", description: "Dark near-black bar. Wordmark with a ✨ sparkle emoji on the left; grey links and a purple-to-violet gradient button with a violet glow on the right." },
  { sel: "header.hero", kind: "hero", description: "Near-black background with a faint grid line pattern and a large blurred violet orb glowing behind the text. A rounded pill badge above the headline reads '✨ New: AI-powered workflows'. Centred headline in a sans-serif, with one italic serif word and one word filled with an indigo-to-pink gradient. Centred grey subheading. Two centred buttons: an indigo-to-purple gradient button with a violet glow and a ghost button." },
  { sel: ".logos", kind: "logos", description: "A row of five greyed-out wordmark logos (ACME, Globex, Initech, Umbrella, Hooli) that look like placeholder company names." },
  { sel: "section:nth-of-type(1)", kind: "features", description: "Centred heading. Three identical cards side by side, translucent frosted panels with a thin border, a violet left edge, and an emoji icon (⚡, 🔒, 🚀) inside a small rounded square at the top of each card." },
  { sel: ".stats", kind: "stats", description: "A row of three large statistics filled with an indigo-to-pink gradient: '10k+ Teams', '99.9% Uptime', '5x Faster'." },
  { sel: "section:nth-of-type(3)", kind: "steps", description: "Centred heading 'Get started in 3 simple steps' and three columns numbered 1, 2, 3 in indigo circles." },
  { sel: ".cta", kind: "cta", description: "Large rounded panel with an indigo-to-purple gradient background and a purple glow. Centred heading and the slogan 'Fast. Simple. Powerful.'" },
  { sel: "footer", kind: "footer", description: "Dark footer with grey copyright text containing lorem ipsum." },
] as const;

// Recorded Jev answers, by region kind: [symptom key, probability].
const REGION_ANSWERS: Record<string, [string, number][]> = {
  nav: [["sparkle", 0.93], ["purple_gradient", 0.71], ["glow_orbs", 0.55]],
  hero: [["purple_gradient", 0.94], ["glow_orbs", 0.97], ["pill_badge", 0.96], ["centered_hero", 0.95], ["gradient_text", 0.9], ["serif_accent", 0.82], ["grid_bg", 0.77], ["sparkle", 0.88]],
  logos: [["logo_wall", 0.86]],
  features: [["triplets", 0.93], ["icon_tiles", 0.84], ["glassmorphism", 0.72], ["accent_border", 0.8], ["emoji_icons", 0.9]],
  stats: [["stat_banner", 0.95], ["purple_gradient", 0.58]],
  steps: [["numbered_steps", 0.97]],
  cta: [["purple_gradient", 0.96], ["glow_orbs", 0.81]],
  footer: [],
};

const WEIGHTS: Record<string, number> = {
  purple_gradient: 3, gradient_text: 2, glow_orbs: 2, glassmorphism: 2, bento: 2, sparkle: 1, emoji_icons: 1,
  pill_badge: 2, centered_hero: 2, serif_accent: 1, logo_wall: 1, icon_tiles: 2, triplets: 2, accent_border: 1,
  numbered_steps: 1, stat_banner: 1, grid_bg: 1, stock_3d: 1, dark_default: 2, vague_value: 2, rule_of_three: 1,
  not_x_but_y: 1,
};

const band = bandFor;
// Every other applicable check gets a low, stable score, as a real run records them all.
const lowScore = (key: string, regionId: string) =>
  0.02 + ([...(key + regionId)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % 15) / 100;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const file = resolve("scripts/fixtures/sloppy.html");
  await page.goto(pathToFileURL(file).href);
  const shot = await page.screenshot({ fullPage: true, type: "jpeg", quality: 80 });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const boxes = await Promise.all(
    REGIONS.map((r) =>
      page.locator(r.sel).first().evaluate((el) => {
        const b = el.getBoundingClientRect();
        return { x: b.left, y: b.top + window.scrollY, w: b.width, h: b.height };
      }),
    ),
  );
  const markdown = await page.evaluate(() => document.body.innerText);
  const html = await page.content();
  await browser.close();

  const uploadUrl: string = convexRun("devFixtures:uploadUrl", {});
  const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: new Uint8Array(shot) });
  const { storageId } = (await res.json()) as { storageId: string };

  const round4 = (n: number) => Math.round(n * 10000) / 10000;
  const regions = REGIONS.map((r, i) => ({
    id: `r${String(i + 1).padStart(2, "0")}`,
    kind: r.kind,
    box: { x: round4(boxes[i].x / 1440), y: round4(boxes[i].y / height), w: round4(boxes[i].w / 1440), h: round4(boxes[i].h / height) },
    description: r.description,
    visibleText: "",
  }));
  const regionFindings = regions.flatMap((r) => {
    const recorded = new Map(REGION_ANSWERS[r.kind]);
    return Object.keys(regionQuestions(r.kind as RegionKind)).map((key) => {
      const p = recorded.get(key) ?? lowScore(key, r.id);
      return { key, kind: "symptom" as const, source: "exam" as const, regionId: r.id, probability: p, band: band(p), weight: WEIGHTS[key] };
    });
  });
  const pageFindings = (
    [["dark_default", 0.92], ["vague_value", 0.88], ["rule_of_three", 0.79], ["not_x_but_y", 0.74]] as [string, number][]
  ).map(([key, p]) => ({ key, kind: "symptom" as const, source: "exam" as const, probability: p, band: band(p), weight: WEIGHTS[key] }));

  const fonts = ["Inter", "Instrument Serif"];
  const labs = runLabs({ markdown, html, host: "synergize.example.com", fonts });

  const scanId: string = convexRun("devFixtures:seed", {
    url: "https://synergize.example.com",
    storageId,
    width: 1440,
    height,
    pageTitle: "Synergize AI: Unlock the future of work",
    signals: { fonts, palette: ["near-black", "indigo", "violet", "purple", "pink", "grey"], colourScheme: "dark", ...labs.signals },
    labFindings: labs.findings,
    regions,
    regionFindings,
    pageFindings,
    determinations: {
      archetype: { choice: "saas_clone", confidence: 0.81, probabilities: { saas_clone: 0.86, crypto_fever: 0.08, demo_day: 0.06 } },
      birthplace: { choice: "lovable", confidence: 0.62, probabilities: { lovable: 0.7, v0: 0.18, tailwind_starter: 0.12 } },
      birthplaceConfirmed: false,
      prognosis: { choice: "terminal", confidence: 0.77, probabilities: { terminal: 0.82, chronic: 0.18 } },
      templatedness: { score: 3.8, confidence: 0.84 },
      copyTemperament: { score: 2.9, confidence: 0.8 },
    },
    live,
  });
  console.log(scanId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
