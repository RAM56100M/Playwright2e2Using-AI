import { test, expect } from '@playwright/test';

/**
 * Advanced Testing Patterns
 * Demonstrates network mocking, API testing, and advanced interactions
 */

test.describe('Advanced Testing Patterns', () => {
  test('should mock API response', async ({ page }) => {
    // Mock the products API endpoint
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Mocked Product', price: 9.99 },
          { id: 2, name: 'Another Product', price: 19.99 },
        ]),
      });
    });

    // Navigate to products page
    await page.goto('/products');

    // Verify mocked products appear
    await expect(page.getByText('Mocked Product')).toBeVisible();
    await expect(page.getByText('Another Product')).toBeVisible();
  });

  test('should wait for specific API call', async ({ page }) => {
    // Set up listener for API response
    const responsePromise = page.waitForResponse('**/api/submit');

    // Navigate and trigger the API call
    await page.goto('/form');
    await page.getByRole('button', { name: /submit/i }).click();

    // Wait for and verify the response
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('success');
  });

  test('should handle dialogs', async ({ page }) => {
    // Set up dialog listener
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toBe('Are you sure?');
      await dialog.accept();
    });

    await page.goto('/');
    await page.getByRole('button', { name: /delete/i }).click();

    // Verify action completed after accepting dialog
    await expect(page.getByText(/deleted successfully/i)).toBeVisible();
  });

  test('should handle file upload', async ({ page }) => {
    await page.goto('/upload');

    // Upload file
    const fileInput = page.getByLabel('Upload file');
    await fileInput.setInputFiles('test-data/sample.pdf');

    // Verify file was uploaded
    await expect(page.getByText('sample.pdf')).toBeVisible();

    // Submit form
    await page.getByRole('button', { name: /submit/i }).click();

    // Verify success
    await expect(page.getByText(/upload successful|file uploaded/i)).toBeVisible();
  });

  test('should interact with iframe content', async ({ page }) => {
    await page.goto('/payment');

    // Access iframe content
    const iframe = page.frameLocator('#payment-iframe');

    // Fill payment form inside iframe
    await iframe.getByLabel('Card number').fill('4111111111111111');
    await iframe.getByLabel('Expiry').fill('12/25');
    await iframe.getByLabel('CVC').fill('123');

    // Submit form outside iframe
    await page.getByRole('button', { name: /pay|submit/i }).click();

    // Verify payment success
    await expect(page.getByText(/payment successful|transaction complete/i)).toBeVisible();
  });

  test('should handle native select elements', async ({ page }) => {
    await page.goto('/form');

    // Select from native select element
    await page.getByLabel('Country').selectOption('US');

    // Verify selection
    await expect(page.getByLabel('Country')).toHaveValue('US');

    // Select by label
    await page.getByLabel('Language').selectOption({ label: 'English' });
    await expect(page.getByLabel('Language')).toHaveValue('en');
  });

  test('should interact with custom dropdowns', async ({ page }) => {
    await page.goto('/form');

    // Click to open custom dropdown
    await page.getByRole('combobox', { name: 'Select option' }).click();

    // Click option
    await page.getByRole('option', { name: 'Option 1' }).click();

    // Verify selection
    await expect(page.getByRole('combobox', { name: 'Select option' })).toHaveText(
      'Option 1'
    );
  });

  test('should use soft assertions for non-blocking checks', async ({ page }) => {
    await page.goto('/dashboard');

    // Soft assertions don't stop test execution on failure
    await expect.soft(page.getByText('Welcome')).toBeVisible();
    await expect.soft(page.getByText('Non-existent')).toBeVisible();
    await expect.soft(page.getByRole('link', { name: 'Profile' })).toBeVisible();

    // Test continues even if soft assertions fail
    // All assertions are reported at the end
  });

  test('should perform visual regression testing', async ({ page }) => {
    await page.goto('/');

    // Compare full page screenshot with baseline
    await expect(page).toHaveScreenshot('homepage.png');

    // Compare specific element screenshot
    const button = page.getByRole('button', { name: /sign in/i });
    await expect(button).toHaveScreenshot('signin-button.png');

    // Update baseline if intentional changes were made:
    // npx playwright test --update-snapshots
  });

  test('should handle multiple page contexts', async ({ browser }) => {
    // Create two separate browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Use both pages independently
    await page1.goto('/');
    await page2.goto('/products');

    await expect(page1.getByRole('heading')).toBeVisible();
    await expect(page2.getByText('Products')).toBeVisible();

    // Clean up
    await context1.close();
    await context2.close();
  });

  test('should capture performance metrics', async ({ page }) => {
    // Measure page load performance
    const navigationTiming = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        timeToFirstByte: navigation.responseStart - navigation.requestStart,
      };
    });

    console.log('Performance Metrics:', navigationTiming);

    // Assert performance thresholds
    expect(navigationTiming.domContentLoaded).toBeLessThan(5000);
    expect(navigationTiming.loadComplete).toBeLessThan(10000);
  });
});
