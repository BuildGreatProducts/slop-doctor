import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchQuery } from "convex/nextjs";
import { ImageResponse } from "next/og";
import { api } from "../../../../convex/_generated/api";
import type { TierKey } from "../../../../convex/lib/taxonomy";
import { FallbackCard, ShareCard } from "@/components/share/ShareCard";
import { chart } from "@/lib/copy";
import { describeDeterminations, isHealthy } from "@/lib/determinations";
import { topSymptoms } from "@/lib/share";

// The chart's share image (docs/PRD.md FR-021): link previews on X, LinkedIn, Slack and iMessage,
// the share dialog's preview and "Download image".
export const alt = "A Slop Doctor chart";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [scan, findings, switzer400, switzer600, mono500, mono600] = await Promise.all([
    fetchQuery(api.scans.get, { scanId: id }).catch(() => null),
    fetchQuery(api.findings.byScan, { scanId: id }).catch(() => []),
    font("Switzer-400.ttf"),
    font("Switzer-600.ttf"),
    font("GeistMono-Medium.ttf"),
    font("GeistMono-SemiBold.ttf"),
  ]);
  const fonts = [
    { name: "Switzer", data: switzer400, weight: 400 as const, style: "normal" as const },
    { name: "Switzer", data: switzer600, weight: 600 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono500, weight: 500 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono600, weight: 600 as const, style: "normal" as const },
  ];

  if (!scan || scan.status !== "complete" || scan.slopIndex === undefined || !scan.tier) {
    // Not finished yet: a brand card, cached briefly so the real one replaces it.
    return new ImageResponse(<FallbackCard />, { ...size, fonts, headers: { "Cache-Control": "public, max-age=60" } });
  }

  const tier = scan.tier as TierKey;
  const { archetype, birthplace, prognosis } = describeDeterminations(scan.determinations, tier);
  return new ImageResponse(
    (
      <ShareCard
        host={scan.host}
        index={scan.slopIndex}
        tier={tier}
        healthy={isHealthy(tier)}
        symptoms={topSymptoms(findings)}
        verdicts={[
          { label: chart.archetypeLabel, value: archetype },
          { label: chart.birthplaceLabel, value: birthplace },
          { label: chart.prognosisLabel, value: prognosis },
        ]}
      />
    ),
    // A finished chart never changes.
    { ...size, fonts, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
  );
}
