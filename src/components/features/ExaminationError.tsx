import { chart, errors } from "@/lib/copy";
import { PencilDoctor } from "./PencilDoctor";
import styles from "./Chart.module.css";

type Key = "capture_failed" | "examine_failed" | "diagnose_failed" | "generic" | "not_found";

/** A failed or missing examination: what happened, why, and what to do next (docs/COPY.md § Errors). */
export function ExaminationError({
  error,
  onPrimary,
  onExamineAnother,
}: {
  error: Key;
  onPrimary: () => void;
  onExamineAnother?: () => void;
}) {
  const copy = errors[error];
  return (
    <div className={styles.errorBlock}>
      <PencilDoctor size={120} />
      <div className="banner-error" role="alert">
        <h1 className="banner-title">{copy.title}</h1>
        <p>{copy.message}</p>
        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={onPrimary}>
            {copy.action}
          </button>
          {onExamineAnother && (
            <button type="button" className="btn btn-ghost" onClick={onExamineAnother}>
              {chart.examineAnother}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
