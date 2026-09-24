import { expect, test } from "@playwright/test";

test("intake renders and a signed-out submit opens the sign-in popup", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The doctor can see you now");
  await page.getByLabel("Patient's URL").fill("example.com");
  await page.getByRole("button", { name: "Get my slop report" }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in to get your slop report" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with GitHub" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel("Patient's URL")).toHaveValue("example.com");
});

test("the landing page shows an example report", async ({ page, request }) => {
  await page.goto("/");
  const example = page.getByRole("img", { name: /An example slop chart/ });
  await expect(example).toBeVisible();
  await expect(example).toHaveJSProperty("naturalWidth", 1200);
  const image = await request.get("/example-chart.png");
  expect(image.headers()["content-type"]).toBe("image/png");
});

test("invalid and private URLs show inline errors instead of the popup", async ({ page }) => {
  await page.goto("/");
  const field = page.getByLabel("Patient's URL");
  const submit = page.getByRole("button", { name: "Get my slop report" });
  await field.fill("ftp://example.com");
  await submit.click();
  await expect(page.getByText("That doesn't look like a web address.")).toBeVisible();
  await field.fill("localhost:3000");
  await submit.click();
  await expect(page.getByText("The doctor only makes house calls to public websites.")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a completed chart renders for a signed-out visitor", async ({ page }) => {
  const id = process.env.E2E_CHART_ID;
  test.skip(!id, "Set E2E_CHART_ID to a completed scan (pnpm seed:fixture prints one)");
  await page.goto(`/chart/${id}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Slop chart for");
  await expect(page.getByText("Slop Index", { exact: true })).toBeVisible();
  await expect(page.locator(".region-box").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Share report" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("an unknown chart shows not found", async ({ page }) => {
  await page.goto("/chart/xyz");
  await expect(page.getByRole("heading", { name: "We can't find that chart" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Examine another patient" })).toBeVisible();
});

test("the footer links to the privacy and terms pages", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("navigation", { name: "Footer" });
  await footer.getByRole("link", { name: "Privacy" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Privacy" })).toBeVisible();
  await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Terms" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Terms" })).toBeVisible();
});

test("a chart symptom expands to explain itself", async ({ page }) => {
  const id = process.env.E2E_CHART_ID;
  test.skip(!id, "Set E2E_CHART_ID to a completed scan (pnpm seed:fixture prints one)");
  await page.goto(`/chart/${id}`);
  const first = page.locator("details").first();
  await expect(first).not.toHaveAttribute("open");
  await first.locator("summary").click();
  await expect(first).toHaveAttribute("open");
  await expect(first.getByText(/^(Found in|Not found|Checked)/)).toBeVisible();
});

test("the share popup shows the chart image and prefilled share links", async ({ page, request }) => {
  const id = process.env.E2E_CHART_ID;
  test.skip(!id, "Set E2E_CHART_ID to a completed scan (pnpm seed:fixture prints one)");
  await page.goto(`/chart/${id}`);
  await page.getByRole("button", { name: "Share report" }).click();
  const dialog = page.getByRole("dialog", { name: "Share your slop chart" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("img")).toHaveJSProperty("naturalWidth", 1200);
  await expect(dialog.getByRole("link", { name: "Post on X" })).toHaveAttribute("href", /^https:\/\/x\.com\/intent\/post\?text=Dr\.%20Slop/);
  await expect(dialog.getByRole("link", { name: "Share on LinkedIn" })).toHaveAttribute(
    "href",
    new RegExp(`linkedin\\.com/sharing/share-offsite/\\?url=.*${id}`),
  );
  const image = await request.get(`/chart/${id}/opengraph-image`);
  expect(image.headers()["content-type"]).toBe("image/png");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("the treat popup opens each agent with the prompt filled in", async ({ page }) => {
  const id = process.env.E2E_CHART_ID;
  test.skip(!id, "Set E2E_CHART_ID to a completed scan (pnpm seed:fixture prints one)");
  await page.goto(`/chart/${id}`);
  await page.getByRole("button", { name: "Treat with your agent" }).click();
  const dialog = page.getByRole("dialog", { name: /^Treat .+ with your agent$/ });
  await expect(dialog).toBeVisible();
  const shown = dialog.getByLabel("Prompt for your agent");
  await expect(shown).toContainText("Dr. Slop examined");
  const prompt = await shown.textContent();
  for (const [name, base, param] of [
    ["Open Claude", "claude://code/new", "q"],
    ["Open Codex", "codex://new", "prompt"],
    ["Open Cursor", "https://cursor.com/link/prompt", "text"],
  ]) {
    const href = await dialog.getByRole("link", { name }).getAttribute("href");
    expect(href?.startsWith(`${base}?${param}=`)).toBe(true);
    expect(new URL(href ?? "").searchParams.get(param)).toBe(prompt);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("every chart ends with the AI Product Academy referral", async ({ page }) => {
  const id = process.env.E2E_CHART_ID;
  test.skip(!id, "Set E2E_CHART_ID to a completed scan (pnpm seed:fixture prints one)");
  await page.goto(`/chart/${id}`);
  const referral = page.getByRole("complementary", { name: "Build something the doctor can't diagnose" });
  await expect(referral).toBeVisible();
  const link = referral.getByRole("link", { name: "Join the AI Product Academy" });
  await expect(link).toHaveAttribute("href", "https://www.skool.com/aiapps/about");
  await expect(link).toHaveAttribute("target", "_blank");
});
