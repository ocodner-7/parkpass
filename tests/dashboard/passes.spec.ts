import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe("Passes", () => {
  test.beforeEach(async ({ page, browserName }) => {
    await login(page, browserName);
    await page.goto("/dashboard/permits");
  });

  test("can issue a pass", async ({ page }) => {
    await page.getByRole("button", { name: "Issue pass" }).click();

    // Select saved vehicle tab is default, pick first vehicle
    await page.locator('[data-testid="vehicle-option"]').first().click();

    // Select 1 hour duration
    await page.getByRole("button", { name: /1h £/ }).click();

    await page.getByRole("button", { name: "Add pass" }).click();

    await expect(page.locator(".fixed.inset-0")).not.toBeVisible({
      timeout: 10000,
    });

    await page.getByRole("button", { name: /Active/ }).click();
  });

  test("active passes tab shows issued passes", async ({ page }) => {
    await page.getByRole("button", { name: /Active/ }).click();
  });

  test("history tab exists", async ({ page }) => {
    await page.getByRole("button", { name: /Active/ }).click();
    await page.getByRole("button", { name: /History/ }).click();
  });
});
