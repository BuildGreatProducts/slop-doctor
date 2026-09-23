import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";

/** Switzer (Fontshare, free for commercial use), self-hosted so no render-blocking cross-origin CSS. */
export const switzer = localFont({
  src: [
    { path: "../fonts/Switzer-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Switzer-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Switzer-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/Switzer-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist-mono",
  display: "swap",
});
