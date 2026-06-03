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
    await expect(page.getByRole('heading', { name: /welcome|dashboard/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);
    await loginPage.expectErrorMessage(errorMessages.invalidCredentials);
  });

  test('should show error for empty email', async () => {
    await loginPage.login('', testUsers.validUser.password);
    await loginPage.expectErrorMessage(errorMessages.emptyEmail);
  });

  test('should show error for empty password', async () => {
    await loginPage.login(testUsers.validUser.email, '');
    await loginPage.expectErrorMessage(errorMessages.emptyPassword);
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await loginPage.clickForgotPassword();
    await expect(page).toHaveURL(testUrls.forgotPassword);
  });

  test('should navigate to signup page', async ({ page }) => {
    await loginPage.clickSignup();
    await expect(page).toHaveURL(testUrls.signup);
  });

  test('should clear form when clear button is clicked', async () => {
    await loginPage.emailInput.fill(testUsers.validUser.email);
    await loginPage.passwordInput.fill(testUsers.validUser.password);
    await loginPage.clearForm();
    await expect(loginPage.emailInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
  });

  test('@critical should persist session after login', async ({ page, context }) => {
    // Login
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    await loginPage.expectLoginSuccess();

    // Reload page
    await page.reload();

    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(testUrls.dashboard);
    await expect(page.getByRole('heading', { name: /welcome|dashboard/i })).toBeVisible();
  });

  test('should handle multiple login attempts', async () => {
    // First failed attempt
    await loginPage.login(testUsers.invalidUser.email, testUsers.invalidUser.password);
    await loginPage.expectErrorMessage(errorMessages.invalidCredentials);

    // Clear and try again
    await loginPage.clearForm();

    // Second successful attempt
    await loginPage.login(testUsers.validUser.email, testUsers.validUser.password);
    await loginPage.expectLoginSuccess();
  });
});
