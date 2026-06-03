import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/dashboard.page';
import { testUsers, testUrls } from '../../utils/test-data';

test.describe('Dashboard Functionality', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('@smoke should load dashboard successfully', async () => {
    await dashboardPage.expectDashboardLoaded();
    await dashboardPage.expectMainContentVisible();
  });

  test('should display user greeting', async () => {
    await dashboardPage.expectUserGreeting();
  });

  test('should have working logout button', async () => {
    await dashboardPage.logout();
    const currentUrl = await dashboardPage.getCurrentUrl();
    expect(
      currentUrl.includes(testUrls.login) || currentUrl.includes(testUrls.home)
    ).toBeTruthy();
  });

  test('should navigate to profile when profile button clicked', async ({ page }) => {
    await dashboardPage.clickProfile();
    // Verify navigation or profile modal appears
    const profileHeading = page.getByRole('heading', { name: /profile|account/i });
    await expect(profileHeading).toBeVisible();
  });

  test('should maintain dashboard state on page refresh', async () => {
    const headingBefore = await dashboardPage.getHeadingText();
    await dashboardPage.refresh();
    const headingAfter = await dashboardPage.getHeadingText();
    expect(headingBefore).toBe(headingAfter);
  });

  test('@critical should verify authenticated user access', async ({ page }) => {
    await dashboardPage.expectDashboardLoaded();
    await expect(page.getByText(testUsers.validUser.name)).toBeVisible();
  });
});
