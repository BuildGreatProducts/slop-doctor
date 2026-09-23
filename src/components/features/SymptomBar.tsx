import { scanner } from "@/lib/copy";
import { barTone } from "@/lib/findings";

/** A symptom's score as a short bar and a percentage. The fill grows in once, when the bar first renders. */
export function SymptomBar({ p }: { p: number }) {
  const pct = Math.round(p * 100);
  return (
    <span className="symptom-bar">
      <span className="symptom-bar-track" aria-hidden>
        <span className={`symptom-bar-fill is-${barTone(p)}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="symptom-bar-value">{scanner.percent(p)}</span>
    </span>
  );
}
