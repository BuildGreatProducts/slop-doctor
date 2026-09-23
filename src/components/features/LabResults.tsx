import { scanner } from "@/lib/copy";
import { findingName } from "@/lib/findings";
import type { Finding } from "@/lib/types";
import styles from "./Examination.module.css";

export function LabResults({ revealed }: { revealed: Finding[] }) {
  const latest = revealed.at(-1);
  return (
    <section aria-labelledby="lab-results">
      <h2 id="lab-results" className="t-title-md section-title">
        {scanner.labResultsHeading}
      </h2>
      {revealed.length === 0 ? (
        <p className="t-body-sm muted">{scanner.labResultsEmpty}</p>
      ) : (
        <ul className={`list ${styles.results}`}>
          {revealed.map((f) => (
            <li key={f._id} className={`list-item ${styles.resultRow}`}>
              <span className="t-label-md">{findingName(f.key)}</span>
              <span className="chip chip-sm">{f.source === "lab" ? scanner.sourceLab : scanner.sourceExam}</span>
              <span className="mono">{f.band === "present" ? scanner.probability(f.probability) : scanner.inconclusive}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="visually-hidden" aria-live="polite">
        {latest ? findingName(latest.key) : ""}
      </p>
    </section>
  );
}
