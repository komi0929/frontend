import { test, expect } from "@playwright/test";

test("Live screen exists", async ({ page }) => {
  await page.goto("http://localhost:3000/display/live");
  await expect(page.getByTestId("main-status")).toBeVisible();
  await expect(page.getByTestId("mic-button")).toBeVisible();
});