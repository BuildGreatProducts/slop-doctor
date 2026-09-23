import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { color } from "../src/lib/tokens";

test("src/lib/tokens.ts mirrors the colour tokens in tokens.css", () => {
  const css = readFileSync("src/styles/tokens.css", "utf8");
  for (const [name, value] of Object.entries(color)) {
    const cssName = `--color-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
    const match = css.match(new RegExp(`${cssName}:\\s*(#[0-9A-Fa-f]{6})`));
    expect(match?.[1]?.toUpperCase(), cssName).toBe(value.toUpperCase());
  }
});
