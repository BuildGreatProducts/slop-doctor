import { scanner } from "@/lib/copy";
import styles from "./Examination.module.css";

/** Ten square segments; filled ones use inverse-surface, never the orange (docs/DESIGN.md § Slop Doctor mapping). */
export function SlopOMeter({ index }: { index: number }) {
  const filled = Math.ceil(index / 10);
  return (
    <div className={styles.meter}>
      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={index} aria-label="Slop Index">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`rung ${i < filled ? "is-filled" : "is-hatched"}`} />
        ))}
      </div>
      <span className="mono">{scanner.meterLabel(index)}</span>
    </div>
  );
}
