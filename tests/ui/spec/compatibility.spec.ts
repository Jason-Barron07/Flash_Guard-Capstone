import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { testData } from '../fixtures/testData';
import { getEnvironmentConfig } from '../config/environments';
import { VIEWPORTS } from '../utils/constants';

const env = getEnvironmentConfig();

test('T-UI-COMP-001 Chrome Compatibility', async ({ page, browserName }) => {
  // Arrange
  test.skip(browserName !== 'chromium', 'Chrome compatibility test only');
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
  await dashboardPage.goto(env.baseUrl);

  // Assert
  await expect(dashboardPage.dashboardHeader).toBeVisible();
});

test('T-UI-COMP-002 Firefox Compatibility', async ({ page, browserName }) => {
  // Arrange
  test.skip(browserName !== 'firefox', 'Firefox compatibility test only');
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
  await dashboardPage.goto(env.baseUrl);

  // Assert
  await expect(dashboardPage.dashboardHeader).toBeVisible();
});

test('T-UI-RESP-001 Mobile View', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await page.setViewportSize(VIEWPORTS.mobile);
  await loginPage.goto(env.baseUrl);

  // Assert
  await expect(loginPage.usernameInput).toBeVisible();
});

test('T-UI-RESP-002 Tablet View', async ({ page }) => {
  // Arrange
  const dashboardPage = new DashboardPage(page);

  // Act
  await page.setViewportSize(VIEWPORTS.tablet);
  await dashboardPage.goto(env.baseUrl);

  // Assert
  await expect(dashboardPage.dashboardHeader).toBeVisible();
});