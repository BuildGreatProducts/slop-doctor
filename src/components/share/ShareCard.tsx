// The 1200×630 share image for a chart (docs/DESIGN.md § Slop Doctor mapping, "Share card"). Rendered by
// next/og, which supports inline styles and flexbox only and can't read CSS variables: colours come from
// src/lib/tokens.ts, and sizes are fixed for the canvas.

import type { TierKey } from "../../../convex/lib/taxonomy";
import { chart, scanner, share, tiers } from "@/lib/copy";
import type { Determination } from "@/lib/determinations";
import { type BarTone, barTone } from "@/lib/findings";
import { color } from "@/lib/tokens";
import { LogoMark } from "../features/LogoMark";
import { MoodFace } from "../features/MoodFace";
import { VerdictMark } from "../features/VerdictMark";

const TONE: Record<BarTone, string> = { low: color.success, mid: color.warning, high: color.primary };
const VERDICT_COLORS = {
  success: color.success,
  primary: color.primary,
  onSuccess: color.inverseOnSurface,
  onPrimary: color.onPrimary,
};

const mono = { fontFamily: "Geist Mono" } as const;
const label = { ...mono, fontSize: 16, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: color.onSurfaceVariant } as const;

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <LogoMark size={40} pencil={color.pencil} surface={color.surface} />
        <span style={{ ...mono, fontSize: 28, fontWeight: 600 }}>Slop Doctor</span>
      </div>
      <span style={{ ...mono, fontSize: 22, fontWeight: 500, color: color.onSurfaceVariant }}>{share.siteName}</span>
    </div>
  );
}

type Props = {
  host: string;
  index: number;
  tier: TierKey;
  healthy: boolean;
  symptoms: { key: string; name: string; p: number }[];
  verdicts: { label: string; value: Determination }[];
};

export function ShareCard({ host, index, tier, healthy, symptoms, verdicts }: Props) {
  const tone = TONE[barTone(index / 100)];
  const filled = Math.ceil(index / 10);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 56,
        gap: 36,
        background: color.surface,
        color: color.onSurface,
        fontFamily: "Switzer",
        border: `12px solid ${color.surfaceContainer}`,
      }}
    >
      <Header />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
          <span style={{ fontSize: host.length > 24 ? 38 : 46, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1 }}>
            {chart.heading(host)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 30, fontWeight: 600 }}>{chart.diagnosisLine(tiers[tier].name)}</span>
            <VerdictMark healthy={healthy} size={30} colors={VERDICT_COLORS} />
          </div>
          <span style={{ fontSize: 24, color: color.onSurfaceVariant }}>{tiers[tier].oneLiner}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={label}>{chart.indexLabel}</span>
          <span style={{ ...mono, fontSize: 132, fontWeight: 600, lineHeight: 1, color: tone }}>{index}</span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ width: 22, height: 22, background: i < filled ? tone : color.surfaceContainerHigh }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 40, marginTop: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
          {symptoms.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ width: 330, fontSize: 24, fontWeight: 600 }}>{s.name}</span>
              <div style={{ display: "flex", width: 200, height: 14, background: color.surfaceContainerHigh }}>
                <div style={{ width: `${Math.round(s.p * 100)}%`, height: 14, background: TONE[barTone(s.p)] }} />
              </div>
              <span style={{ ...mono, fontSize: 22, fontWeight: 500, width: 64, textAlign: "right" }}>
                {scanner.percent(s.p)}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 340 }}>
          {verdicts.map((v) => (
            <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <MoodFace mood={v.value.mood} size={40} pencil={color.pencil} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ ...label, fontSize: 13 }}>{v.label}</span>
                <span style={{ fontSize: 22, fontWeight: 600 }}>{v.value.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** For charts that don't exist or aren't finished yet: the brand, not an empty chart. */
export function FallbackCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 56,
        background: color.surface,
        color: color.onSurface,
        fontFamily: "Switzer",
        border: `12px solid ${color.surfaceContainer}`,
      }}
    >
      <Header />
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: "auto" }}>
        <span style={label}>{share.cardEyebrow}</span>
        <span style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>{share.cardFallbackHeadline}</span>
      </div>
    </div>
  );
}
