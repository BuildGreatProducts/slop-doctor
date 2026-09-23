import { intake } from "@/lib/copy";
import styles from "./Intake.module.css";

/** What you get: the share card of a made-up, very sloppy patient, drawn by /example-chart.png. */
export function ExampleReport() {
  return (
    <figure className={styles.example}>
      <span className="mono muted">{intake.exampleLabel}</span>
      <div className={styles.exampleFrame}>
        {/* A static PNG generated at build time; next/image would only re-encode it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.exampleImage} src="/example-chart.png" alt={intake.exampleAlt} width={1200} height={630} />
      </div>
      <figcaption className="t-body-sm muted">{intake.exampleCaption}</figcaption>
    </figure>
  );
}
