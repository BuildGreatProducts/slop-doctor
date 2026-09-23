import { defineConfig } from "vitest/config";

// Convex function tests opt into the edge runtime per file with `// @vitest-environment edge-runtime`.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    server: { deps: { inline: ["convex-test"] } },
  },
});
