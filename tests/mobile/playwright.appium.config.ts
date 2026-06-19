import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./specs",
  testMatch: "**/*.spec.ts",
  timeout: 120_000,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "./artifacts/playwright-report", open: "never" }]],
  outputDir: "./artifacts/test-results",
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }
});
