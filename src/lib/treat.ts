// Treating a chart with a coding agent: the prompt and each agent's pre-filled link (docs/PRD.md FR-023).
import { rankSymptoms } from "../../convex/lib/scoring";
import { SYMPTOMS_BY_KEY, type TierKey } from "../../convex/lib/taxonomy";
import { regionKindLabels, scanner, tiers, treat } from "./copy";
import type { Finding, PublicScan } from "./types";

const CURSOR_BASE = "https://cursor.com/link/prompt?text=";

/**
 * The longest a prompt can be once URL-encoded: Cursor's links stop at 10,000 characters, the tightest of the three
 * (Claude's app truncates at about 14,000 decoded). That's roughly 6,500 characters of prompt.
 */
export const MAX_ENCODED_CHARS = 10_000 - CURSOR_BASE.length - 100;

/**
 * A longer patient URL is shortened to its origin. A path can run to thousands of characters once encoded, and it's
 * the one part of the prompt the person who ran the examination chose.
 */
export const MAX_URL_CHARS = 200;

type Input = {
  scan: Pick<PublicScan, "displayUrl" | "tier" | "slopIndex" | "regions">;
  findings: Pick<Finding, "key" | "kind" | "band" | "probability" | "weight" | "regionId">[];
  chartUrl: string;
};

/**
 * Every present symptom, most serious first, as a prompt for a coding agent. Built only from the doctor's own
 * words (taxonomy, section labels, numbers): text from the patient's page never goes in, so a shared chart
 * can't carry instructions into someone's agent.
 */
export function treatmentPrompt({ scan, findings, chartUrl }: Input): string {
  const regionLabels = new Map((scan.regions ?? []).map((r) => [r.id, regionKindLabels[r.kind] ?? r.kind]));

  const where = (key: string) => {
    const scope = SYMPTOMS_BY_KEY[key]?.scope;
    if (scope === "page") return treat.prompt.wholePage;
    if (scope === "lab") return treat.prompt.codeAndCopy;
    const found = findings
      .filter((f) => f.kind === "symptom" && f.key === key && f.band !== "absent")
      .sort((a, b) => b.probability - a.probability)
      .map((f) => (f.regionId ? regionLabels.get(f.regionId) : undefined))
      .filter((label): label is string => !!label);
    return [...new Set(found)].join(", ");
  };

  const blocks = rankSymptoms(findings).map(([key, { p }], i) => {
    const symptom = SYMPTOMS_BY_KEY[key];
    const healthy = symptom?.noul?.whenFalse.replaceAll("`region`", treat.prompt.section);
    return [
      treat.prompt.symptom(i + 1, symptom?.name ?? key, scanner.percent(p), where(key)),
      symptom && treat.prompt.about(symptom.about),
      healthy && treat.prompt.healthy(healthy[0].toUpperCase() + healthy.slice(1)),
      symptom && treat.prompt.rx(symptom.rx),
    ]
      .filter(Boolean)
      .join("\n");
  });

  const tier = tiers[(scan.tier ?? "clean") as TierKey].name;
  const url = scan.displayUrl.length > MAX_URL_CHARS ? new URL(scan.displayUrl).origin : scan.displayUrl;
  // The head is short now, so it and the note on left-over symptoms always fit; the loop keeps room for that note.
  let prompt = treat.prompt.head(url, tier, scan.slopIndex ?? 0, chartUrl);
  let included = 0;
  for (const block of blocks) {
    const left = blocks.length - included - 1;
    const tail = left > 0 ? `\n\n${treat.prompt.more(left)}` : "";
    if (encodeURIComponent(`${prompt}\n\n${block}${tail}`).length > MAX_ENCODED_CHARS) break;
    prompt += `\n\n${block}`;
    included++;
  }
  if (included < blocks.length) prompt += `\n\n${treat.prompt.more(blocks.length - included)}`;
  return prompt;
}

/** The Claude desktop app's Code tab, prompt filled in and not sent. */
export const claudeLink = (prompt: string) => `claude://code/new?q=${encodeURIComponent(prompt)}`;

/** A new Codex chat, prompt filled in and not sent. */
export const codexLink = (prompt: string) => `codex://new?prompt=${encodeURIComponent(prompt)}`;

/** Cursor's web deeplink: opens the app, or a page explaining it when Cursor isn't installed. */
export const cursorLink = (prompt: string) => `${CURSOR_BASE}${encodeURIComponent(prompt)}`;
