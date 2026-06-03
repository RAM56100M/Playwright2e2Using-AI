import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { testUsers } from '../../utils/test-data';

/**
 * Authentication Setup
 * Runs once before all tests to store authenticated state
 * This allows tests to reuse authentication instead of logging in each time
 *
 * Run with: npx playwright test --project=setup
 */
setup('authenticate user', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
  await expect(page).toHaveURL(/.*\/#\/dashboard.*/, { timeout: 15000 });

  await context.storageState({ path: 'playwright/.auth/user.json' });
});

setup('authenticate admin', async ({ page, context }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUsers.validAdmin.email, testUsers.validAdmin.password);
  await expect(page).toHaveURL(/.*\/#\/dashboard.*/, { timeout: 15000 });

  await context.storageState({ path: 'playwright/.auth/admin.json' });
});
