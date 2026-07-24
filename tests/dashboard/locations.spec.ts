// tests/dashboard/locations.spec.ts
import { test, expect } from "@playwright/test";
import { login } from "../helpers/auth";

test.describe("Locations", () => {
  test.beforeEach(async ({ page, browserName }) => {
    await login(page, browserName);
  });

  test.afterEach(async ({ page }) => {
    const testLocations = ["Test Location", "Location To Delete"];

    for (const name of testLocations) {
      const items = await page
        .getByRole("listitem")
        .filter({ hasText: name })
        .all();
      for (const item of items) {
        await item.hover();
        await item.getByRole("button", { name: "Delete location" }).click();
        await page.getByRole("button", { name: "Remove" }).click();
        await page.waitForTimeout(500);
      }
    }
  });

  test("can add a new location", async ({ page }) => {
    await page.getByRole("button", { name: "Add location" }).click();

    await page.getByLabel("Nickname").fill("Test Location");
    await page.getByLabel("Address line 1").fill("123 Test Street");
    await page.getByLabel("City").fill("London");
    await page.getByLabel("Postcode").fill("E5 9RB");
    await page.getByLabel("Postcode").press("Tab");

    await expect(page.getByText(/Detected:/)).toBeVisible({ timeout: 8000 });

    await page.getByRole("button", { name: "Save location" }).click();

    await expect(
      page.getByRole("listitem").filter({ hasText: "Test Location" }),
    ).toBeVisible({ timeout: 5000 });
  });

  test("rejects non-London postcodes", async ({ page }) => {
    await page.getByRole("button", { name: "Add location" }).click();

    await page.getByLabel("Postcode").fill("M1 1AE");
    await page.getByLabel("Postcode").press("Tab");

    await expect(page.getByText(/not a supported London borough/)).toBeVisible({
      timeout: 8000,
    });

    await expect(
      page.getByRole("button", { name: "Save location" }),
    ).toBeDisabled();
  });

  test("can delete a location", async ({ page }) => {
    // Create a location to delete
    await page.getByRole("button", { name: "Add location" }).click();
    await expect(page.getByLabel("Postcode")).toBeEnabled({ timeout: 5000 });
    await page.getByLabel("Nickname").fill("Location To Delete");
    await page.getByLabel("Address line 1").fill("99 Delete Street");
    await page.getByLabel("City").fill("London");
    await page.getByLabel("Postcode").fill("E5 9RB");
    await page.getByLabel("Postcode").press("Tab");
    await expect(page.getByText(/Detected:/)).toBeVisible({ timeout: 8000 });
    await page.getByRole("button", { name: "Save location" }).click();
    await expect(page.getByText("Location To Delete")).toBeVisible({
      timeout: 5000,
    });

    // Now delete it
    await page
      .getByRole("listitem")
      .filter({ hasText: "Location To Delete" })
      .getByRole("button", { name: "Delete location" })
      .click();
    await page.getByRole("button", { name: "Remove" }).click();

    await expect(
      page.getByRole("listitem").filter({ hasText: "Location To Delete" }),
    ).not.toBeVisible();
  });
});
