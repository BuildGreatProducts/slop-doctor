import { NO_SYMPTOM_RX, SYMPTOMS_BY_KEY } from "../../../convex/lib/taxonomy";
import { chart } from "@/lib/copy";
import styles from "./Chart.module.css";

/** Prescriptions in one `note`: the one place orange appears as a rule. */
export function DoctorsNote({ prescriptions }: { prescriptions: string[] }) {
  const lines = prescriptions.length > 0 ? prescriptions.map((k) => SYMPTOMS_BY_KEY[k]?.rx ?? "") : [NO_SYMPTOM_RX];
  return (
    <section aria-labelledby="doctors-note">
      <h2 id="doctors-note" className="t-title-md section-title">
        {chart.prescriptionHeading}
      </h2>
      <div className={`note ${styles.notes}`}>
        {lines.map((line, i) => (
          <div key={i}>
            <div className="note-meta mono muted">{chart.prescriptionSignature(i + 1)}</div>
            {line}
          </div>
        ))}
      </div>
    </section>
  );
}
