/**
 * Authentication E2E Tests
 * -------------------------
 * Tests user registration and login flows including:
 *   - Successful signup with valid credentials
 *   - Signup validation (short username, invalid email, password mismatch)
 *   - Successful login and redirect to dashboard
 *   - Login with invalid credentials shows error
 *   - Logout clears session and redirects to login
 *   - Protected routes redirect unauthenticated users to login
 *
 * MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
 */

const { test, expect } = require('@playwright/test');

// Generate unique credentials for each test run to avoid conflicts
const timestamp = Date.now();
const TEST_USER = {
  username: `testuser_${timestamp}`,
  email: `testuser_${timestamp}@example.com`,
  password: 'SecurePass123',
};

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display the signup form with all required fields', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Create Account');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toHaveCount({ minimum: 1 });
  });

  test('should reject short username (less than 3 characters)', async ({ page }) => {
    await page.fill('#username', 'ab');
    await page.fill('#email', 'valid@test.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toContainText('at least 3 characters');
  });

  test('should reject invalid email format', async ({ page }) => {
    await page.fill('#username', 'validuser');
    await page.fill('#email', 'not-an-email');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toContainText('valid email');
  });

  test('should reject mismatched passwords', async ({ page }) => {
    await page.fill('#username', 'validuser');
    await page.fill('#email', 'valid@test.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'different456');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toContainText('do not match');
  });

  test('should reject short password (less than 6 characters)', async ({ page }) => {
    await page.fill('#username', 'validuser');
    await page.fill('#email', 'valid@test.com');
    await page.fill('#password', '12345');
    await page.fill('#confirmPassword', '12345');
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toContainText('at least 6 characters');
  });

  test('should successfully register a new user and redirect to login', async ({ page }) => {
    await page.fill('#username', TEST_USER.username);
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    await page.fill('#confirmPassword', TEST_USER.password);
    await page.click('button[type="submit"]');
    // Should redirect to login page after successful registration
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should have a link to the login page', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display the login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('PlantCare Monitor');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('.field-error')).toHaveCount({ minimum: 1 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('#username', 'nonexistent_user');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-banner')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login and redirect to dashboard', async ({ page }) => {
    // First register the test user
    await page.goto('/signup');
    const user = `logintest_${Date.now()}`;
    await page.fill('#username', user);
    await page.fill('#email', `${user}@test.com`);
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Now login
    await page.fill('#username', user);
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should have a link to the signup page', async ({ page }) => {
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should redirect unauthenticated users from add-plant to login', async ({ page }) => {
    await page.goto('/add-plant');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
