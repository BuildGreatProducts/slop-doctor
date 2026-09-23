import { chart } from "@/lib/copy";
import type { Mood } from "@/lib/determinations";

// The face's shape says the verdict at a glance: square is good, round is meh, hexagon is bad.
const HEADS: Record<Mood, React.ReactNode> = {
  happy: <rect x="3" y="3" width="34" height="34" />,
  meh: <circle cx="20" cy="20" r="17" />,
  sad: <polygon points="11.5,5.3 28.5,5.3 37,20 28.5,34.7 11.5,34.7 3,20" />,
};

const MOUTHS: Record<Mood, string> = {
  happy: "M13 23 Q20 30 27 23",
  meh: "M13 25.5 H27",
  sad: "M13 28 Q20 21 27 28",
};

/** A pencil-line face (docs/DESIGN.md § Slop Doctor mapping). Graphite, never coloured. */
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
      strokeLinejoin="round"
      role="img"
      aria-label={chart.moodLabels[mood]}
    >
      {HEADS[mood]}
      <circle cx="14.5" cy="16" r="1.4" fill="var(--color-pencil)" stroke="none" />
      <circle cx="25.5" cy="16" r="1.4" fill="var(--color-pencil)" stroke="none" />
      <path d={MOUTHS[mood]} />
    </svg>
  );
}
