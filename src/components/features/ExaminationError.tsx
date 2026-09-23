import { errors } from "@/lib/copy";
import { PencilDoctor } from "./PencilDoctor";
import styles from "./Chart.module.css";

type Key = "capture_failed" | "examine_failed" | "diagnose_failed" | "generic" | "not_found";

export function ExaminationError({
  error,
  onPrimary,
  primaryLabel,
}: {
  error: Key;
  onPrimary: () => void;
  primaryLabel?: string;
}) {
  const copy = errors[error];
  return (
    <div className={styles.errorBlock}>
      <PencilDoctor size={120} />
      <div className="banner-error" role="alert">
        <span className="banner-title">{copy.title}</span>
        <p>{copy.message}</p>
        <button type="button" className="btn btn-secondary" onClick={onPrimary}>
          {primaryLabel ?? copy.action}
        </button>
      </div>
    </div>
  );
}
