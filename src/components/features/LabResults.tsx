"use client";

import { useEffect, useRef } from "react";
import { scanner } from "@/lib/copy";
import { findingName } from "@/lib/findings";
import { revealGroup } from "@/lib/revealQueue";
import type { Finding, Region } from "@/lib/types";
import styles from "./Examination.module.css";
import { SymptomBar } from "./SymptomBar";

/**
 * The doctor's checklist, live: every symptom check appears as it's revealed, grouped by the part of the page
 * being examined, with its score as a bar. Low scores are shown too.
 */
export function LabResults({ revealed, regions }: { revealed: Finding[]; regions: Region[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const checks = revealed.filter((f) => f.kind === "symptom");
  const latest = checks.at(-1);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [checks.length]);

  const groups: { key: string; heading: string; rows: Finding[] }[] = [];
  for (const f of checks) {
    const key = revealGroup(f);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, heading: headingFor(key, regions), rows: [] };
      groups.push(group);
    }
    group.rows.push(f);
  }

  return (
    <section aria-labelledby="lab-results">
      <h2 id="lab-results" className="t-title-md section-title">
        {scanner.labResultsHeading}
      </h2>
      {checks.length === 0 ? (
        <p className="t-body-sm muted">{scanner.labResultsEmpty}</p>
      ) : (
        <div ref={listRef} className={styles.results}>
          {groups.map((g) => (
            <div key={g.key} className={styles.resultGroup}>
              <h3 className="mono muted">{g.heading}</h3>
              <ul className="list">
                {g.rows.map((f) => (
                  <li key={f._id} className={`list-item ${styles.resultRow}`}>
                    <span className="t-body-sm">{findingName(f.key)}</span>
                    <SymptomBar p={f.probability} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <p className="visually-hidden" aria-live="polite">
        {latest ? `${findingName(latest.key)} ${scanner.percent(latest.probability)}` : ""}
      </p>
    </section>
  );
}

function headingFor(group: string, regions: Region[]): string {
  if (group === "lab") return scanner.groupLab;
  if (group === "page") return scanner.groupPage;
  const index = regions.findIndex((r) => r.id === group);
  return index >= 0 ? scanner.groupRegion(index + 1, regions[index].kind) : scanner.groupPage;
}
