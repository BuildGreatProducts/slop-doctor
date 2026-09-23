import { chart } from "@/lib/copy";

/** A filled circle after the diagnosis: a tick on green when healthy, a cross on the primary colour when not. */
export function VerdictMark({ healthy, size = 20 }: { healthy: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      role="img"
      aria-label={healthy ? chart.verdictHealthy : chart.verdictUnwell}
      style={{ flex: "none" }}
    >
      <circle cx="10" cy="10" r="10" fill={healthy ? "var(--color-success)" : "var(--color-primary)"} />
      <path
        d={healthy ? "M5.5 10.5 L8.5 13.5 L14.5 7" : "M6.5 6.5 L13.5 13.5 M13.5 6.5 L6.5 13.5"}
        fill="none"
        stroke={healthy ? "var(--color-inverse-on-surface)" : "var(--color-on-primary)"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
