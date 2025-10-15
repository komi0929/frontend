import { test, expect } from "@playwright/test";

test("Welcome screen PRD v2.2", async ({ page }) => {
  await page.goto("http://localhost:3000/display");
  await expect(page.getByTestId("welcome-language-prompt")).toBeVisible();
  await expect(page.getByTestId("lang-en")).toBeVisible();
  await expect(page.getByTestId("lang-ko")).toBeVisible();
  await expect(page.getByTestId("lang-zh")).toBeVisible();
  await expect(page.getByTestId("btn-settings")).toBeVisible();
});