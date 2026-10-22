import { expect, test } from '@playwright/test';

test.describe('student shell', () => {
  test('unauthenticated student redirect to login', async ({ page }) => {
    await page.goto('/student');
    await expect(page).toHaveURL(/\/login/);
  });

  test('student chrome after login when credentials are provided', async ({ page }) => {
    const identifier = process.env.E2E_LOGIN_IDENTIFIER;
    const password = process.env.E2E_LOGIN_PASSWORD;
    test.skip(!identifier || !password, 'Set E2E_LOGIN_IDENTIFIER and E2E_LOGIN_PASSWORD');

    await page.goto('/login?next=%2Fstudent');
    await page.getByLabel(/email or phone/i).fill(identifier!);
    await page.getByLabel(/^password$/i).fill(password!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/student/);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();
  });
});
