import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// WCAG 2.1 A and AA 
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

async function signIn(page: Page) {
  // Rename these to match the variables already in your .env.test
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email || !password) {
    throw new Error("Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.test");
  }

  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  // exact, so it doesn't also match the "Show password" button
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
}

test.describe("Accessibility: signed out", () => {
  for (const path of ["/login", "/register", "/forgot-password"]) {
    test(`${path} has no WCAG violations`, async ({ page }) => {
      await page.goto(path);
      await expectNoViolations(page);
    });
  }
});

test.describe("Accessibility: signed in", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  for (const path of [
    "/dashboard",
    "/dashboard/permits",
    "/dashboard/vehicles",
    "/dashboard/household",
    "/dashboard/topup",
  ]) {
    test(`${path} has no WCAG violations`, async ({ page }) => {
      await page.goto(path);
      // Let queries settle so skeletons are replaced by real content
      await page.waitForLoadState("networkidle");
      await expectNoViolations(page);
    });
  }

  test("issue pass dialog has no WCAG violations", async ({ page }) => {
    await page.goto("/dashboard/permits");
    await page.getByRole("button", { name: "Issue a pass" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoViolations(page);
  });
});