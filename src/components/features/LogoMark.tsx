/**
 * The logo mark: a square pencil-line doctor face with a head mirror. Decorative; the wordmark carries the name.
 * `pencil` and `surface` take plain colours where CSS variables don't work (the generated share image).
 */
export function LogoMark({
  size = 28,
  pencil = "var(--color-pencil)",
  surface = "var(--color-surface)",
}: {
  size?: number;
  pencil?: string;
  surface?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke={pencil}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="22" height="21" />
      <path d="M3 9.5 H25" />
      <circle cx="14" cy="9.5" r="2.5" fill={surface} />
      <circle cx="10" cy="15" r="1.1" fill={pencil} stroke="none" />
      <circle cx="18" cy="15" r="1.1" fill={pencil} stroke="none" />
      <path d="M10 19.5 Q14 22.5 18 19.5" />
    </svg>
  );
}
