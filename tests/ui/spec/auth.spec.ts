import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { testData } from '../fixtures/testData';
import { getEnvironmentConfig } from '../config/environments';
import { APP_ROUTES } from '../utils/constants';

const env = getEnvironmentConfig();

test('T-UI-AUTH-001 Valid Login', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);

  // Assert
  await expect(page).toHaveURL(new RegExp(`${APP_ROUTES.dashboard}$`));
});

test('T-UI-AUTH-002 Invalid Password', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.invalidPassword.username, testData.users.invalidPassword.password);

  // Assert
  await expect(loginPage.errorMessage).toBeVisible();
});

test('T-UI-AUTH-003 Locked Account', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.locked.username, testData.users.locked.password);

  // Assert
  await expect(loginPage.errorMessage).toBeVisible();
});

test('T-UI-AUTH-004 Session Timeout', async ({ page, context }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
  await context.clearCookies();
  await page.goto(`${env.baseUrl}${APP_ROUTES.login}`);

  // Assert
  await expect(loginPage.sessionExpiredBanner).toBeVisible();
});

test('T-UI-AUTH-005 Logout', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
  await loginPage.logout();

  // Assert
  await expect(page).toHaveURL(new RegExp(`${APP_ROUTES.login}$`));
});

test('T-UI-AUTH-006 Re-login', async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);

  // Act
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
  await loginPage.logout();
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);

  // Assert
  await expect(page).toHaveURL(new RegExp(`${APP_ROUTES.dashboard}$`));
});