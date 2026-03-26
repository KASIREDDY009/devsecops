/**
 * Sensor Data E2E Tests
 * ----------------------
 * Tests sensor data recording and viewing:
 *   - Navigate to sensor data page from plant detail
 *   - Submit a new sensor reading with valid data
 *   - Validate sensor input ranges (soil moisture, temperature, etc.)
 *   - View sensor reading history in the table
 *   - Verify latest sensor reading appears on plant detail page
 *
 * MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
 */

const { test, expect } = require('@playwright/test');

// Helper: register, login, and create a plant; returns on plant detail page
async function setupPlantForSensor(page) {
  const user = `sensortest_${Date.now()}`;
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

  // Create a plant
  await page.goto('/add-plant');
  await page.fill('#name', 'Sensor Test Plant');
  await page.fill('#species', 'Testus plantus');
  await page.fill('#location', 'Lab');
  await page.fill('#wateringFrequencyDays', '5');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

  // Go to plant detail
  await page.click('text=Sensor Test Plant');
  await expect(page.locator('h1')).toContainText('Sensor Test Plant');
}

test.describe('Sensor Data Management', () => {
  test('should navigate to sensor data page from plant detail', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');
    await expect(page.locator('h1')).toContainText('Sensor Data Management');
  });

  test('should show empty state when no sensor data exists', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');
    await expect(page.locator('text=No sensor readings recorded yet')).toBeVisible();
  });

  test('should display the sensor data input form', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');
    await expect(page.locator('#soilMoisture')).toBeVisible();
    await expect(page.locator('#temperature')).toBeVisible();
    await expect(page.locator('#lightLevel')).toBeVisible();
    await expect(page.locator('#humidity')).toBeVisible();
  });

  test('should validate empty sensor data fields', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');
    await page.click('button:has-text("Add Reading")');
    await expect(page.locator('.field-error')).toHaveCount({ minimum: 1 });
  });

  test('should reject out-of-range soil moisture value', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');
    await page.fill('#soilMoisture', '150');
    await page.fill('#temperature', '22');
    await page.fill('#lightLevel', '5000');
    await page.fill('#humidity', '60');
    await page.click('button:has-text("Add Reading")');
    await expect(page.locator('.field-error')).toContainText('between 0 and 100');
  });

  test('should reject out-of-range temperature value', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');
    await page.fill('#soilMoisture', '50');
    await page.fill('#temperature', '70');
    await page.fill('#lightLevel', '5000');
    await page.fill('#humidity', '60');
    await page.click('button:has-text("Add Reading")');
    await expect(page.locator('.field-error')).toContainText('-40 and 60');
  });

  test('should successfully add a sensor reading', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');

    // Fill in valid sensor data
    await page.fill('#soilMoisture', '45.5');
    await page.fill('#temperature', '22.0');
    await page.fill('#lightLevel', '5000');
    await page.fill('#humidity', '60.0');
    await page.click('button:has-text("Add Reading")');

    // Should show success message
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.success-banner')).toContainText('successfully');

    // Reading should appear in the history table
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('td:has-text("45.5")')).toBeVisible();
    await expect(page.locator('td:has-text("22")')).toBeVisible();
  });

  test('should add multiple readings and display history', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');

    // Add first reading
    await page.fill('#soilMoisture', '30');
    await page.fill('#temperature', '20');
    await page.fill('#lightLevel', '3000');
    await page.fill('#humidity', '50');
    await page.click('button:has-text("Add Reading")');
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 10000 });

    // Add second reading
    await page.fill('#soilMoisture', '55');
    await page.fill('#temperature', '25');
    await page.fill('#lightLevel', '8000');
    await page.fill('#humidity', '70');
    await page.click('button:has-text("Add Reading")');
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 10000 });

    // Both readings should appear in the table
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(2);
  });

  test('should show latest sensor reading on plant detail page', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');

    // Add a sensor reading
    await page.fill('#soilMoisture', '42');
    await page.fill('#temperature', '23');
    await page.fill('#lightLevel', '6000');
    await page.fill('#humidity', '65');
    await page.click('button:has-text("Add Reading")');
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 10000 });

    // Navigate back to plant detail
    await page.click('text=Back to Plant Details');

    // Latest sensor readings should be displayed
    await expect(page.locator('text=42%')).toBeVisible();
    await expect(page.locator('text=23')).toBeVisible();
  });

  test('should navigate back to plant detail from sensor data page', async ({ page }) => {
    await setupPlantForSensor(page);
    await page.click('text=View All / Add Data');
    await page.click('text=Back to Plant Details');
    await expect(page.locator('h1')).toContainText('Sensor Test Plant');
  });
});
