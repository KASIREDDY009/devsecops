/**
 * Playwright Configuration
 * -------------------------
 * Configures end-to-end testing for the PlantCare Monitoring System.
 * Tests run against the deployed application or a local development server.
 *
 * MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
 */

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  retries: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],
  use: {
    // Base URL defaults to the deployed EC2 app; override with env var
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
