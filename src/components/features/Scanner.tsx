"use client";

import { useEffect, useMemo, useRef } from "react";
import { scanner, waitingRoom, type StageKey } from "@/lib/copy";
import { findingName, regionHeadline } from "@/lib/findings";
import type { Finding, PublicScan } from "@/lib/types";
import { PencilDoctor } from "./PencilDoctor";
import styles from "./Scanner.module.css";

const USER_SCROLL_PAUSE_MS = 3000;

type Props = {
  scan: PublicScan;
  revealed: Finding[];
  mode: "live" | "static";
  /** The examination is complete and every finding has been revealed. */
  finished: boolean;
  reducedMotion: boolean;
};

export function Scanner({ scan, revealed, mode, finished, reducedMotion }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const lastUserScroll = useRef(0);
  const regions = useMemo(() => scan.regions ?? [], [scan.regions]);
  const live = mode === "live" && !finished && !reducedMotion;

  const byRegion = useMemo(() => {
    const map = new Map<string, Finding[]>();
    for (const f of revealed) {
      if (!f.regionId) continue;
      map.set(f.regionId, [...(map.get(f.regionId) ?? []), f]);
    }
    return map;
  }, [revealed]);

  const current = useMemo(() => {
    const last = [...revealed].reverse().find((f) => f.regionId);
    const index = last ? regions.findIndex((r) => r.id === last.regionId) : -1;
    return index >= 0 ? { index, region: regions[index] } : null;
  }, [revealed, regions]);

  const y = current ? current.region.box.y + current.region.box.h / 2 : 0;
  const looping = live && !current;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !live || looping) return;
    if (Date.now() - lastUserScroll.current < USER_SCROLL_PAUSE_MS) return;
    frame.scrollTo({ top: Math.max(0, y * frame.scrollHeight - frame.clientHeight / 2), behavior: "smooth" });
  }, [y, live, looping]);

  if (!scan.screenshotUrl) {
    const stage = (scan.status in waitingRoom.stages ? scan.status : "queued") as StageKey;
    return (
      <div className={`${styles.frame} ${styles.empty} hatch`}>
        <PencilDoctor size={120} />
        <p className="t-body-sm muted">{waitingRoom.stages[stage].line}</p>
      </div>
    );
  }

  const markUserScroll = () => {
    lastUserScroll.current = Date.now();
  };

  return (
    <div
      ref={frameRef}
      className={styles.frame}
      onWheel={markUserScroll}
      onTouchMove={markUserScroll}
      onKeyDown={markUserScroll}
      tabIndex={0}
      aria-label={scanner.screenshotAlt(scan.host)}
    >
      <div className={styles.canvas}>
        {/* Convex storage URLs are dynamic and the image is already sized, so next/image adds nothing here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.shot} src={scan.screenshotUrl} alt={scanner.screenshotAlt(scan.host)} />

        {live && <div className={`${styles.hatchMask} hatch`} style={{ top: `${looping ? 0 : y * 100}%` }} aria-hidden />}

        <div aria-hidden>
          {regions.map((r, i) => {
            const found = byRegion.get(r.id);
            const headline = found ? regionHeadline(found) : null;
            if (!headline) {
              return live ? <div key={r.id} className="region-box is-pending" style={boxStyle(r.box)} /> : null;
            }
            const name = findingName(headline.lead.key);
            return (
              <div
                key={r.id}
                className={`region-box ${styles.box} ${headline.inconclusive ? "is-inconclusive" : ""}`}
                style={boxStyle(r.box)}
              >
                <span className="region-tag">
                  {headline.inconclusive
                    ? scanner.regionTagInconclusive(i + 1, name)
                    : scanner.regionTag(i + 1, name, headline.lead.probability, headline.more)}
                </span>
              </div>
            );
          })}
        </div>

        {live && (
          <div
            className={`scan-rule ${looping ? styles.looping : styles.rule}`}
            style={looping ? undefined : { top: `${y * 100}%` }}
            aria-hidden
          >
            {!looping && current && (
              <span className="scan-readout">
                {scanner.readout(y * (scan.screenshotHeight ?? 0), current.index + 1, regions.length)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function boxStyle(box: { x: number; y: number; w: number; h: number }) {
  return { left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` };
}
