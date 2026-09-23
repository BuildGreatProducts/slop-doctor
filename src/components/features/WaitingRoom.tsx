"use client";

import { useEffect, useState } from "react";
import { type StageKey, waitingRoom } from "@/lib/copy";
import styles from "./Examination.module.css";

const QUIP_MS = 4000;

export function WaitingRoom({ status, reducedMotion }: { status: StageKey; reducedMotion: boolean }) {
  const [quip, setQuip] = useState(0);
  useEffect(() => {
    if (reducedMotion || status === "complete") return;
    const timer = setInterval(() => setQuip((q) => (q + 1) % waitingRoom.quips.length), QUIP_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, status]);

  const current = waitingRoom.stageOrder.indexOf(status);
  const stage = waitingRoom.stages[status];

  return (
    <section className={styles.waitingRoom}>
      <ol className={styles.stages}>
        {waitingRoom.stageOrder.map((key, i) => (
          <li key={key} className={styles.stage}>
            <span className={`rung ${i < current ? "is-filled" : i === current ? styles.currentRung : "is-hatched"}`} aria-hidden />
            <span className={`mono ${i > current ? "muted" : ""}`}>{waitingRoom.stages[key].readout}</span>
          </li>
        ))}
      </ol>
      <div aria-live="polite">
        <p className="t-title-md">{stage.line}</p>
        {status !== "complete" && <p className="t-body-sm muted">{waitingRoom.quips[quip]}</p>}
      </div>
    </section>
  );
}
