"use client";

import { SYMPTOMS_BY_KEY, type SymptomGroup, type TierKey } from "../../../convex/lib/taxonomy";
import { chart, regionKindLabels, scanner, share, tiers, treat } from "@/lib/copy";
import { type Determination, describeDeterminations, isHealthy } from "@/lib/determinations";
import { barTone, findingName } from "@/lib/findings";
import type { Finding, PublicScan } from "@/lib/types";
import styles from "./Chart.module.css";
import { AcademyReferral } from "./AcademyReferral";
import { DoctorsNote } from "./DoctorsNote";
import { MoodFace } from "./MoodFace";
import { Scanner } from "./Scanner";
import { SlopOMeter } from "./SlopOMeter";
import { SymptomBar } from "./SymptomBar";
import { VerdictMark } from "./VerdictMark";

type Props = {
  scan: PublicScan;
  findings: Finding[];
  cached?: boolean;
  onShare: () => void;
  onTreat: () => void;
  onSecondOpinion?: () => void;
  onExamineAnother: () => void;
};

type Row = {
  key: string;
  name: string;
  about: string;
  p: number;
  weight: number;
  scope: "region" | "page" | "lab";
  /** Sections where it scored 35% or more, highest first. */
  foundIn: { label: string; p: number }[];
};

/** Every symptom checked, one row each at its highest score across the page, highest first. */
function groupRows(findings: Finding[], regionKinds: Map<string, string>): Record<SymptomGroup, Row[]> {
  const rows = new Map<string, Row>();
  for (const f of findings) {
    if (f.kind !== "symptom") continue;
    const symptom = SYMPTOMS_BY_KEY[f.key];
    const row = rows.get(f.key) ?? {
      key: f.key,
      name: findingName(f.key),
      about: symptom?.about ?? "",
      p: 0,
      weight: f.weight,
      scope: symptom?.scope ?? "region",
      foundIn: [],
    };
    row.p = Math.max(row.p, f.probability);
    const kind = f.regionId ? regionKinds.get(f.regionId) : undefined;
    if (kind && f.band !== "absent") row.foundIn.push({ label: regionKindLabels[kind] ?? kind, p: f.probability });
    rows.set(f.key, row);
  }
  const groups: Record<SymptomGroup, Row[]> = { visual: [], copy: [], lab: [] };
  for (const row of rows.values()) {
    row.foundIn.sort((a, b) => b.p - a.p);
    groups[SYMPTOMS_BY_KEY[row.key]?.group ?? "visual"].push(row);
  }
  for (const g of Object.values(groups)) g.sort((a, b) => b.p - a.p || b.weight - a.weight);
  return groups;
}

function whereText(row: Row): string {
  if (row.scope === "lab") return chart.checkedCode;
  if (row.scope === "page") return chart.checkedWholePage;
  if (row.foundIn.length === 0) return chart.notFoundInSections;
  return chart.foundIn(row.foundIn.map((f) => `${f.label} ${scanner.percent(f.p)}`).join(" · "));
}

/** One symptom: the summary shows its score; expanding it says what the symptom is and where it was found. */
function SymptomRow({ row }: { row: Row }) {
  return (
    <li className={styles.item}>
      <details className={styles.symptom}>
        <summary className={styles.summary}>
          <span className="t-label-md">{row.name}</span>
          <SymptomBar p={row.p} />
          <span className={styles.toggle} aria-hidden />
        </summary>
        <div className={styles.panel}>
          <p className="t-body-sm">{row.about}</p>
          <p className="mono muted">{whereText(row)}</p>
        </div>
      </details>
    </li>
  );
}

function DeterminationCard({ label, value }: { label: string; value: Determination }) {
  return (
    <div className={`card ${styles.determination}`}>
      <div className={styles.determinationText}>
        <span className="mono muted">{label}</span>
        <p className="t-title-md">{value.name}</p>
        <p className="t-body-sm">{value.line}</p>
        {value.meta && <span className="mono muted">{value.meta}</span>}
        {value.note && <span className="t-body-sm muted">{value.note}</span>}
      </div>
      <MoodFace mood={value.mood} />
    </div>
  );
}

export function Chart({ scan, findings, cached, onShare, onTreat, onSecondOpinion, onExamineAnother }: Props) {
  const tier = (scan.tier ?? "clean") as TierKey;
  const regionKinds = new Map((scan.regions ?? []).map((r) => [r.id, r.kind]));
  const groups = groupRows(findings, regionKinds);
  const vitals = findings.filter((f) => f.kind === "vital" && f.band === "present");
  const hasSymptoms = Object.values(groups).some((g) => g.some((r) => r.p >= 0.65));
  const { archetype, birthplace, prognosis } = describeDeterminations(scan.determinations, tier);

  return (
    <div className={styles.chart}>
      {cached && <p className="banner-info t-body-sm">{chart.cachedNote}</p>}

      <header className={`panel-grid ${styles.band}`}>
        <div className={styles.bandText}>
          <h1 className="t-headline-lg">{chart.heading(scan.host)}</h1>
          <p className={`t-title-md ${styles.diagnosis}`}>
            {chart.diagnosisLine(tiers[tier].name)}
            <VerdictMark healthy={isHealthy(tier)} />
          </p>
          <p className="t-body-md muted">{tiers[tier].oneLiner}</p>
        </div>
        <div className={styles.index}>
          <span className="mono muted">{chart.indexLabel}</span>
          <span className={`${styles.figure} tone-${barTone((scan.slopIndex ?? 0) / 100)}`}>{scan.slopIndex ?? 0}</span>
          <SlopOMeter index={scan.slopIndex ?? 0} />
        </div>
      </header>

      <div className={styles.columns}>
        <div className={styles.shotColumn}>
          <Scanner scan={scan} revealed={findings} mode="static" finished reducedMotion />
        </div>

        <div className={styles.details}>
          <div className={styles.cards}>
            <DeterminationCard label={chart.archetypeLabel} value={archetype} />
            <DeterminationCard label={chart.birthplaceLabel} value={birthplace} />
            <DeterminationCard label={chart.prognosisLabel} value={prognosis} />
          </div>

          {!hasSymptoms && <p className="t-body-md">{chart.noSymptoms}</p>}
          {(["visual", "copy", "lab"] as const).map((g) =>
            groups[g].length === 0 ? null : (
              <section key={g} aria-labelledby={`group-${g}`}>
                <h2 id={`group-${g}`} className="t-title-md section-title">
                  {chart.groups[g]}
                </h2>
                <ul className="list">
                  {groups[g].map((row) => (
                    <SymptomRow key={row.key} row={row} />
                  ))}
                </ul>
              </section>
            ),
          )}

          <section aria-labelledby="vital-signs">
            <h2 id="vital-signs" className="t-title-md section-title">
              {chart.vitalSignsHeading}
            </h2>
            {vitals.length === 0 ? (
              <p className="t-body-sm muted">{chart.noVitalSigns}</p>
            ) : (
              <ul className={styles.chips}>
                {vitals.map((v) => (
                  <li key={v._id} className="chip">
                    {findingName(v.key)}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <DoctorsNote prescriptions={scan.prescriptions ?? []} />

          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={onShare}>
              {share.button}
            </button>
            {hasSymptoms && (
              <button type="button" className="btn btn-secondary" onClick={onTreat}>
                {treat.button}
              </button>
            )}
            {onSecondOpinion && (
              <button type="button" className="btn btn-ghost" onClick={onSecondOpinion}>
                {chart.secondOpinion}
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onExamineAnother}>
              {chart.examineAnother}
            </button>
          </div>
        </div>
      </div>

      <AcademyReferral />
    </div>
  );
}
