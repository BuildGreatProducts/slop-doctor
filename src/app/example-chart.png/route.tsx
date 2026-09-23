import { ImageResponse } from "next/og";
import { ShareCard } from "@/components/share/ShareCard";
import { chart } from "@/lib/copy";
import { describeDeterminations, isHealthy } from "@/lib/determinations";
import { loadShareFonts, shareImageSize } from "@/lib/shareImage";

// The landing page's example: the share card for a made-up, very sloppy patient (the same one
// scripts/fixtures/sloppy.html plays). Rendered once at build time from the live card design.
export const dynamic = "force-static";

const EXAMPLE = {
  host: "synergize.example.com",
  index: 98,
  tier: "code_purple" as const,
  symptoms: [
    { key: "glow_orbs", name: "Aura Glowmatosis", p: 0.97 },
    { key: "pill_badge", name: "Pill Badge Pox", p: 0.96 },
    { key: "purple_gradient", name: "Purple Gradient Fever", p: 0.94 },
  ],
  determinations: {
    archetype: { choice: "saas_clone", confidence: 0.81, probabilities: {} },
    birthplace: { choice: "lovable", confidence: 0.62, probabilities: {} },
    birthplaceConfirmed: false,
    prognosis: { choice: "terminal", confidence: 0.77, probabilities: {} },
    templatedness: { score: 3.8, confidence: 0.84 },
    copyTemperament: { score: 2.9, confidence: 0.8 },
  },
};

export async function GET() {
  const { archetype, birthplace, prognosis } = describeDeterminations(EXAMPLE.determinations, EXAMPLE.tier);
  return new ImageResponse(
    (
      <ShareCard
        host={EXAMPLE.host}
        index={EXAMPLE.index}
        tier={EXAMPLE.tier}
        healthy={isHealthy(EXAMPLE.tier)}
        symptoms={EXAMPLE.symptoms}
        verdicts={[
          { label: chart.archetypeLabel, value: archetype },
          { label: chart.birthplaceLabel, value: birthplace },
          { label: chart.prognosisLabel, value: prognosis },
        ]}
      />
    ),
    { ...shareImageSize, fonts: await loadShareFonts() },
  );
}
