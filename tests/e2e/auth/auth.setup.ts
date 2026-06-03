import { test as setup, expect } from '@playwright/test';
import { testUsers } from '../../utils/test-data';

/**
 * Authentication Setup
 * Runs once before all tests to store authenticated state
 * This allows tests to reuse authentication instead of logging in each time
 *
 * Run with: npx playwright test --project=setup
 */
setup('authenticate user', async ({ page, context }) => {
  // Navigate to login page with full URL
  await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
  
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  // Fill in login credentials
  await page.fill('input[type="email"]', testUsers.validUser.email);
  await page.fill('input[type="password"]', testUsers.validUser.password);

  // Submit login form
  await page.click('input[type="submit"][name="login"]');

  // Verify successful login - wait for dashboard
  await page.waitForURL('**/client/#/dashboard/**', { timeout: 15000 });

  // Save authentication state to file for reuse in tests
  await context.storageState({ path: 'playwright/.auth/user.json' });
});

setup('authenticate admin', async ({ page, context }) => {
  // Navigate to login page with full URL
  await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
  
  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');

  // Fill in admin credentials
  await page.fill('input[type="email"]', testUsers.validAdmin.email);
  await page.fill('input[type="password"]', testUsers.validAdmin.password);

  // Submit login form
  await page.click('input[type="submit"][name="login"]');

  // Verify successful login
  await page.waitForURL('**/client/#/dashboard/**', { timeout: 15000 });

  // Save authentication state to file
  await context.storageState({ path: 'playwright/.auth/admin.json' });
});
