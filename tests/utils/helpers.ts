import { Page } from '@playwright/test';

/**
 * Helper Functions
 * Reusable utilities for common test operations
 */

/**
 * Wait for a specific amount of time
 * Use sparingly - prefer auto-waiting mechanisms
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshotWithTimestamp(
  page: Page,
  name: string
): Promise<Buffer> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return page.screenshot({
    path: `screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Get all console messages during test execution
 */
export async function captureConsoleLogs(page: Page): Promise<string[]> {
  const logs: string[] = [];

  page.on('console', (msg) => {
    logs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  return logs;
}

/**
 * Extract table data from the page
 */
export async function getTableData(page: Page, selector: string): Promise<string[][]> {
  return page.evaluate((tableSelector) => {
    const rows = document.querySelectorAll(`${tableSelector} tbody tr`);
    const data: string[][] = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      const rowData: string[] = [];
      cells.forEach((cell) => {
        rowData.push(cell.textContent?.trim() || '');
      });
      data.push(rowData);
    });

    return data;
  }, selector);
}

/**
 * Get all text values from a list
 */
export async function getListItems(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((itemSelector) => {
    const items = document.querySelectorAll(itemSelector);
    return Array.from(items).map((item) => item.textContent?.trim() || '');
  }, selector);
}

/**
 * Check if element has specific CSS class
 */
export async function hasClass(
  page: Page,
  selector: string,
  className: string
): Promise<boolean> {
  return page.evaluate(
    ({ sel, cls }) => {
      return document.querySelector(sel)?.classList.contains(cls) || false;
    },
    { sel: selector, cls: className }
  );
}

/**
 * Get attribute value
 */
export async function getAttribute(
  page: Page,
  selector: string,
  attribute: string
): Promise<string | null> {
  return page.evaluate(
    ({ sel, attr }) => {
      return document.querySelector(sel)?.getAttribute(attr) || null;
    },
    { sel: selector, attr: attribute }
  );
}

/**
 * Fill input field and verify value
 */
export async function fillAndVerify(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  const locator = page.locator(selector);
  await locator.fill(value);
  await locator.evaluate((el: HTMLInputElement, expectedValue) => {
    if (el.value !== expectedValue) {
      throw new Error(`Expected value "${expectedValue}" but got "${el.value}"`);
    }
  }, value);
}
