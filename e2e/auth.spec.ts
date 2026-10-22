import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('public auth', () => {
  test('login page is reachable and has no critical axe violations', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );
    expect(serious).toEqual([]);
  });

  test('unauthenticated admin redirect to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login happy path when credentials are provided', async ({ page }) => {
    const identifier = process.env.E2E_LOGIN_IDENTIFIER;
    const password = process.env.E2E_LOGIN_PASSWORD;
    test.skip(!identifier || !password, 'Set E2E_LOGIN_IDENTIFIER and E2E_LOGIN_PASSWORD');

    await page.goto('/login');
    await page.getByLabel(/email or phone/i).fill(identifier!);
    await page.getByLabel(/^password$/i).fill(password!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/(admin|staff|parent|student|it)/);
  });
});
