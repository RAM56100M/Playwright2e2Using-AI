import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard Page Object
 * Encapsulates selectors and actions for the dashboard page
 */
export class DashboardPage extends BasePage {
  readonly welcomeHeading: Locator;
  readonly userGreeting: Locator;
  readonly logoutButton: Locator;
  readonly profileButton: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeHeading = page.getByRole('heading', { name: /welcome|dashboard/i });
    this.userGreeting = page.getByText(/welcome|hello/i);
    this.logoutButton = page.getByRole('button', { name: /logout|sign out|exit/i });
    this.profileButton = page.getByRole('button', { name: /profile|account|user/i });
    this.mainContent = page.getByRole('main');
  }

  /**
   * Navigate to dashboard
   */
  async goto(): Promise<void> {
    await this.navigate('/dashboard');
  }

  /**
   * Verify dashboard is loaded successfully
   */
  async expectDashboardLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/dashboard');
    await expect(this.welcomeHeading).toBeVisible();
  }

  /**
   * Verify user greeting is visible
   */
  async expectUserGreeting(userName?: string): Promise<void> {
    await expect(this.userGreeting).toBeVisible();
    if (userName) {
      await expect(this.userGreeting).toContainText(userName);
    }
  }

  /**
   * Click logout button
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /**
   * Click profile button
   */
  async clickProfile(): Promise<void> {
    await this.profileButton.click();
  }

  /**
   * Check if main content is visible
   */
  async expectMainContentVisible(): Promise<void> {
    await expect(this.mainContent).toBeVisible();
  }

  /**
   * Get the heading text
   */
  async getHeadingText(): Promise<string> {
    return this.welcomeHeading.textContent() || '';
  }
}
