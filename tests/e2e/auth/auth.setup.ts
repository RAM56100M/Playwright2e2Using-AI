import { test as setup, expect } from '@playwright/test';
import { testUsers } from '../utils/test-data';

/**
 * Authentication Setup
 * Runs once before all tests to store authenticated state
 * This allows tests to reuse authentication instead of logging in each time
 *
 * Run with: npx playwright test --project=setup
 */
setup('authenticate user', async ({ page, context }) => {
  // Navigate to login page
  await page.goto('/#/auth/login');

  // Fill in login credentials
  await page.locator('input[type="email"]').first().fill(testUsers.validUser.email);
  await page.locator('input[type="password"]').first().fill(testUsers.validUser.password);

  // Submit login form
  await page.getByRole('button', { name: /login|sign in/i }).first().click();

  // Verify successful login - wait for dashboard
  await page.waitForURL('**/#/dashboard/**', { timeout: 10000 });
  await expect(page).toHaveURL(/.*\/#\/dashboard.*/);

  // Save authentication state to file for reuse in tests
  await context.storageState({ path: 'playwright/.auth/user.json' });
});

setup('authenticate admin', async ({ page, context }) => {
  // Navigate to login page
  await page.goto('/#/auth/login');

  // Fill in admin credentials (same as user for this app)
  await page.locator('input[type="email"]').first().fill(testUsers.validAdmin.email);
  await page.locator('input[type="password"]').first().fill(testUsers.validAdmin.password);

  // Submit login form
  await page.getByRole('button', { name: /login|sign in/i }).first().click();

  // Verify successful login
  await page.waitForURL('**/#/dashboard/**', { timeout: 10000 });
  await expect(page).toHaveURL(/.*\/#\/dashboard.*/);

  // Save authentication state to file
  await context.storageState({ path: 'playwright/.auth/admin.json' });
});
