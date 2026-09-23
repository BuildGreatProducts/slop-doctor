"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { intake, waitingRoom } from "@/lib/copy";
import styles from "./Intake.module.css";

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeTime(ms: number): string {
  const minutes = Math.round((ms - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export function PatientRecords() {
  const rows = useQuery(api.scans.mine);
  if (rows === undefined) return null;
  return (
    <section aria-labelledby="records" className={styles.records}>
      <h2 id="records" className="t-title-md section-title">
        {intake.recordsHeading}
      </h2>
      {rows.length === 0 ? (
        <p className="t-body-sm muted">{intake.recordsEmpty}</p>
      ) : (
        <ul className="list">
          {rows.map((r) => (
            <li key={r._id}>
              <Link href={`/chart/${r._id}`} className={`list-item ${styles.record}`}>
                <span className="t-label-md">{r.host}</span>
                <span className="mono">
                  {r.status === "complete" && r.slopIndex !== undefined
                    ? intake.recordSlopIndex(r.slopIndex)
                    : r.status === "failed"
                      ? "Failed"
                      : waitingRoom.stages[r.status].readout}
                </span>
                <span className="mono muted">{relativeTime(r.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
