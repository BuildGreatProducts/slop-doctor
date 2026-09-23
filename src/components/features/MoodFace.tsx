import { chart } from "@/lib/copy";
import type { Mood } from "@/lib/determinations";

const MOUTHS: Record<Mood, string> = {
  happy: "M13 23 Q20 30 27 23",
  meh: "M13 25.5 H27",
  sad: "M13 28 Q20 21 27 28",
};

/** A pencil-line face (docs/DESIGN.md § Slop Doctor mapping): happy, meh or sad. Graphite, never coloured. */
export function MoodFace({ mood, size = 40 }: { mood: Mood; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="var(--color-pencil)"
      strokeWidth={1.5}
      strokeLinecap="round"
      role="img"
      aria-label={chart.moodLabels[mood]}
    >
      <circle cx="20" cy="20" r="17" />
      <circle cx="14.5" cy="16" r="1.4" fill="var(--color-pencil)" stroke="none" />
      <circle cx="25.5" cy="16" r="1.4" fill="var(--color-pencil)" stroke="none" />
      <path d={MOUTHS[mood]} />
    </svg>
  );
}
