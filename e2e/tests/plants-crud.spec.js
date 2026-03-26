/**
 * Plant CRUD E2E Tests
 * ---------------------
 * Tests the full Create, Read, Update, Delete lifecycle for plants:
 *   - Create a new plant with valid data
 *   - View plant on the dashboard
 *   - View plant detail page
 *   - Edit plant details
 *   - Delete a plant
 *   - Validation of plant form inputs
 *
 * MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
 */

const { test, expect } = require('@playwright/test');

// Helper function to register and login a fresh user for each test suite
async function loginFreshUser(page) {
  const user = `planttest_${Date.now()}`;
  // Register
  await page.goto('/signup');
  await page.fill('#username', user);
  await page.fill('#email', `${user}@test.com`);
  await page.fill('#password', 'password123');
  await page.fill('#confirmPassword', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

  // Login
  await page.fill('#username', user);
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  return user;
}

test.describe('Plant CRUD Operations', () => {
  test('should show empty state when no plants exist', async ({ page }) => {
    await loginFreshUser(page);
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('text=No plants yet')).toBeVisible();
  });

  test('should navigate to add plant form', async ({ page }) => {
    await loginFreshUser(page);
    await page.click('text=Add Plant');
    await expect(page).toHaveURL(/\/add-plant/);
    await expect(page.locator('h1')).toContainText('Add New Plant');
  });

  test('should validate required fields on add plant form', async ({ page }) => {
    await loginFreshUser(page);
    await page.goto('/add-plant');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toHaveCount({ minimum: 1 });
  });

  test('should reject invalid watering frequency (out of range)', async ({ page }) => {
    await loginFreshUser(page);
    await page.goto('/add-plant');
    await page.fill('#name', 'Test Plant');
    await page.fill('#species', 'Test Species');
    await page.fill('#location', 'Test Location');
    await page.fill('#wateringFrequencyDays', '0');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toContainText('between 1 and 90');
  });

  test('should create a new plant successfully', async ({ page }) => {
    await loginFreshUser(page);
    await page.goto('/add-plant');

    await page.fill('#name', 'My Sunflower');
    await page.fill('#species', 'Helianthus annuus');
    await page.fill('#location', 'Garden Window');
    await page.fill('#wateringFrequencyDays', '3');
    await page.selectOption('#healthStatus', 'HEALTHY');
    await page.click('button[type="submit"]');

    // Should show success message then redirect to dashboard
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Plant should appear on dashboard
    await expect(page.locator('text=My Sunflower')).toBeVisible();
  });

  test('should view plant details after creation', async ({ page }) => {
    await loginFreshUser(page);

    // Create a plant first
    await page.goto('/add-plant');
    await page.fill('#name', 'Detail Test Fern');
    await page.fill('#species', 'Polypodiopsida');
    await page.fill('#location', 'Bathroom');
    await page.fill('#wateringFrequencyDays', '2');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Click on the plant card to view details
    await page.click('text=Detail Test Fern');
    await expect(page.locator('h1')).toContainText('Detail Test Fern');
    await expect(page.locator('text=Polypodiopsida')).toBeVisible();
    await expect(page.locator('text=Bathroom')).toBeVisible();
    await expect(page.locator('text=Every 2 days')).toBeVisible();
  });

  test('should edit a plant successfully', async ({ page }) => {
    await loginFreshUser(page);

    // Create a plant
    await page.goto('/add-plant');
    await page.fill('#name', 'Edit Test Cactus');
    await page.fill('#species', 'Cactaceae');
    await page.fill('#location', 'Desk');
    await page.fill('#wateringFrequencyDays', '14');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Go to plant detail
    await page.click('text=Edit Test Cactus');
    await expect(page.locator('h1')).toContainText('Edit Test Cactus');

    // Click edit button
    await page.click('text=Edit');
    await expect(page).toHaveURL(/\/edit/);

    // Update the plant name and location
    await page.fill('#name', 'Updated Cactus');
    await page.fill('#location', 'Window Sill');
    await page.fill('#wateringFrequencyDays', '21');
    await page.click('button[type="submit"]');

    // Should show success and redirect to detail page
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2000);

    // Verify the update on detail page
    await expect(page.locator('h1')).toContainText('Updated Cactus');
    await expect(page.locator('text=Window Sill')).toBeVisible();
  });

  test('should delete a plant successfully', async ({ page }) => {
    await loginFreshUser(page);

    // Create a plant
    await page.goto('/add-plant');
    await page.fill('#name', 'Delete Me Plant');
    await page.fill('#species', 'Deleteus maximus');
    await page.fill('#location', 'Trash');
    await page.fill('#wateringFrequencyDays', '1');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Go to detail page
    await page.click('text=Delete Me Plant');

    // Accept the confirmation dialog automatically
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    // Click delete
    await page.click('text=Delete');

    // Should redirect to dashboard and plant should be gone
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Delete Me Plant')).not.toBeVisible();
  });

  test('should cancel adding a plant and return to dashboard', async ({ page }) => {
    await loginFreshUser(page);
    await page.goto('/add-plant');
    await page.click('text=Cancel');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
