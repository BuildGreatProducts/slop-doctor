import { ChartView } from "@/components/features/ChartView";

export default async function ChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChartView scanId={id} />;
}
