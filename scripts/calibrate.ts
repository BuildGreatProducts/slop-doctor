// Runs the calibration fixtures through the real pipeline and checks the pass bar (docs/PRD.md § 7 Reliability).
// Usage: pnpm calibrate   (needs FIRECRAWL_API_KEY, GEMINI_API_KEY and TYPESAFE_API_KEY on the dev deployment)

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

type Fixture = { url: string; expect: "slop" | "designed" };
type Scan = { status: string; error?: string; slopIndex?: number; tier?: string; prescriptions?: string[]; jevModel?: string };

const SLOP_MIN = 56;
const DESIGNED_MAX = 35;
const TIMEOUT_MS = 180_000;

const run = (fn: string, args: object) =>
  JSON.parse(execFileSync("npx", ["convex", "run", fn, JSON.stringify(args)], { encoding: "utf8" }).trim());

async function waitFor(scanId: string): Promise<Scan> {
  const started = Date.now();
  while (Date.now() - started < TIMEOUT_MS) {
    const scan: Scan = run("scans:get", { scanId });
    if (scan.status === "complete" || scan.status === "failed") return scan;
    await new Promise((r) => setTimeout(r, 5000));
  }
  return { status: "timeout" };
}

async function main() {
  const { fixtures } = JSON.parse(readFileSync("scripts/calibration.json", "utf8")) as { fixtures: Fixture[] };
  const todo = fixtures.filter((f) => f.url.startsWith("TODO"));
  if (todo.length > 0) {
    console.error(`Fill in ${todo.length} TODO fixture URL(s) in scripts/calibration.json first.`);
    process.exit(1);
  }

  const started = fixtures.map((f) => ({ ...f, scanId: run("dev:startScanForDev", { url: f.url }) as string }));
  const results = await Promise.all(started.map(async (f) => ({ ...f, scan: await waitFor(f.scanId) })));

  let failures = 0;
  for (const { url, expect, scan } of results) {
    const index = scan.slopIndex;
    const pass =
      scan.status === "complete" &&
      index !== undefined &&
      (expect === "slop" ? index >= SLOP_MIN : index <= DESIGNED_MAX);
    if (!pass) failures++;
    console.log(
      [pass ? "PASS" : "FAIL", expect.padEnd(8), String(index ?? "-").padStart(3), (scan.tier ?? scan.error ?? scan.status).padEnd(12), url, (scan.prescriptions ?? []).join(", ")].join("  "),
    );
  }
  console.log(`\n${results.length - failures}/${results.length} fixtures meet the pass bar (slop >= ${SLOP_MIN}, designed <= ${DESIGNED_MAX}).`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
