"use node";

import { lookup } from "node:dns/promises";
import Firecrawl, { type BrandingProfile } from "firecrawl";
import { imageSize } from "image-size";
import { Jimp } from "jimp";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { paletteFromBranding, schemeFromBranding } from "../lib/colors";
import { countWords, runLabs } from "../lib/labs";
import { isPrivateAddress, validateUrl } from "../lib/urls";

const VIEWPORT = { width: 1440, height: 900 };
const MAX_HEIGHT = VIEWPORT.height * 6; // 5,400 px
const MIN_WORDS = 20;
const MIN_HEIGHT = 200;
// Page-controlled sizes: refuse before decoding rather than run out of memory.
const MAX_SCREENSHOT_BYTES = 25 * 1024 * 1024;
const MAX_DECODE_PIXELS = 4000 * 20000;
const DOWNLOAD_TIMEOUT_MS = 20_000;

/** Fails unless every address the host resolves to is public (docs/PRD.md § 2 Security). */
async function assertPublicHost(host: string) {
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error(`Host resolves to a private address: ${host}`);
  }
}

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

async function loadScreenshot(screenshot: string): Promise<Uint8Array> {
  if (screenshot.startsWith("data:")) {
    const data = screenshot.slice(screenshot.indexOf(",") + 1);
    if (data.length > (MAX_SCREENSHOT_BYTES * 4) / 3) throw new Error("Screenshot too large");
    return new Uint8Array(Buffer.from(data, "base64"));
  }
  const res = await fetch(screenshot, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Screenshot download failed: ${res.status}`);
  if (Number(res.headers.get("content-length") ?? 0) > MAX_SCREENSHOT_BYTES) throw new Error("Screenshot too large");
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength > MAX_SCREENSHOT_BYTES) throw new Error("Screenshot too large");
  return bytes;
}

const MIME: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };

/** Scales to 1,440 px wide and crops to at most 5,400 px tall. Re-encodes only when it has to. */
async function fitScreenshot(bytes: Uint8Array) {
  const size = imageSize(bytes);
  const type = size.type ? MIME[size.type] : undefined;
  if (!size.width || !size.height || !type) throw new Error("Unreadable screenshot");
  if (size.width * size.height > MAX_DECODE_PIXELS) throw new Error("Screenshot too large to decode");
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
      await assertPublicHost(new URL(scan.url).hostname);

      const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
      const doc = await firecrawl.scrape(scan.url, {
        formats: ["markdown", "rawHtml", "branding", { type: "screenshot", fullPage: true, viewport: VIEWPORT }],
        onlyMainContent: false,
        waitFor: 1500,
        timeout: 45000,
      });
      if (!doc.screenshot) throw new Error("No screenshot returned");

      // Redirects are followed by Firecrawl: the page it landed on must be public too.
      const landed = doc.metadata?.url ?? doc.metadata?.sourceURL;
      if (landed) {
        const final = validateUrl(landed);
        if (!final.ok) throw new Error("Redirected to a non-public URL");
        await assertPublicHost(new URL(final.url).hostname);
      }

      const markdown = doc.markdown ?? "";
      const shot = await fitScreenshot(await loadScreenshot(doc.screenshot));
      if (countWords(markdown) < MIN_WORDS && shot.height < MIN_HEIGHT) throw new Error("Blank page");

      const screenshotId = await ctx.storage.store(new Blob([Buffer.from(shot.bytes)], { type: shot.type }));
      const fonts = fontsFrom(doc.branding);
      const labs = runLabs({ markdown, html: doc.rawHtml ?? doc.html ?? "", host: new URL(scan.url).hostname, fonts });

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
      // Log the host, never the full URL: its query string can carry preview tokens.
      console.error(`capture failed for ${scan.host}: ${error instanceof Error ? error.message : String(error)}`);
      await ctx.runMutation(internal.pipeline.store.fail, { scanId, error: "capture_failed" });
      return null;
    }

    await ctx.runMutation(internal.pipeline.store.setStatus, { scanId, status: "examining" });
    await ctx.scheduler.runAfter(0, internal.pipeline.examine.run, { scanId });
    return null;
  },
});
