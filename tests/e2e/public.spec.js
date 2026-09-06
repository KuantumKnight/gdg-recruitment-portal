import { expect, test } from "@playwright/test";

test.describe("public recruitment flow", () => {
  test("homepage and navigation load without browser errors", async ({ page }) => {
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error" && !message.text().includes("hydration-mismatch")) errors.push(message.text()); });
    await page.goto("/");
    await expect(page).toHaveTitle(/Recruitment 2026/i);
    await page.getByRole("link", { name: /explore teams/i }).click();
    await expect(page).toHaveURL(/\/departments$/);
    expect(errors).toEqual([]);
  });

  test("departments reflect the closed recruitment state", async ({ page }) => {
    await page.goto("/departments");
    await expect(page.getByRole("heading", { name: "Technical Departments", exact: true })).toBeVisible();
    await expect(page.getByText(/This recruitment round has closed/i)).toBeVisible();
    await expect(page.getByLabel(/Select/).first()).toBeVisible();
    await expect(page.getByLabel(/Select/).first()).toBeDisabled();
    await page.goto("/join/c21ca066-ab4d-40a3-943c-f170d6312bdc");
    await expect(page).toHaveURL(/\/join\/[^/]+$/);
  });

  test("sign-in keeps the requested application callback", async ({ page }) => {
    await page.goto("/auth/signin?callbackURL=%2Fjoin%2Fweb-dev");
    await expect(page.getByRole("heading", { name: /Welcome back|Start your story/ })).toBeVisible();
    await expect(page).toHaveURL(/callbackURL=%2Fjoin%2Fweb-dev/);
  });

  test("mobile navigation opens and the page has no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    if ((page.viewportSize()?.width ?? 0) > 768) {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      return;
    }
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("link", { name: "Departments" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});