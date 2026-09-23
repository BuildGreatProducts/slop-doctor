import { academy } from "@/lib/copy";
import styles from "./Chart.module.css";
import { PencilDoctor } from "./PencilDoctor";

/** The chart's closing call to action: a referral to the AI Product Academy, in the header's paper-grid band. */
export function AcademyReferral() {
  return (
    <aside className={`panel-grid ${styles.referral}`} aria-labelledby="academy-referral">
      <div className={styles.referralText}>
        <span className="mono">{academy.eyebrow}</span>
        <h2 id="academy-referral" className="t-headline-lg">
          {academy.headline}
        </h2>
        <p className="t-body-lg muted">{academy.body}</p>
        <div>
          <a className="btn btn-primary" href={academy.href} target="_blank" rel="noopener noreferrer">
            {academy.button}
          </a>
        </div>
      </div>
      <div className={styles.referralDoctor}>
        <PencilDoctor size={160} />
      </div>
    </aside>
  );
}
