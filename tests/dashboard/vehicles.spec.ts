// tests/dashboard/vehicles.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe("Vehicles", () => {
  test.beforeEach(async ({ page, browserName }) => {
    await login(page, browserName);
    await page.goto("/dashboard/vehicles");
  });

  test.afterEach(async ({ page }) => {
    const testVehicles = ["Test Car", "Car To Delete"];

    for (const name of testVehicles) {
      const items = await page
        .locator('[data-testid="vehicle-card"]')
        .filter({ hasText: name })
        .all();
      for (const item of items) {
        await item.getByRole("button", { name: "Delete vehicle" }).click();
        await page.getByRole("button", { name: "Remove" }).click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("can add a vehicle", async ({ page }) => {
    await page.getByRole("button", { name: "Add vehicle" }).click();

    await page.getByLabel("Registration plate").fill("AB12 CDE");
    await page.getByLabel("Nickname").fill("Test Car");

    await page.getByRole("button", { name: "Save vehicle" }).click();

    await expect(page.getByText("Test Car")).toBeVisible({ timeout: 5000 });
  });

  test("can delete a vehicle", async ({ page }) => {
    // Create a vehicle to delete
    await page.getByRole("button", { name: "Add vehicle" }).click();
    await page.getByLabel("Registration plate").fill("XY99 ZZZ");
    await page.getByLabel("Nickname").fill("Car To Delete");
    await page.getByRole("button", { name: "Save vehicle" }).click();
    await expect(page.getByText("Car To Delete")).toBeVisible({
      timeout: 5000,
    });

    // Delete it
    await page
      .locator('[data-testid="vehicle-card"]')
      .filter({ hasText: "Car To Delete" })
      .getByRole("button", { name: "Delete vehicle" })
      .click();

    await expect(page.getByText("Remove vehicle")).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(500); // wait for animation to complete
    await page.getByRole("button", { name: "Remove" }).click();

    await expect(
      page.locator('[data-testid="vehicle-card"]').filter({ hasText: "Car To Delete" }),
    ).not.toBeVisible();
  });
});
