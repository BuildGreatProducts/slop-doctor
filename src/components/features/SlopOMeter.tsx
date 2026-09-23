import { scanner } from "@/lib/copy";
import { barTone } from "@/lib/findings";
import styles from "./Examination.module.css";

/** Ten square segments, filled in the score's tone: green, amber or red (docs/DESIGN.md § Slop Doctor mapping). */
export function SlopOMeter({ index }: { index: number }) {
  const filled = Math.ceil(index / 10);
  const tone = barTone(index / 100);
  return (
    <div className={styles.meter}>
      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={index} aria-label="Slop Index">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`rung ${i < filled ? `is-filled tone-${tone}` : "is-hatched"}`} />
        ))}
      </div>
      <span className="mono">{scanner.meterLabel(index)}</span>
    </div>
  );
}
