"use client";

import {
  ARCHETYPE_NAMES,
  CONFIDENCE_MIN,
  PROGNOSIS_NAMES,
  PROGNOSIS_TIERS,
  SYMPTOMS_BY_KEY,
  type SymptomGroup,
  type TierKey,
} from "../../../convex/lib/taxonomy";
import { birthplaceLabels, chart, scanner, tiers } from "@/lib/copy";
import { findingName } from "@/lib/findings";
import type { Finding, PublicScan } from "@/lib/types";
import styles from "./Chart.module.css";
import { DoctorsNote } from "./DoctorsNote";
import { Scanner } from "./Scanner";
import { SlopOMeter } from "./SlopOMeter";

type Props = {
  scan: PublicScan;
  findings: Finding[];
  cached?: boolean;
  /** Set when the clipboard is unavailable: the link is shown for copying by hand. */
  fallbackLink?: string | null;
  onCopyLink: () => void;
  onSecondOpinion?: () => void;
  onExamineAnother: () => void;
};

type Row = { key: string; name: string; p: number; present: boolean; where: string[]; weight: number };

function groupRows(findings: Finding[], regionKinds: Map<string, string>): Record<SymptomGroup, Row[]> {
  const rows = new Map<string, Row>();
  for (const f of findings) {
    if (f.kind !== "symptom") continue;
    const row = rows.get(f.key) ?? { key: f.key, name: findingName(f.key), p: 0, present: false, where: [], weight: f.weight };
    if (f.band === "present") row.present = true;
    if (f.band === "present" || !row.present) row.p = Math.max(row.p, f.probability);
    const kind = f.regionId ? regionKinds.get(f.regionId) : undefined;
    if (kind && !row.where.includes(kind)) row.where.push(kind);
    rows.set(f.key, row);
  }
  const groups: Record<SymptomGroup, Row[]> = { visual: [], copy: [], lab: [] };
  for (const row of rows.values()) groups[SYMPTOMS_BY_KEY[row.key]?.group ?? "visual"].push(row);
  const rank = (r: Row) => (r.present ? 1 : 0) * 100 + r.weight * r.p;
  for (const g of Object.values(groups)) g.sort((a, b) => rank(b) - rank(a));
  return groups;
}

export function Chart({ scan, findings, cached, fallbackLink, onCopyLink, onSecondOpinion, onExamineAnother }: Props) {
  const tier = (scan.tier ?? "clean") as TierKey;
  const d = scan.determinations;
  const regionKinds = new Map((scan.regions ?? []).map((r) => [r.id, r.kind]));
  const groups = groupRows(findings, regionKinds);
  const vitals = findings.filter((f) => f.kind === "vital" && f.band === "present");
  const hasSymptoms = Object.values(groups).some((g) => g.length > 0);
  const disagree = d && d.prognosis.confidence >= CONFIDENCE_MIN && !PROGNOSIS_TIERS[d.prognosis.choice]?.includes(tier);

  return (
    <div className={styles.chart}>
      {cached && <p className="banner-info t-body-sm">{chart.cachedNote}</p>}

      <header className={`panel-grid ${styles.band}`}>
        <div className={styles.bandText}>
          <h1 className="t-headline-lg">{chart.heading(scan.host)}</h1>
          <p className="t-title-md">{chart.diagnosisLine(tiers[tier].name)}</p>
          <p className="t-body-md muted">{tiers[tier].oneLiner}</p>
        </div>
        <div className={styles.index}>
          <span className="mono muted">{chart.indexLabel}</span>
          <span className={styles.figure}>{scan.slopIndex ?? 0}</span>
          <SlopOMeter index={scan.slopIndex ?? 0} />
        </div>
      </header>

      <div className={styles.columns}>
        <div className={styles.shotColumn}>
          <Scanner scan={scan} revealed={findings} mode="static" finished reducedMotion />
        </div>

        <div className={styles.details}>
          {d && (
            <div className={styles.cards}>
              <div className="card">
                <span className="mono muted">{chart.archetypeLabel}</span>
                <p className="t-title-md">
                  {d.archetype.confidence >= CONFIDENCE_MIN ? ARCHETYPE_NAMES[d.archetype.choice] : chart.inconclusive}
                </p>
              </div>
              <div className="card">
                <span className="mono muted">{chart.birthplaceLabel}</span>
                {d.birthplaceConfirmed || d.birthplace.confidence >= CONFIDENCE_MIN ? (
                  <>
                    <p className="t-title-md">{birthplaceLabels[d.birthplace.choice] ?? d.birthplace.choice}</p>
                    <span className="mono muted">
                      {d.birthplaceConfirmed ? chart.birthplaceConfirmed : chart.certainty(Math.round(d.birthplace.confidence * 100))}
                    </span>
                  </>
                ) : (
                  <p className="t-title-md">{chart.inconclusive}</p>
                )}
              </div>
              <div className="card">
                <span className="mono muted">{chart.prognosisLabel}</span>
                <p className="t-title-md">
                  {d.prognosis.confidence >= CONFIDENCE_MIN ? PROGNOSIS_NAMES[d.prognosis.choice] : chart.inconclusive}
                </p>
                {disagree && <span className="t-body-sm muted">{chart.disagreement}</span>}
              </div>
            </div>
          )}

          {!hasSymptoms && <p className="t-body-md">{chart.noSymptoms}</p>}
          {(["visual", "copy", "lab"] as const).map((g) =>
            groups[g].length === 0 ? null : (
              <section key={g} aria-labelledby={`group-${g}`}>
                <h2 id={`group-${g}`} className="t-title-md section-title">
                  {chart.groups[g]}
                </h2>
                <ul className="list">
                  {groups[g].map((row) => (
                    <li key={row.key} className={`list-item ${styles.row}`}>
                      <span className="t-label-md">{row.name}</span>
                      <span className="mono muted">{row.where.join(" · ")}</span>
                      <span className="mono">{row.present ? scanner.probability(row.p) : scanner.inconclusive}</span>
                    </li>
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

          {fallbackLink && (
            <div className="field">
              <input
                className="input"
                readOnly
                value={fallbackLink}
                aria-describedby="copy-fallback"
                autoFocus
                onFocus={(e) => e.currentTarget.select()}
              />
              <span id="copy-fallback" className="field-help">
                {chart.copyFallback}
              </span>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={onCopyLink}>
              {chart.copyDischarge}
            </button>
            {onSecondOpinion && (
              <button type="button" className="btn btn-secondary" onClick={onSecondOpinion}>
                {chart.secondOpinion}
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onExamineAnother}>
              {chart.examineAnother}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
