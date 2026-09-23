// Hex/rgb → English colour names (docs/PRD.md FR-005). Jev reads names, never hex (Jev 1.13 jaggedness guidance).

type Rgb = { r: number; g: number; b: number };

export function parseColor(input: string): Rgb | null {
  const s = input.trim().toLowerCase();
  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) return null;
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }
  const rgb = s.match(/^rgba?\(\s*(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)[\s,]+(\d+(?:\.\d+)?)/);
  if (rgb) return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  return null;
}

function toHsl({ r, g, b }: Rgb): { h: number; s: number; l: number; chroma: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l, chroma: 0 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l, chroma: d };
}

function hueName(h: number): string {
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 65) return "yellow";
  if (h < 160) return "green";
  if (h < 180) return "teal";
  if (h < 200) return "cyan";
  if (h < 232) return "blue";
  if (h < 252) return "indigo";
  if (h < 265) return "violet";
  if (h < 295) return "purple";
  if (h < 320) return "magenta";
  return "pink";
}

export function colorName(input: string): string | null {
  const rgb = parseColor(input);
  if (!rgb) return null;
  const { h, s, l, chroma } = toHsl(rgb);

  if (l < 0.12) return "near-black";
  if (l > 0.96) return s > 0.3 && h >= 30 && h < 65 ? "cream" : "white";
  // Low chroma reads as grey even when HSL saturation is inflated near white (Tailwind's bluish greys).
  if (s < 0.12 || chroma < 0.11) {
    if (l > 0.82) return "light grey";
    if (l > 0.45) return "grey";
    return "dark grey";
  }
  const base = hueName(h);
  if (base === "orange" && l < 0.35) return "brown";
  if ((base === "orange" || base === "yellow") && l > 0.85) return "beige";
  if ((base === "violet" || base === "purple") && l > 0.75) return "lavender";
  if (l > 0.8) return `pale ${base}`;
  if (l < 0.25) return `dark ${base}`;
  return base;
}

type BrandingColors = Record<string, unknown> | undefined | null;

export function paletteFromBranding(colors: BrandingColors): string[] {
  if (!colors) return [];
  const names = Object.values(colors)
    .filter((c): c is string => typeof c === "string")
    .map(colorName)
    .filter((n): n is string => n !== null);
  return [...new Set(names)];
}

export function schemeFromBranding(branding: {
  colorScheme?: unknown;
  colors?: BrandingColors;
} | null | undefined): "light" | "dark" | "unknown" {
  if (branding?.colorScheme === "light" || branding?.colorScheme === "dark") return branding.colorScheme;
  const bg = branding?.colors?.background;
  if (typeof bg === "string") {
    const rgb = parseColor(bg);
    if (rgb) return toHsl(rgb).l < 0.5 ? "dark" : "light";
  }
  return "unknown";
}
