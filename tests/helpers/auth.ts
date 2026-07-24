import { Page } from "@playwright/test";

export async function login(page: Page, browserName: string) {
  await page.goto("/login");

  if (browserName === "webkit") {
    await page.waitForLoadState("domcontentloaded");
    await page.getByLabel("Email address").click();
  }

  await page.getByLabel("Email address").fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel("Password").fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/dashboard", { timeout: 10000 });
}
