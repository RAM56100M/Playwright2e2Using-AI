import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { testUsers } from '../../utils/test-data';

/**
 * Simple Login Scenario
 * Just open URL, enter username, password, and click login
 */
test('Simple Login Scenario', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
  await expect(page).toHaveURL(/.*\/#\/dashboard.*/);
});
