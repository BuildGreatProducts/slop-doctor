// Builds Jev states and question maps from the taxonomy, and turns answers into findings (docs/PRD.md § 4).
// SDK-free on purpose: plain objects match the HTTP API shapes, so this stays pure and testable.

import type { FindingInput } from "./labs";
import { bandFor } from "./scoring";
import {
  appliesToKind,
  ARCHETYPE,
  BIRTHPLACE,
  type ChoiceSpec,
  COPY_TEMPERAMENT,
  type NoulSpec,
  PAGE_SYMPTOMS,
  PROGNOSIS,
  type RegionKind,
  type ScoreSpec,
  TEMPLATEDNESS,
  VISUAL_SYMPTOMS,
  VITAL_SIGNS,
} from "./taxonomy";

export type NoulQuestion = { type: "noul"; instructions: string; criteria: { true: string; false: string } };
export type ChoiceQuestion = { type: "choice"; instructions: string; criteria: Record<string, string> };
export type ScoreQuestion = { type: "score"; instructions: string; criteria: [string, string, ...string[]] };
export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export type NoulAnswer = { type: "noul"; noul: number };
export type ChoiceAnswer = { type: "choice"; choice: string; confidence: number; probabilities: Record<string, number> };
export type ScoreAnswer = { type: "score"; score: number; confidence: number; probabilities?: Record<string, number> };
export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export type RegionInput = { id: string; kind: RegionKind; description: string; visibleText: string };
export type SignalsInput = {
  fonts: string[];
  palette: string[];
  colourScheme: "light" | "dark" | "unknown";
  generator?: string;
  copyExcerpt: string;
};

const noul = (spec: NoulSpec): NoulQuestion => ({
  type: "noul",
  instructions: spec.question,
  criteria: { true: spec.whenTrue, false: spec.whenFalse },
});
const choice = (spec: ChoiceSpec): ChoiceQuestion => ({ type: "choice", instructions: spec.question, criteria: spec.options });
const score = (spec: ScoreSpec): ScoreQuestion => ({
  type: "score",
  instructions: spec.question,
  criteria: spec.levels as [string, string, ...string[]],
});

export function regionQuestions(kind: RegionKind): Record<string, NoulQuestion> {
  return Object.fromEntries(
    VISUAL_SYMPTOMS.filter((s) => appliesToKind(s, kind) && s.noul).map((s) => [s.key, noul(s.noul!)]),
  );
}

export function pageQuestions(): Record<string, Question> {
  const questions: Record<string, Question> = {};
  for (const s of PAGE_SYMPTOMS) questions[s.key] = noul(s.noul!);
  for (const v of VITAL_SIGNS) if (v.noul) questions[v.key] = noul(v.noul);
  questions[ARCHETYPE.key] = choice(ARCHETYPE);
  questions[BIRTHPLACE.key] = choice(BIRTHPLACE);
  questions[PROGNOSIS.key] = choice(PROGNOSIS);
  questions[TEMPLATEDNESS.key] = score(TEMPLATEDNESS);
  questions[COPY_TEMPERAMENT.key] = score(COPY_TEMPERAMENT);
  return questions;
}

export function regionState(region: RegionInput, signals: SignalsInput) {
  return {
    region: { kind: region.kind, description: region.description, visible_text: region.visibleText },
    page: { fonts: signals.fonts, palette: signals.palette, colour_scheme: signals.colourScheme },
  };
}

export function pageState(scan: { host: string; pageTitle?: string; signals: SignalsInput; regions: RegionInput[] }) {
  const hero = scan.regions.filter((r) => r.kind === "hero");
  const heroText = (hero.length > 0 ? hero : scan.regions.slice(0, 1)).map((r) => r.visibleText).join("\n");
  return {
    page: {
      host: scan.host,
      title: scan.pageTitle ?? "",
      fonts: scan.signals.fonts,
      palette: scan.signals.palette,
      colour_scheme: scan.signals.colourScheme,
      hero_text: heroText,
      copy: scan.signals.copyExcerpt,
      regions: scan.regions.map((r) => ({ kind: r.kind, description: r.description })),
    },
  };
}

function noulFinding(
  key: string,
  kind: "symptom" | "vital",
  weight: number,
  answer: Answer | undefined,
  regionId?: string,
): FindingInput | null {
  if (!answer || answer.type !== "noul") return null;
  const band = bandFor(answer.noul);
  if (band === "absent") return null;
  return { key, kind, source: "exam", probability: answer.noul, band, weight, ...(regionId ? { regionId } : {}) };
}

export function interpretRegionAnswers(regionId: string, answers: Record<string, Answer>): FindingInput[] {
  return VISUAL_SYMPTOMS.map((s) => noulFinding(s.key, "symptom", s.weight, answers[s.key], regionId)).filter(
    (f): f is FindingInput => f !== null,
  );
}

type ChoiceResult = { choice: string; confidence: number; probabilities: Record<string, number> };

export type Determinations = {
  archetype: ChoiceResult;
  birthplace: ChoiceResult;
  birthplaceConfirmed: boolean;
  prognosis: ChoiceResult;
  templatedness: { score: number; confidence: number };
  copyTemperament: { score: number; confidence: number };
};

function asChoice(a: Answer | undefined): ChoiceResult {
  if (!a || a.type !== "choice") return { choice: "", confidence: 0, probabilities: {} };
  return { choice: a.choice, confidence: a.confidence, probabilities: { ...a.probabilities } };
}

function asScore(a: Answer | undefined): { score: number; confidence: number } {
  if (!a || a.type !== "score") return { score: 0, confidence: 0 };
  return { score: a.score, confidence: a.confidence };
}

export function interpretPageAnswers(
  answers: Record<string, Answer>,
  signals: Pick<SignalsInput, "generator">,
): { findings: FindingInput[]; determinations: Determinations } {
  const findings = [
    ...PAGE_SYMPTOMS.map((s) => noulFinding(s.key, "symptom", s.weight, answers[s.key])),
    ...VITAL_SIGNS.filter((v) => v.noul).map((v) => noulFinding(v.key, "vital", 0, answers[v.key])),
  ].filter((f): f is FindingInput => f !== null);

  let birthplace = asChoice(answers[BIRTHPLACE.key]);
  const confirmed = signals.generator !== undefined && signals.generator in BIRTHPLACE.options;
  if (confirmed) birthplace = { ...birthplace, choice: signals.generator!, confidence: 1 };

  return {
    findings,
    determinations: {
      archetype: asChoice(answers[ARCHETYPE.key]),
      birthplace,
      birthplaceConfirmed: confirmed,
      prognosis: asChoice(answers[PROGNOSIS.key]),
      templatedness: asScore(answers[TEMPLATEDNESS.key]),
      copyTemperament: asScore(answers[COPY_TEMPERAMENT.key]),
    },
  };
}
