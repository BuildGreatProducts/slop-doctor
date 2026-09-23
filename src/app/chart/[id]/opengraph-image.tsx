import { fetchQuery } from "convex/nextjs";
import { ImageResponse } from "next/og";
import { api } from "../../../../convex/_generated/api";
import type { TierKey } from "../../../../convex/lib/taxonomy";
import { FallbackCard, ShareCard } from "@/components/share/ShareCard";
import { chart } from "@/lib/copy";
import { describeDeterminations, isHealthy } from "@/lib/determinations";
import { topSymptoms } from "@/lib/share";
import { loadShareFonts, shareImageSize } from "@/lib/shareImage";

// The chart's share image (docs/PRD.md FR-021): link previews on X, LinkedIn, Slack and iMessage,
// the share dialog's preview and "Download image".
export const alt = "A Slop Doctor chart";
export const size = shareImageSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [scan, findings, fonts] = await Promise.all([
    fetchQuery(api.scans.get, { scanId: id }).catch(() => null),
    fetchQuery(api.findings.byScan, { scanId: id }).catch(() => []),
    loadShareFonts(),
  ]);

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
