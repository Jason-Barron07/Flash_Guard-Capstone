import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ReportPage } from '../pages/ReportPage';
import { testData } from '../fixtures/testData';
import { getEnvironmentConfig } from '../config/environments';

const env = getEnvironmentConfig();

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
});

test('T-UI-RPT-001 View Transaction History For Date Range', async ({ page }) => {
  // Arrange
  const reportPage = new ReportPage(page);

  // Act
  await reportPage.goto(env.baseUrl);
  await reportPage.generateReport('transactions', '2026-01-01', '2026-12-31');

  // Assert
  await expect(reportPage.reportTable).toBeVisible();
});

test('T-UI-RPT-002 Filter Transaction History', async ({ page }) => {
  // Arrange
  const reportPage = new ReportPage(page);

  // Act
  await reportPage.goto(env.baseUrl);
  await reportPage.filterTransactions('debit');

  // Assert
  await expect(reportPage.reportTable).toBeVisible();
});