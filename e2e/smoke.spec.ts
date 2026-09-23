import { expect, test } from "@playwright/test";

test("intake renders and a signed-out submit opens sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The doctor can see you now");
  await page.getByLabel("Patient's URL").fill("example.com");
  await page.getByRole("button", { name: "Sign in to see the doctor" }).click();
  await expect(page.getByRole("button", { name: "Continue with GitHub" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

test("invalid and private URLs show inline errors", async ({ page }) => {
  await page.goto("/");
  const field = page.getByLabel("Patient's URL");
  const submit = page.getByRole("button", { name: "Sign in to see the doctor" });
  await field.fill("ftp://example.com");
  await submit.click();
  await expect(page.getByText("That doesn't look like a web address.")).toBeVisible();
  await field.fill("localhost:3000");
  await submit.click();
  await expect(page.getByText("The doctor only makes house calls to public websites.")).toBeVisible();
});

test("a completed chart renders for a signed-out visitor", async ({ page }) => {
  const id = process.env.E2E_CHART_ID;
  test.skip(!id, "Set E2E_CHART_ID to a completed scan (pnpm seed:fixture prints one)");
  await page.goto(`/chart/${id}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Chart for");
  await expect(page.getByText("Slop Index", { exact: true })).toBeVisible();
  await expect(page.locator(".region-box").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy discharge papers" })).toBeVisible();
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
