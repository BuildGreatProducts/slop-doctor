"use client";

import { useConvexAuth } from "convex/react";
import { intake } from "@/lib/copy";
import styles from "./Intake.module.css";
import { PatientRecords } from "./PatientRecords";
import { PencilDoctor } from "./PencilDoctor";
import { UrlIntakeForm } from "./UrlIntakeForm";

export function Intake({ initialUrl, openSignIn }: { initialUrl: string; openSignIn: boolean }) {
  const { isAuthenticated } = useConvexAuth();
  return (
    <div className={`frame ${styles.page}`}>
      <section className={`panel-grid ${styles.band}`}>
        <div className={styles.bandText}>
          <span className="mono">{intake.eyebrow}</span>
          <h1 className="t-display-lg">{intake.headline}</h1>
          <p className="t-body-lg muted">{intake.subhead}</p>
        </div>
        <div className={styles.doctor}>
          <PencilDoctor size={160} />
        </div>
      </section>
      {/* The paper grid never sits behind a form (docs/DESIGN.md § Layout & Spacing). */}
      <div className={styles.formArea}>
        <UrlIntakeForm initialUrl={initialUrl} openSignIn={openSignIn} />
      </div>
      {isAuthenticated && <PatientRecords />}
    </div>
  );
}
