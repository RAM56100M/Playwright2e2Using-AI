# Playwright E2E Testing Framework

A TypeScript Playwright framework for end-to-end browser testing. The active suite is configured for the Rahul Shetty Academy client app and uses Page Object Model classes, reusable fixtures, storage-state authentication, and environment-based test data.

## Features

- Page Object Model for shared page behavior
- Authentication setup with reusable storage state
- Desktop and mobile browser projects
- HTML, JSON, GitHub, and list reporters
- Screenshots, videos, and traces for failed tests
- Tagged tests such as `@smoke` and `@critical`
- Example-only specs for checkout and advanced testing patterns

## Project Structure

```text
playwright-e2e/
|-- tests/
|   |-- e2e/
|   |   |-- auth/
|   |   |   |-- auth.setup.ts
|   |   |   |-- login.spec.ts
|   |   |   `-- simple-login.spec.ts
|   |   |-- dashboard/
|   |   |   `-- dashboard.spec.ts
|   |   |-- checkout/
|   |   |   `-- cart.spec.ts
|   |   `-- advanced/
|   |       `-- advanced.spec.ts
|   |-- fixtures/
|   |   `-- auth.fixture.ts
|   |-- pages/
|   |   |-- base.page.ts
|   |   |-- login.page.ts
|   |   `-- dashboard.page.ts
|   `-- utils/
|       |-- helpers.ts
|       `-- test-data.ts
|-- playwright.config.ts
|-- package.json
|-- .env.example
`-- README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- Playwright browsers installed with `npx playwright install`

## Setup

```bash
npm install
copy .env.example .env
npx playwright install
```

Then put real test credentials in `.env`:

```bash
BASE_URL=https://rahulshettyacademy.com/client
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=replace-with-test-password
TEST_ADMIN_EMAIL=your-test-admin@example.com
TEST_ADMIN_PASSWORD=replace-with-test-admin-password
```

Never commit real credentials. `.env` is ignored by Git.

## Running Tests

```bash
npm test
npm run test:chromium
npm run test:smoke
npm run test:headed
npm run test:ui
npm run test:debug
npm run typecheck
```

To generate authentication state directly:

```bash
npx playwright test --project=setup
```

Normal browser projects depend on the `setup` project, so `playwright/.auth/user.json` is generated before authenticated tests run.

## Notes

- `tests/e2e/auth` and `tests/e2e/dashboard` are the active runnable suites.
- `tests/e2e/checkout` and `tests/e2e/advanced` are intentionally skipped examples. Remove `test.describe.skip` only after adapting their routes/selectors to your application.
- Page objects use `baseURL` and app routes such as `/client/#/auth/login` and `/client/#/dashboard`.
- Prefer Playwright web-first assertions over `waitForTimeout`.

## Debugging

```bash
npm run report
npm run show:trace test-results/trace.zip
```

Use `npm run test:ui` for interactive debugging and `npm run test:headed` when you want to see the browser.
