// Shared by the generated share images (next/og): fonts as TTF, since the renderer can't read WOFF2.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const shareImageSize = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));

export async function loadShareFonts() {
  const [switzer400, switzer600, mono500, mono600] = await Promise.all([
    font("Switzer-400.ttf"),
    font("Switzer-600.ttf"),
    font("GeistMono-Medium.ttf"),
    font("GeistMono-SemiBold.ttf"),
  ]);
  return [
    { name: "Switzer", data: switzer400, weight: 400 as const, style: "normal" as const },
    { name: "Switzer", data: switzer600, weight: 600 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono500, weight: 500 as const, style: "normal" as const },
    { name: "Geist Mono", data: mono600, weight: 600 as const, style: "normal" as const },
  ];
}
