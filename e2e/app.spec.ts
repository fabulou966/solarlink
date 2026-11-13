import { test, expect } from "@playwright/test";

test.describe("Public Site", () => {
  test("homepage loads and redirects to Arabic", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar/);
    await expect(page.locator("h1")).toContainText("اجعل الشمس مصدر كهرباء بيتك");
  });

  test("English locale works", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toContainText("Let the sun power your home");
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("nav a", { hasText: "أعمالنا" })).toBeVisible();
    await expect(page.locator("nav a", { hasText: "تواصل معنا" })).toBeVisible();
  });

  test("quote form submits", async ({ page }) => {
    await page.goto("/ar");
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="phone"]', "249123456789");
    await page.fill('input[name="city"]', "Omdurman");
    await page.fill('textarea[name="message"]', "Test message");
    await page.click('button[type="submit"]');
    await expect(page.locator("text=شكرًا")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("h1")).toContainText("Sign in");
  });
});

test.describe("Health Check", () => {
  test("health endpoint responds", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBeDefined();
    expect(body.checks).toBeDefined();
  });
});