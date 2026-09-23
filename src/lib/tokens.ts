// Colour tokens as plain values, for places CSS variables can't reach (the generated share image).
// Mirrors src/styles/tokens.css; tests/tokens.test.ts fails if the two drift apart.
export const color = {
  primary: "#F55200",
  onPrimary: "#141414",
  surface: "#FDFCFA",
  surfaceContainer: "#F4F2EE",
  surfaceContainerHigh: "#EAE7E1",
  onSurface: "#141414",
  onSurfaceVariant: "#625D55",
  pencil: "#4A4741",
  outline: "#CFCAC0",
  outlineVariant: "#E6E2DA",
  inverseOnSurface: "#FDFCFA",
  success: "#1E7A3C",
  warning: "#8A5300",
} as const;
