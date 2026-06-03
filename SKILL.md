---
name: playwright-e2e
description: Comprehensive Playwright end-to-end testing patterns with Page Object Model, fixtures, and best practices
version: 1.0.0
author: thetestingacademy
license: MIT
testingTypes: [e2e, visual]
frameworks: [playwright]
languages: [typescript, javascript]
domains: [web]
agents: [claude-code, cursor, github-copilot, windsurf, codex, aider, continue, cline, zed, bolt]
---

# Playwright E2E Testing Skill

You are an expert QA automation engineer specializing in Playwright end-to-end testing. When the user asks you to write, review, or debug Playwright E2E tests, follow these detailed instructions.

## Core Principles

### Hard Constraints (Non-negotiable)

1. **User-centric testing** -- Write tests from the user's perspective. Tests should mirror real user journeys.
2. **Test isolation** -- Each test must be independent in terms of execution order. Tests must not fail based on the sequence they run.
3. **No hardcoded secrets** -- Never hardcode credentials or API keys in test files. Use environment variables or `.env` files.
4. **Auto-waiting in CI** -- Avoid `waitForTimeout()` in CI environments. Leverage Playwright's built-in auto-waiting.
5. **Clean up after tests** -- Leave the application in a clean state after each test (delete created data, log out, etc.).

### Database Cleanup (When Applicable)

If your application uses a database, implement a database fixture:

```typescript
// tests/fixtures/db.fixture.ts
import { test as base } from '@playwright/test';

type DbFixture = {
  db: {
    reset: () => Promise<void>;
    cleanup: () => Promise<void>;
  };
};

export const test = base.extend<DbFixture>({
  db: async ({}, use) => {
    // Reset database before test
    await resetDatabase();
    
    await use({
      reset: async () => await resetDatabase(),
      cleanup: async () => await deleteTestData(),
    });
    
    // Clean up after test
    await deleteTestData();
  },
});

async function resetDatabase() {
  // Connect to test database and reset (truncate tables, restore snapshot, etc.)
  // Example: await db.connection.query('TRUNCATE TABLE users');
}

async function deleteTestData() {
  // Delete any test-specific data created during the test
  // Example: await db.connection.query('DELETE FROM users WHERE email LIKE %test%');
}
```

### Style Preferences (Recommended but flexible)

1. **Page Object Model (POM)** -- Prefer POM for pages in shared codebases. Single-file tests or quick debug scripts may use direct page access but add a TODO to extract POM.
2. **Resilient selectors** -- Prefer `getByRole`, `getByText`, `getByLabel`, `getByTestId` over CSS/XPath selectors. Use CSS/XPath only as a last resort with documentation.
3. **Test structure** -- Group related tests using `test.describe()` blocks. This improves readability and allows grouped setup/teardown via `test.beforeEach()` and `test.afterEach()`.
4. **Readability** -- Tests are documentation. Write them so a new team member can understand the intent.

## Secrets and Environment Variables

### Setup

1. Create a `.env.local` file (add to `.gitignore`):
   ```
   TEST_USER_EMAIL=your-test-user@example.com
   TEST_USER_PASSWORD=replace-with-test-password
   BASE_URL=https://example.test
   ```

2. Load environment in `playwright.config.ts`:
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config({ path: '.env.local' });

   export default defineConfig({
     use: {
       baseURL: process.env.BASE_URL,
     },
   });
   ```

### In Tests

```typescript
const email = process.env.TEST_USER_EMAIL || 'default@example.com';
const password = process.env.TEST_USER_PASSWORD || 'DefaultPass123!';
```

### In Shared Test Data

```typescript
// tests/utils/test-data.ts
export const testUsers = {
  validUser: {
    email: process.env.TEST_USER_EMAIL || 'user@example.com',
    password: process.env.TEST_USER_PASSWORD || 'SecurePass123!',
  },
};
```

## Project Structure

Always organize Playwright projects with this structure:

```
tests/
  e2e/
    auth/
      login.spec.ts
      signup.spec.ts
    dashboard/
      dashboard.spec.ts
    checkout/
      cart.spec.ts
      payment.spec.ts
  fixtures/
    auth.fixture.ts
    db.fixture.ts
  pages/
    login.page.ts
    dashboard.page.ts
    base.page.ts
  utils/
    test-data.ts
    helpers.ts
playwright.config.ts
```

## Page Object Model

Implement POM for pages in shared codebases. For single-file or debug tests, direct page usage is acceptable (see Writing Test Specs for examples).

### Base Page Class

```typescript
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
```

### Concrete Page Class

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
  }

  async goto(): Promise<void> {
    await this.navigate('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectErrorMessage(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(message);
  }
}
```

## Writing Test Specs

### Recommended: Grouped Test Structure with POM

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login with valid credentials', async ({ page }) => {
    await loginPage.login('user@example.com', 'SecurePass123!');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await loginPage.login('user@example.com', 'wrongpassword');
    await loginPage.expectErrorMessage('Invalid email or password');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL('/forgot-password');
  });
});
```

### Simple/Debug Tests (Direct Page Usage)

For quick debugging or simple scenarios, direct page usage is acceptable:

```typescript
import { test, expect } from '@playwright/test';

test('Simple login scenario', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'user@example.com');
  await page.fill('input[type="password"]', 'SecurePass123!');
  await page.click('input[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
// TODO: Extract login logic into LoginPage POM when adding more tests
```

## Selectors -- Priority Order

Always choose selectors in this priority order:

1. **`getByRole`** -- Preferred. Matches the accessibility tree.
   ```typescript
   page.getByRole('button', { name: 'Submit' });
   page.getByRole('heading', { level: 1 });
   page.getByRole('link', { name: 'Read more' });
   page.getByRole('textbox', { name: 'Email' });
   ```

2. **`getByLabel`** -- For form inputs associated with labels.
   ```typescript
   page.getByLabel('Email address');
   page.getByLabel('Password');
   ```

3. **`getByPlaceholder`** -- When there is no label.
   ```typescript
   page.getByPlaceholder('Search...');
   ```

4. **`getByText`** -- For non-interactive elements with visible text.
   ```typescript
   page.getByText('Welcome back');
   page.getByText(/total: \$\d+/i);
   ```

5. **`getByTestId`** -- When semantic selectors are not feasible.
   ```typescript
   page.getByTestId('checkout-total');
   ```

6. **CSS/XPath** -- Last resort only. Document why other options failed.
   ```typescript
   // Avoid unless absolutely necessary
   page.locator('.legacy-widget >> nth=0');
   ```

## Assertions

Use Playwright's web-first assertions that auto-retry:

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();

// Text content
await expect(locator).toHaveText('Expected text');
await expect(locator).toContainText('partial');
await expect(locator).toHaveText(/regex pattern/);

// Input values
await expect(locator).toHaveValue('expected value');
await expect(locator).toBeChecked();
await expect(locator).toBeDisabled();

// Page-level
await expect(page).toHaveURL('/expected-path');
await expect(page).toHaveURL(/\/users\/\d+/);
await expect(page).toHaveTitle('Page Title');

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);

// CSS
await expect(locator).toHaveCSS('color', 'rgb(255, 0, 0)');
await expect(locator).toHaveClass(/active/);

// Screenshot comparison
await expect(page).toHaveScreenshot('homepage.png');
await expect(locator).toHaveScreenshot('button-hover.png');
```

## Fixtures

Use custom fixtures to share setup logic and authenticated state:

```typescript
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
```

### Authenticated Tests (Test Isolation & Auth Reuse)

Use `storageState` to reuse authentication across tests while maintaining isolation:

```typescript
// tests/e2e/auth/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

setup('authenticate user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(
    process.env.TEST_USER_EMAIL || 'user@example.com',
    process.env.TEST_USER_PASSWORD || 'SecurePass123!'
  );
  await expect(page).toHaveURL(/.*dashboard.*/);
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

**Important on Isolation**: Each test using the `authenticatedPage` fixture gets a fresh browser context initialized from the stored auth state. This satisfies the isolation requirement (no in-memory state sharing between tests) while allowing credential reuse (persisted authentication artifacts are OK as long as each test has a fresh context).

## Configuration Best Practices

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

## Handling Common Scenarios

### Navigation and Routing

```typescript
test('should navigate through multi-step wizard', async ({ page }) => {
  await page.goto('/wizard');

  // Step 1
  await page.getByLabel('Full name').fill('Jane Doe');
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 2
  await expect(page).toHaveURL('/wizard/step-2');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByRole('button', { name: 'Next' }).click();

  // Step 3 -- confirmation
  await expect(page).toHaveURL('/wizard/step-3');
  await expect(page.getByText('Jane Doe')).toBeVisible();
  await expect(page.getByText('jane@example.com')).toBeVisible();
});
```

### Handling Dialogs

```typescript
test('should handle confirmation dialog', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toBe('Are you sure you want to delete?');
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Item deleted')).toBeVisible();
});
```

### File Upload

```typescript
test('should upload a file', async ({ page }) => {
  const fileInput = page.getByLabel('Upload document');
  await fileInput.setInputFiles('test-data/sample.pdf');
  await expect(page.getByText('sample.pdf')).toBeVisible();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Upload successful')).toBeVisible();
});
```

### Iframe Handling

```typescript
test('should interact with iframe content', async ({ page }) => {
  const iframe = page.frameLocator('#payment-iframe');
  await iframe.getByLabel('Card number').fill('4111111111111111');
  await iframe.getByLabel('Expiry').fill('12/25');
  await iframe.getByLabel('CVC').fill('123');
});
```

### Network Interception

```typescript
test('should mock API response', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Mocked Product', price: 9.99 },
      ]),
    });
  });

  await page.goto('/products');
  await expect(page.getByText('Mocked Product')).toBeVisible();
});

test('should wait for specific API call', async ({ page }) => {
  const responsePromise = page.waitForResponse('**/api/submit');
  await page.getByRole('button', { name: 'Submit' }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
});
```

### Handling Dropdowns and Select Elements

```typescript
// Native select
await page.getByLabel('Country').selectOption('US');
await page.getByLabel('Country').selectOption({ label: 'United States' });

// Custom dropdown
await page.getByRole('combobox', { name: 'Country' }).click();
await page.getByRole('option', { name: 'United States' }).click();
```

## Best Practices

1. **Never use `page.waitForTimeout()`** -- Use auto-waiting or explicit event waits instead.
2. **Always use `test.describe` blocks** to group related tests.
3. **Use `test.beforeEach`** for common setup, but keep it minimal.
4. **Tag tests** for selective execution:
   ```typescript
   test('checkout flow @smoke @critical', async ({ page }) => { ... });
   ```
5. **Use soft assertions** for non-blocking checks:
   ```typescript
   await expect.soft(locator).toHaveText('expected');
   await expect.soft(other).toBeVisible();
   ```
6. **Parameterize tests** with `test.describe` and arrays:
   ```typescript
   const users = [
     { role: 'admin', canDelete: true },
     { role: 'viewer', canDelete: false },
   ];
   for (const { role, canDelete } of users) {
     test(`${role} delete permission`, async ({ page }) => { ... });
   }
   ```
7. **Set reasonable timeouts** at the config level, not in individual tests.
8. **Use trace viewer** for debugging: `npx playwright show-trace trace.zip`
9. **Parallelize wisely** -- Use `fullyParallel: true` but ensure test isolation.
10. **Clean up test data** in `afterEach` or use fixtures with automatic teardown.

## Anti-Patterns to Avoid

1. **Hardcoded waits** -- `await page.waitForTimeout(3000)` is flaky and slow.
2. **Shared mutable state between tests** -- Each test must stand alone.
3. **Testing implementation details** -- Test behavior, not DOM structure.
4. **Overly specific selectors** -- `div.container > ul > li:nth-child(3) > span.text` breaks on any layout change.
5. **Giant test files** -- Keep test files focused on a single feature or page.
6. **Ignoring test isolation** -- Tests that depend on execution order will break in parallel mode.
7. **Not using base URL** -- Always configure `baseURL` and use relative paths in `goto`.
8. **Skipping assertion messages** -- Add context when assertions are ambiguous.
9. **Testing third-party services directly** -- Mock external APIs and payment gateways.
10. **Not cleaning up** -- File uploads, database records, and other side effects must be cleaned.

## Debugging Tips

- Run in headed mode: `npx playwright test --headed`
- Run with UI mode: `npx playwright test --ui`
- Debug a single test: `npx playwright test --debug tests/login.spec.ts`
- Generate code: `npx playwright codegen https://example.com`
- View trace: `npx playwright show-trace test-results/trace.zip`
- Use `test.only` to isolate a single test during development.
- Use `await page.pause()` to pause execution and inspect the page.
