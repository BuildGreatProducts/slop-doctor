import { fetchQuery } from "convex/nextjs";
import type { Metadata } from "next";
import { api } from "../../../../convex/_generated/api";
import { ChartView } from "@/components/features/ChartView";
import { tiers, type TierKey } from "@/lib/copy";

type Params = { params: Promise<{ id: string }> };

/** Share cards for discharge papers (docs/PRD.md FR-020). */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const scan = await fetchQuery(api.scans.get, { scanId: id }).catch(() => null);
  if (!scan || scan.status !== "complete" || scan.slopIndex === undefined || !scan.tier) return {};
  const tier = tiers[scan.tier as TierKey];
  const title = `${scan.host}: ${tier.name} (Slop Index ${scan.slopIndex})`;
  // The image comes from ./opengraph-image.tsx, the generated share card.
  return {
    title,
    description: tier.oneLiner,
    openGraph: { title, description: tier.oneLiner },
    twitter: { card: "summary_large_image", title, description: tier.oneLiner },
  };
}

export default async function ChartPage({ params }: Params) {
  const { id } = await params;
  return <ChartView scanId={id} />;
}
