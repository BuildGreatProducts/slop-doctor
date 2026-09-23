/** The logo mark: a square pencil-line doctor face with a head mirror. Decorative; the wordmark carries the name. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="var(--color-pencil)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="22" height="21" />
      <path d="M3 9.5 H25" />
      <circle cx="14" cy="9.5" r="2.5" fill="var(--color-surface)" />
      <circle cx="10" cy="15" r="1.1" fill="var(--color-pencil)" stroke="none" />
      <circle cx="18" cy="15" r="1.1" fill="var(--color-pencil)" stroke="none" />
      <path d="M10 19.5 Q14 22.5 18 19.5" />
    </svg>
  );
}
