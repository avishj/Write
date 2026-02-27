import { expect, test } from "@playwright/test";

test.describe("page load", () => {
  test("page loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Write/);
  });
});
