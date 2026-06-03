import { test, expect } from '@playwright/test';
import { testUsers } from '../utils/test-data';

/**
 * Simple Login Scenario
 * Just open URL, enter username, password, and click login
 */
test('Simple Login Scenario', async ({ page }) => {
  // Step 1: Open the login URL
  console.log('Step 1: Opening login page...');
  await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
  await page.waitForLoadState('domcontentloaded');

  // Step 2: Enter username (email)
  console.log('Step 2: Entering email...');
  await page.fill('input[type="email"]', testUsers.validUser.email);
  console.log(`Email entered: ${testUsers.validUser.email}`);

  // Step 3: Enter password
  console.log('Step 3: Entering password...');
  await page.fill('input[type="password"]', testUsers.validUser.password);
  console.log(`Password entered: ${testUsers.validUser.password}`);

  // Step 4: Click login button and wait for navigation
  console.log('Step 4: Clicking login button...');
  
  // Listen for all requests/responses
  const requests: string[] = [];
  const responses: string[] = [];
  
  page.on('request', request => {
    requests.push(`${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    responses.push(`${response.status()} ${response.url()}`);
  });

  // Click the login button
  await page.click('input[type="submit"][name="login"]');
  
  // Wait for network to settle
  await page.waitForTimeout(3000);
  
  console.log('\n=== Requests ===');
  requests.slice(-5).forEach(r => console.log(r));
  console.log('\n=== Responses ===');
  responses.slice(-5).forEach(r => console.log(r));

  // Take screenshot of result
  await page.screenshot({ path: 'login-result.png', fullPage: true });

  // Log current URL
  const currentUrl = page.url();
  console.log(`\nCurrent URL after login: ${currentUrl}`);

  // Check for error messages
  const errorVisibility = await page.locator('.error, [role="alert"]').isVisible().catch(() => false);
  if (errorVisibility) {
    const errorText = await page.locator('.error, [role="alert"]').textContent();
    console.log(`Error found: ${errorText}`);
  }

  // Check if we're on dashboard or still on login
  if (currentUrl.includes('dashboard')) {
    console.log('✓ Login successful! Navigated to dashboard.');
  } else {
    console.log('✗ Still on login page. Login appears to have failed.');
  }
});
