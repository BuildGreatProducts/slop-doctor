import { defineConfig, devices } from "@playwright/test";

// Smoke tests (docs/ROADMAP.md TASK-042). E2E_CHART_ID must be a completed scan: `pnpm seed:fixture` prints one.
export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3000" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
