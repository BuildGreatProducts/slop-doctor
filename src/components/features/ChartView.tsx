"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { computeSlopIndex } from "../../../convex/lib/scoring";
import { chart, type ErrorKey, type StageKey, tiers } from "@/lib/copy";
import { errorMessage } from "@/lib/errors";
import type { Finding, PublicScan } from "@/lib/types";
import { usePrefersReducedMotion, useRevealQueue } from "@/lib/useRevealQueue";
import { Chart } from "./Chart";
import styles from "./Examination.module.css";
import { ExaminationError } from "./ExaminationError";
import { LabResults } from "./LabResults";
import { PencilDoctor } from "./PencilDoctor";
import { Scanner } from "./Scanner";
import { ShareDialog } from "./ShareDialog";
import { SlopOMeter } from "./SlopOMeter";
import { Toast } from "./Toast";
import { WaitingRoom } from "./WaitingRoom";

const CHART_BEAT_MS = 1200;

/** One examination, live or finished: the waiting room and scanner, then the chart (docs/PRD.md FR-010, FR-016). */
export function ChartView({ scanId, cached }: { scanId: string; cached?: boolean }) {
  const router = useRouter();
  const scan = useQuery(api.scans.get, { scanId });
  const findings = useQuery(api.findings.byScan, { scanId });
  const reducedMotion = usePrefersReducedMotion();

  // A chart that was already complete when opened shows at once; a live one is revealed at the scanner's pace.
  const [completeOnLoad, setCompleteOnLoad] = useState<boolean | null>(null);
  if (completeOnLoad === null && scan !== undefined) setCompleteOnLoad(scan?.status === "complete");
  const instant = reducedMotion || completeOnLoad === true;

  const { revealed, drained } = useRevealQueue(findings, scan?.regions, { instant });
  const finished = scan?.status === "complete" && drained && findings !== undefined;

  const [showChart, setShowChart] = useState(false);
  useEffect(() => {
    if (!finished) return;
    const timer = setTimeout(() => setShowChart(true), instant ? 0 : CHART_BEAT_MS);
    return () => clearTimeout(timer);
  }, [finished, instant]);

  const [toast, setToast] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const closeShare = useCallback(() => setSharing(false), []);
  const clearToast = useCallback(() => setToast(null), []);
  const examineAnother = () => router.push("/");

  const { isAuthenticated } = useConvexAuth();
  const rescan = useMutation(api.scans.rescan);
  const secondOpinion = async () => {
    if (!scan) return;
    if (!isAuthenticated) {
      router.push(`/?signin=1&url=${encodeURIComponent(scan.displayUrl)}`);
      return;
    }
    try {
      const next = await rescan({ scanId });
      router.push(`/?chart=${next}`);
    } catch (err) {
      const data = err instanceof ConvexError ? (err.data as { code?: ErrorKey; retryAfterMs?: number }) : {};
      setToast(errorMessage(data.code, data.retryAfterMs));
    }
  };


  if (scan === undefined) {
    return (
      <div className={`frame ${styles.loading}`}>
        <div className="panel-grid hatch">
          <PencilDoctor size={120} />
        </div>
      </div>
    );
  }
  if (scan === null) {
    return (
      <div className="frame">
        <ExaminationError error="not_found" onPrimary={examineAnother} />
      </div>
    );
  }
  if (scan.status === "failed") {
    return (
      <div className="frame">
        <ExaminationError error={scan.error ?? "generic"} onPrimary={secondOpinion} onExamineAnother={examineAnother} />
        <Toast message={toast} onDone={clearToast} />
      </div>
    );
  }

  return (
    <div className="frame">
      {showChart && findings ? (
        <Chart
          scan={scan}
          findings={findings}
          cached={cached}
          onShare={() => setSharing(true)}
          onSecondOpinion={secondOpinion}
          onExamineAnother={examineAnother}
        />
      ) : (
        <Examination scan={scan} revealed={revealed} finished={finished} reducedMotion={reducedMotion} />
      )}
      {scan.status === "complete" && scan.tier && (
        <ShareDialog
          open={sharing}
          onClose={closeShare}
          scanId={scanId}
          host={scan.host}
          tierName={tiers[scan.tier].name}
          index={scan.slopIndex ?? 0}
        />
      )}
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}

function Examination({
  scan,
  revealed,
  finished,
  reducedMotion,
}: {
  scan: PublicScan;
  revealed: Finding[];
  finished: boolean;
  reducedMotion: boolean;
}) {
  const templatedness = scan.status === "complete" ? scan.determinations?.templatedness : undefined;
  const index = computeSlopIndex({ findings: revealed, templatedness: finished ? templatedness : undefined });
  const status = (scan.status === "failed" ? "queued" : scan.status) as StageKey;

  return (
    <div className={styles.layout}>
      <h1 className="visually-hidden">{chart.heading(scan.host)}</h1>
      <div className={styles.scan}>
        <Scanner scan={scan} revealed={revealed} mode="live" finished={finished} reducedMotion={reducedMotion} />
      </div>
      <div className={styles.wait}>
        <WaitingRoom status={finished ? "complete" : status === "complete" ? "diagnosing" : status} reducedMotion={reducedMotion} />
      </div>
      <div className={styles.meterArea}>
        <SlopOMeter index={index} />
      </div>
      <div className={styles.resultsArea}>
        <LabResults revealed={revealed} regions={scan.regions ?? []} />
      </div>
    </div>
  );
}
