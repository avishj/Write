import { expect, test } from "@playwright/test";

test.describe("page load", () => {
  test("page loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Write/);
  });

  test("defaults to dark theme", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    // Wait for React to hydrate and apply theme
    await page.waitForFunction(
      () => document.querySelector("astro-island")?.hasAttribute("ssr") === false,
    );
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("dark");
    await context.close();
  });

  test("applies custom fonts", async ({ page }) => {
    await page.goto("/");
    const fontFamily = await page.locator("body").evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(fontFamily).toContain("DM Sans");
  });
});
