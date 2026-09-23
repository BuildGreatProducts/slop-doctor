"use client";

import { SYMPTOMS_BY_KEY, type SymptomGroup, type TierKey } from "../../../convex/lib/taxonomy";
import { chart, regionKindLabels, tiers } from "@/lib/copy";
import { type Determination, describeDeterminations } from "@/lib/determinations";
import { findingName } from "@/lib/findings";
import type { Finding, PublicScan } from "@/lib/types";
import styles from "./Chart.module.css";
import { DoctorsNote } from "./DoctorsNote";
import { Scanner } from "./Scanner";
import { SlopOMeter } from "./SlopOMeter";
import { SymptomBar } from "./SymptomBar";

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

type Row = { key: string; name: string; p: number; where: string[]; weight: number };

/** Every symptom checked, one row each at its highest score across the page, highest first. */
function groupRows(findings: Finding[], regionKinds: Map<string, string>): Record<SymptomGroup, Row[]> {
  const rows = new Map<string, Row>();
  for (const f of findings) {
    if (f.kind !== "symptom") continue;
    const row = rows.get(f.key) ?? { key: f.key, name: findingName(f.key), p: 0, where: [], weight: f.weight };
    row.p = Math.max(row.p, f.probability);
    const kind = f.regionId ? regionKinds.get(f.regionId) : undefined;
    const label = kind ? (regionKindLabels[kind] ?? kind) : undefined;
    if (label && f.band !== "absent" && !row.where.includes(label)) row.where.push(label);
    rows.set(f.key, row);
  }
  const groups: Record<SymptomGroup, Row[]> = { visual: [], copy: [], lab: [] };
  for (const row of rows.values()) groups[SYMPTOMS_BY_KEY[row.key]?.group ?? "visual"].push(row);
  for (const g of Object.values(groups)) g.sort((a, b) => b.p - a.p || b.weight - a.weight);
  return groups;
}

function DeterminationCard({ label, value }: { label: string; value: Determination }) {
  return (
    <div className="card">
      <span className="mono muted">{label}</span>
      <p className="t-title-md">{value.name}</p>
      <p className="t-body-sm">{value.line}</p>
      {value.meta && <span className="mono muted">{value.meta}</span>}
      {value.note && <span className="t-body-sm muted">{value.note}</span>}
    </div>
  );
}

export function Chart({ scan, findings, cached, fallbackLink, onCopyLink, onSecondOpinion, onExamineAnother }: Props) {
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
                    <li key={row.key} className={`list-item ${styles.row}`}>
                      <span className="t-label-md">{row.name}</span>
                      <span className="mono muted">{row.where.join(" · ")}</span>
                      <SymptomBar p={row.p} />
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
