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
  await page.goto('/login');

  // Fill in login credentials
  await page.getByLabel('Email').fill(testUsers.validUser.email);
  await page.getByLabel('Password').fill(testUsers.validUser.password);

  // Submit login form
  await page.getByRole('button', { name: /sign in|login/i }).click();

  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /welcome|dashboard/i })).toBeVisible();

  // Save authentication state to file for reuse in tests
  await context.storageState({ path: 'playwright/.auth/user.json' });
});

setup('authenticate admin', async ({ page, context }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in admin credentials
  await page.getByLabel('Email').fill(testUsers.validAdmin.email);
  await page.getByLabel('Password').fill(testUsers.validAdmin.password);

  // Submit login form
  await page.getByRole('button', { name: /sign in|login/i }).click();

  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: /welcome|dashboard/i })).toBeVisible();

  // Save authentication state to file
  await context.storageState({ path: 'playwright/.auth/admin.json' });
});
