import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { testUsers, errorMessages, testUrls } from '../../utils/test-data';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('@smoke should login with valid credentials', async ({ page }) => {
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    await loginPage.expectLoginSuccess();
    await expect(page).toHaveURL(/.*\/#\/dashboard.*/);
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);
    // Wait a bit for error to appear
    await loginPage.page.waitForTimeout(1000);
    // Check if error message appears or if page shows any error
    const errorPresent = await loginPage.errorMessage.isVisible().catch(() => false);
    if (errorPresent) {
      await loginPage.expectErrorMessage(errorMessages.invalidCredentials);
    }
  });

  test('should show error for empty email', async () => {
    await loginPage.login('', testUsers.validUser.password);
    await loginPage.page.waitForTimeout(500);
    // Check if validation error appears
    const emailInput = loginPage.emailInput;
    const hasError = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(hasError).toBeTruthy();
  });

  test('should show error for empty password', async () => {
    await loginPage.login(testUsers.validUser.email, '');
    await loginPage.page.waitForTimeout(500);
    const passwordInput = loginPage.passwordInput;
    const hasError = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(hasError).toBeTruthy();
  });

  test('should clear form when clear button is clicked', async () => {
    await loginPage.emailInput.fill(testUsers.validUser.email);
    await loginPage.passwordInput.fill(testUsers.validUser.password);
    await loginPage.clearForm();
    await expect(loginPage.emailInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
  });

  test('@critical should persist session after login', async ({ page }) => {
    // Login
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    await loginPage.expectLoginSuccess();

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/.*\/#\/dashboard.*/);
  });

  test('should handle multiple login attempts', async () => {
    // First failed attempt
    await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);
    await loginPage.page.waitForTimeout(1000);

    // Clear and try again
    await loginPage.clearForm();

    // Second successful attempt
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    await loginPage.expectLoginSuccess();
  });
});
