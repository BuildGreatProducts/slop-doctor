// The pencil-line doctor (docs/DESIGN.md § Slop Doctor mapping): circle head, square coat, clipboard. Never orange.
export function PencilDoctor({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      stroke="var(--color-pencil)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="30" cy="16" r="10" />
      <circle cx="26.5" cy="15" r="1" fill="var(--color-pencil)" stroke="none" />
      <circle cx="33.5" cy="15" r="1" fill="var(--color-pencil)" stroke="none" />
      <path d="M26.5 20.5h7" />
      <rect x="16" y="30" width="28" height="34" />
      <path d="M30 30v34M24 30l6 8 6-8" />
      <rect x="44" y="40" width="16" height="20" />
      <path d="M49 40v-2h6v2M47.5 46h9M47.5 50h9M47.5 54h6" />
    </svg>
  );
}
