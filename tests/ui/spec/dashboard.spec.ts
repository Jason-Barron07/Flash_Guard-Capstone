import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testData } from '../fixtures/testData';
import { getEnvironmentConfig } from '../config/environments';

const env = getEnvironmentConfig();

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
});

test('T-UI-DASH-001 Dashboard Load', async ({ page }) => {
  // Arrange
  const dashboardPage = new DashboardPage(page);

  // Act
  await dashboardPage.goto(env.baseUrl);

  // Assert
  await expect(dashboardPage.dashboardHeader).toBeVisible();
});

test('T-UI-DASH-002 Balance Display', async ({ page }) => {
  // Arrange
  const dashboardPage = new DashboardPage(page);

  // Act
  await dashboardPage.goto(env.baseUrl);

  // Assert
  await expect(dashboardPage.balanceCard).toBeVisible();
});

test('T-UI-DASH-003 Recent Transactions', async ({ page }) => {
  // Arrange
  const dashboardPage = new DashboardPage(page);

  // Act
  await dashboardPage.goto(env.baseUrl);

  // Assert
  await expect(dashboardPage.recentTransactionsTable).toBeVisible();
});

test('T-UI-DASH-004 Profile Information', async ({ page }) => {
  // Arrange
  const dashboardPage = new DashboardPage(page);

  // Act
  await dashboardPage.goto(env.baseUrl);

  // Assert
  await expect(dashboardPage.profileName).toBeVisible();
});