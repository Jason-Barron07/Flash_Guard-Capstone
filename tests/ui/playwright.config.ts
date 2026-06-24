import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './spec',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
  reporter: [['html', { outputFolder: './artifacts/playwright-report' }]],
  outputDir: './artifacts/test-results',
});
