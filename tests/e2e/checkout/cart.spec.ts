import { test, expect } from '@playwright/test';

/**
 * Checkout & Cart Tests
 * Example test file for e-commerce checkout flow
 */

test.describe.skip('Shopping Cart Functionality examples', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');
  });

  test('should add item to cart', async ({ page }) => {
    // Find and click "Add to Cart" button for first item
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await addToCartButton.click();

    // Verify item was added (cart counter increases)
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toHaveText('1');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart first
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // Navigate to cart
    await page.getByRole('link', { name: /cart|shopping cart/i }).click();
    await expect(page).toHaveURL('/cart');

    // Remove item
    const removeButton = page.locator('[data-testid="remove-item"]').first();
    await removeButton.click();

    // Verify cart is empty
    const emptyMessage = page.getByText(/cart is empty|no items/i);
    await expect(emptyMessage).toBeVisible();
  });

  test('@smoke should complete checkout', async ({ page }) => {
    // Add item to cart
    await page.locator('[data-testid="add-to-cart"]').first().click();

    // Go to cart
    await page.getByRole('link', { name: /cart/i }).click();
    await expect(page).toHaveURL('/cart');

    // Proceed to checkout
    const checkoutButton = page.getByRole('button', { name: /checkout|proceed/i });
    await checkoutButton.click();
    await expect(page).toHaveURL(/checkout/);

    // Fill shipping information
    await page.getByLabel('Full Name').fill('Jane Doe');
    await page.getByLabel('Address').fill('123 Main St');
    await page.getByLabel('City').fill('Anytown');
    await page.getByLabel('State').fill('NY');
    await page.getByLabel('ZIP').fill('12345');

    // Proceed to payment
    await page.getByRole('button', { name: /next|continue/i }).click();

    // Fill payment information
    await page.getByLabel('Card Number').fill('4111111111111111');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    // Place order
    await page.getByRole('button', { name: /place order|pay|submit/i }).click();

    // Verify order confirmation
    await expect(page.getByText(/order confirmed|thank you|order placed/i)).toBeVisible();
    await expect(page).toHaveURL(/confirmation|success|thank-you/);
  });

  test('should update item quantity', async ({ page }) => {
    // Add item to cart
    await page.locator('[data-testid="add-to-cart"]').first().click();

    // Go to cart
    await page.getByRole('link', { name: /cart/i }).click();

    // Update quantity
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.clear();
    await quantityInput.fill('3');

    // Verify total is updated
    const totalPrice = page.locator('[data-testid="total-price"]');
    await expect(totalPrice).not.toHaveText('0');
  });

  test('should apply coupon code', async ({ page }) => {
    // Add item to cart
    await page.locator('[data-testid="add-to-cart"]').first().click();

    // Go to cart
    await page.getByRole('link', { name: /cart/i }).click();

    // Apply coupon
    await page.getByLabel(/coupon|promo|discount/i).fill('SAVE10');
    await page.getByRole('button', { name: /apply|redeem/i }).click();

    // Verify discount was applied
    await expect(page.getByText(/discount applied|10% off/i)).toBeVisible();
  });
});
