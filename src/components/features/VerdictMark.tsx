import { chart } from "@/lib/copy";

type Colors = { success: string; primary: string; onSuccess: string; onPrimary: string };

const CSS_COLORS: Colors = {
  success: "var(--color-success)",
  primary: "var(--color-primary)",
  onSuccess: "var(--color-inverse-on-surface)",
  onPrimary: "var(--color-on-primary)",
};

/**
 * A filled circle after the diagnosis: a tick on green when healthy, a cross on the primary colour when not.
 * `colors` takes plain values where CSS variables don't work (the generated share image).
 */
export function VerdictMark({ healthy, size = 20, colors = CSS_COLORS }: { healthy: boolean; size?: number; colors?: Colors }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      role="img"
      aria-label={healthy ? chart.verdictHealthy : chart.verdictUnwell}
      style={{ flex: "none" }}
    >
      <circle cx="10" cy="10" r="10" fill={healthy ? colors.success : colors.primary} />
      <path
        d={healthy ? "M5.5 10.5 L8.5 13.5 L14.5 7" : "M6.5 6.5 L13.5 13.5 M13.5 6.5 L6.5 13.5"}
        fill="none"
        stroke={healthy ? colors.onSuccess : colors.onPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
