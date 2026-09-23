"use node";

import Firecrawl, { type BrandingProfile } from "firecrawl";
import { imageSize } from "image-size";
import { Jimp } from "jimp";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { paletteFromBranding, schemeFromBranding } from "../lib/colors";
import { countWords, runLabs } from "../lib/labs";

const VIEWPORT = { width: 1440, height: 900 };
const MAX_HEIGHT = VIEWPORT.height * 6; // 5,400 px
const MIN_WORDS = 20;
const MIN_HEIGHT = 200;

/** Primary font first, then heading, then any other families Firecrawl found. */
function fontsFrom(branding: BrandingProfile | undefined): string[] {
  const families = [
    branding?.typography?.fontFamilies?.primary,
    branding?.typography?.fontFamilies?.heading,
    ...(branding?.fonts ?? []).map((f) => f.family),
  ]
    .filter((f): f is string => typeof f === "string" && f.trim().length > 0)
    .map((f) => f.split(",")[0].trim().replace(/^["']|["']$/g, ""));
  return [...new Set(families)];
}

async function loadScreenshot(screenshot: string): Promise<{ bytes: Uint8Array; type: string }> {
  if (screenshot.startsWith("data:")) {
    const [meta, data] = screenshot.split(",", 2);
    return { bytes: new Uint8Array(Buffer.from(data, "base64")), type: meta.slice(5).split(";")[0] || "image/png" };
  }
  const res = await fetch(screenshot);
  if (!res.ok) throw new Error(`Screenshot download failed: ${res.status}`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), type: res.headers.get("content-type") ?? "image/png" };
}

/** Scales to 1,440 px wide and crops to at most 5,400 px tall. Re-encodes only when it has to. */
async function fitScreenshot(bytes: Uint8Array, type: string) {
  const size = imageSize(bytes);
  if (!size.width || !size.height) throw new Error("Unreadable screenshot");
  const scaledHeight = Math.round(size.height * (VIEWPORT.width / size.width));
  if (size.width === VIEWPORT.width && size.height <= MAX_HEIGHT) {
    return { bytes, type, width: size.width, height: size.height };
  }
  const image = await Jimp.read(Buffer.from(bytes));
  if (size.width !== VIEWPORT.width) image.resize({ w: VIEWPORT.width });
  const height = Math.min(scaledHeight, MAX_HEIGHT);
  if (image.height > height) image.crop({ x: 0, y: 0, w: VIEWPORT.width, h: height });
  const out = await image.getBuffer("image/jpeg", { quality: 82 });
  return { bytes: new Uint8Array(out), type: "image/jpeg", width: image.width, height: image.height };
}

export const run = internalAction({
  args: { scanId: v.id("scans") },
  returns: v.null(),
  handler: async (ctx, { scanId }) => {
    const scan = await ctx.runQuery(internal.pipeline.store.getForPipeline, { scanId });
    if (!scan) return null;
    await ctx.runMutation(internal.pipeline.store.setStatus, { scanId, status: "capturing" });

    try {
      const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
      const doc = await firecrawl.scrape(scan.url, {
        formats: ["markdown", "rawHtml", "branding", { type: "screenshot", fullPage: true, viewport: VIEWPORT }],
        onlyMainContent: false,
        waitFor: 1500,
        timeout: 45000,
      });
      if (!doc.screenshot) throw new Error("No screenshot returned");

      const markdown = doc.markdown ?? "";
      const raw = await loadScreenshot(doc.screenshot);
      const shot = await fitScreenshot(raw.bytes, raw.type);
      if (countWords(markdown) < MIN_WORDS && shot.height < MIN_HEIGHT) throw new Error("Blank page");

      const screenshotId = await ctx.storage.store(new Blob([Buffer.from(shot.bytes)], { type: shot.type }));
      const fonts = fontsFrom(doc.branding);
      const labs = runLabs({ markdown, html: doc.rawHtml ?? doc.html ?? "", fonts });

      await ctx.runMutation(internal.pipeline.store.setCapture, {
        scanId,
        screenshotId,
        width: shot.width,
        height: shot.height,
        pageTitle: doc.metadata?.title?.slice(0, 200),
        signals: {
          fonts,
          palette: paletteFromBranding(doc.branding?.colors),
          colourScheme: schemeFromBranding(doc.branding),
          ...labs.signals,
        },
      });
      if (labs.findings.length > 0) {
        await ctx.runMutation(internal.pipeline.store.addFindings, { scanId, findings: labs.findings });
      }
    } catch (error) {
      console.error(`capture failed for ${scan.url}`, error);
      await ctx.runMutation(internal.pipeline.store.fail, { scanId, error: "capture_failed" });
      return null;
    }

    await ctx.runMutation(internal.pipeline.store.setStatus, { scanId, status: "examining" });
    await ctx.scheduler.runAfter(0, internal.pipeline.examine.run, { scanId });
    return null;
  },
});
