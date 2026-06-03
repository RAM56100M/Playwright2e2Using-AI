# Playwright E2E Testing Framework

A comprehensive end-to-end testing framework built with Playwright, featuring Page Object Model (POM), fixtures, and best practices for modern web applications.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Page Object Model](#page-object-model)
- [Fixtures](#fixtures)
- [Best Practices](#best-practices)
- [Debugging](#debugging)
- [CI/CD Integration](#cicd-integration)

## ✨ Features

- ✅ **Page Object Model (POM)** - Maintainable and scalable test structure
- ✅ **Custom Fixtures** - Reusable authentication and page objects
- ✅ **Multiple Browsers** - Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- ✅ **Parallel Execution** - Run tests in parallel for faster feedback
- ✅ **Screenshots & Videos** - Automatic capture on failures
- ✅ **Trace Viewer** - Debug failed tests with detailed traces
- ✅ **HTML Reports** - Beautiful test reports with detailed information
- ✅ **Test Tagging** - Organize and filter tests with tags (@smoke, @critical, etc.)
- ✅ **Resilient Selectors** - Use accessibility-based selectors for durability

## 📁 Project Structure

```
playwright-e2e/
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── auth.setup.ts        # Authentication setup for state reuse
│   │   │   └── login.spec.ts        # Login tests
│   │   └── dashboard/
│   │       └── dashboard.spec.ts    # Dashboard tests
│   ├── pages/
│   │   ├── base.page.ts             # Base page class
│   │   ├── login.page.ts            # Login page object
│   │   └── dashboard.page.ts        # Dashboard page object
│   ├── fixtures/
│   │   └── auth.fixture.ts          # Custom fixtures for tests
│   └── utils/
│       ├── test-data.ts             # Centralized test data
│       └── helpers.ts               # Reusable helper functions
├── playwright.config.ts             # Playwright configuration
├── package.json                     # Project dependencies
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

## 📦 Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- A **running web application** to test against

## 🚀 Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd playwright-e2e
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

5. **Update .env with your application URL:**
   ```bash
   BASE_URL=http://localhost:3000
   ```

## ⚙️ Configuration

The `playwright.config.ts` file contains all Playwright configurations:

- **Test Directory**: `./tests/e2e`
- **Timeout**: 10 seconds for actions, 30 seconds for navigation
- **Retries**: 2 in CI, 0 locally
- **Workers**: 1 in CI, unlimited locally (parallel execution)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Screenshots**: Only on failure
- **Videos**: Retained on failure
- **Traces**: On first retry

### Modify Configuration

Edit `playwright.config.ts` to adjust:
- Base URL
- Timeouts
- Number of workers
- Browser configurations
- Reporter settings

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Headed Mode (see browser)
```bash
npm run test:headed
```

### Run Tests in UI Mode (interactive)
```bash
npm run test:ui
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Tests

By tag:
```bash
npm run test:smoke          # Run @smoke tagged tests
```

By browser:
```bash
npm run test:chromium       # Chromium only
npm run test:firefox        # Firefox only
npm run test:webkit         # WebKit only
npm run test:mobile         # Mobile browsers
```

Specific file:
```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

Specific test:
```bash
npx playwright test -g "should login with valid credentials"
```

### Generate Authentication State
```bash
npx playwright test --project=setup
```

This runs the setup tests and generates `playwright/.auth/user.json`.

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Login Feature', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('@smoke should login successfully', async ({ page }) => {
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Using Fixtures

```typescript
import { test, expect } from '../fixtures/auth.fixture';
import { testUsers } from '../utils/test-data';

test('should display dashboard', async ({ authenticatedPage }) => {
  const dashboardPage = new DashboardPage(authenticatedPage);
  await dashboardPage.goto();
  await dashboardPage.expectDashboardLoaded();
});
```

### Test Tagging

```typescript
test('@smoke @critical should login', async ({ page }) => {
  // Test with multiple tags
});
```

## 🏗️ Page Object Model

### Creating a Page Object

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class MyPage extends BasePage {
  readonly heading: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /my page/i });
    this.submitButton = page.getByRole('button', { name: /submit/i });
  }

  async goto(): Promise<void> {
    await this.navigate('/my-page');
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
```

### Using Page Objects in Tests

```typescript
test('should complete form', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.goto();
  await myPage.submit();
});
```

## 🔧 Fixtures

Fixtures provide reusable setup and teardown logic:

```typescript
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
    // Teardown if needed
  },
});
```

Use in tests:
```typescript
test('should work', async ({ loginPage }) => {
  await loginPage.login('user@example.com', 'password');
});
```

## 📚 Best Practices

1. **User-Centric Testing** - Test from the user's perspective, not implementation details
2. **Resilient Selectors** - Prefer `getByRole`, `getByLabel`, `getByText` over CSS/XPath
3. **Avoid Hard Waits** - Use Playwright's auto-waiting instead of `waitForTimeout()`
4. **Test Isolation** - Each test should be independent and not rely on others
5. **Meaningful Names** - Use descriptive test names that explain what is being tested
6. **Test Data Centralization** - Keep test data in `tests/utils/test-data.ts`
7. **Screenshot Assertions** - Use visual regression testing for UI consistency
8. **Parallel Execution** - Configure tests for parallel execution when safe

## 🐛 Debugging

### Run in Debug Mode
```bash
npm run test:debug
```

### Use UI Mode (Recommended)
```bash
npm run test:ui
```

### View Traces
```bash
npm run show:trace test-results/trace.zip
```

### View HTML Report
```bash
npm run report
```

### Pause Execution
```typescript
await page.pause(); // Pause and open inspector
```

### Capture Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

### Generate Tests
```bash
npm run codegen http://localhost:3000
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Environment Variables in CI

Set these environment variables in your CI/CD pipeline:

```bash
CI=true
BASE_URL=https://staging.example.com
```

## 📖 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Guide](https://playwright.dev/docs/pom)
