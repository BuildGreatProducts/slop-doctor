// Deterministic lab tests over the page's markdown, HTML and fonts (docs/SLOP-TAXONOMY.md § Lab symptoms).

import {
  BUZZWORD_MIN_DISTINCT,
  BUZZWORDS,
  DEFAULT_FONTS,
  EM_DASH_MIN_COUNT,
  EM_DASH_MIN_PER_100_WORDS,
  GENERATOR_FINGERPRINTS,
  LOREM_PHRASES,
  SYMPTOMS_BY_KEY,
  TREND_FONTS,
} from "./taxonomy";

export type FindingInput = {
  key: string;
  kind: "symptom" | "vital";
  source: "lab" | "exam";
  regionId?: string;
  probability: number;
  band: "present" | "inconclusive" | "absent";
  weight: number;
};

export type LabSignals = {
  wordCount: number;
  emDashCount: number;
  buzzwordHits: string[];
  loremHits: string[];
  generator?: string;
  copyExcerpt: string;
};

const COPY_EXCERPT_CHARS = 4000;
// Page-controlled input: cap it before any regex runs.
const MAX_MARKDOWN_CHARS = 200_000;
const MAX_HTML_CHARS = 256_000;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-phrase, case-insensitive. Word boundaries only where the phrase starts or ends with a word character.
function phraseRegExp(phrase: string): RegExp {
  const start = /^\w/.test(phrase) ? "\\b" : "";
  const end = /\w$/.test(phrase) ? "\\b" : "";
  return new RegExp(`${start}${escapeRegExp(phrase).replace(/'/g, "['’]")}${end}`, "i");
}

export function plainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]{0,300}\]\([^)]{0,500}\)/g, " ") // images
    .replace(/\[([^\]]{0,300})\]\([^)]{0,500}\)/g, "$1") // links → text
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`|]/g, " ");
}

export function countWords(markdown: string): number {
  return plainText(markdown).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

const normalizeFont = (f: string) => f.trim().replace(/^["']|["']$/g, "").toLowerCase();
const inList = (font: string, list: string[]) => list.some((f) => f.toLowerCase() === normalizeFont(font));

/** A lab test is binary: found (100%) or not found (0%). Both are recorded so the chart shows every test. */
function symptom(key: string, found: boolean): FindingInput {
  return {
    key,
    kind: "symptom",
    source: "lab",
    probability: found ? 1 : 0,
    band: found ? "present" : "absent",
    weight: SYMPTOMS_BY_KEY[key].weight,
  };
}

export function detectGenerator(html: string, host: string): string | undefined {
  const head = html.slice(0, MAX_HTML_CHARS);
  return GENERATOR_FINGERPRINTS.find((g) => g.hosts.some((h) => h.test(host)) || g.html.some((p) => p.test(head)))
    ?.birthplace;
}

export function runLabs(input: { markdown: string; html: string; host: string; fonts: string[] }): {
  signals: LabSignals;
  findings: FindingInput[];
} {
  const markdown = input.markdown.slice(0, MAX_MARKDOWN_CHARS);
  const text = plainText(markdown);
  const wordCount = countWords(markdown);
  const emDashCount = (markdown.match(/—/g) ?? []).length;
  const buzzwordHits = BUZZWORDS.filter((b) => phraseRegExp(b).test(text));
  const loremHits = LOREM_PHRASES.filter((p) => phraseRegExp(p).test(text));
  const generator = detectGenerator(input.html, input.host);

  const findings: FindingInput[] = [];
  const emDashRate = wordCount > 0 ? (emDashCount / wordCount) * 100 : 0;
  findings.push(symptom("em_dash", emDashCount >= EM_DASH_MIN_COUNT && emDashRate >= EM_DASH_MIN_PER_100_WORDS));
  findings.push(symptom("buzzwords", buzzwordHits.length >= BUZZWORD_MIN_DISTINCT));
  findings.push(symptom("lorem", loremHits.length > 0));

  const primary = input.fonts[0];
  if (primary !== undefined) {
    findings.push(symptom("inter_itis", inList(primary, DEFAULT_FONTS)));
    findings.push(symptom("font_fashion", input.fonts.some((f) => inList(f, TREND_FONTS))));
    if (!inList(primary, DEFAULT_FONTS) && !inList(primary, TREND_FONTS)) {
      findings.push({
        key: "distinctive_type",
        kind: "vital",
        source: "lab",
        probability: 1,
        band: "present",
        weight: 0,
      });
    }
  }

  return {
    signals: {
      wordCount,
      emDashCount,
      buzzwordHits,
      loremHits,
      generator,
      copyExcerpt: markdown.slice(0, COPY_EXCERPT_CHARS),
    },
    findings,
  };
}
