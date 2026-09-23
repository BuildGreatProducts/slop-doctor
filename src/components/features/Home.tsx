"use client";

import { useSearchParams } from "next/navigation";
import { ChartView } from "./ChartView";
import { Intake } from "./Intake";

/** The single page: intake, or the active examination mirrored to ?chart= (docs/PRD.md FR-010). */
export function Home() {
  const params = useSearchParams();
  const chartId = params.get("chart");
  if (chartId) return <ChartView key={chartId} scanId={chartId} cached={params.get("cached") === "1"} />;
  const signIn = params.get("signin") === "1";
  // Remount when "Sign in" is pressed on this page so the popup opens.
  return (
    <Intake
      key={signIn ? "signin" : "intake"}
      initialUrl={params.get("url") ?? ""}
      openSignIn={signIn}
      autoStart={params.get("start") === "1"}
    />
  );
}
