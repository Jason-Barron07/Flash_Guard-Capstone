import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { NotificationPage } from '../pages/NotificationPage';
import { testData } from '../fixtures/testData';
import { getEnvironmentConfig } from '../config/environments';

const env = getEnvironmentConfig();

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
});

test('T-UI-NOTIF-001 Transfer Success Notification', async ({ page }) => {
  // Arrange
  const notificationPage = new NotificationPage(page);

  // Act
  await notificationPage.goto(env.baseUrl);

  // Assert
  await expect(notificationPage.successToast).toBeVisible();
});

test('T-UI-NOTIF-002 Alert Notification', async ({ page }) => {
  // Arrange
  const notificationPage = new NotificationPage(page);

  // Act
  await notificationPage.goto(env.baseUrl);

  // Assert
  await expect(notificationPage.alertBanner).toBeVisible();
});

test('T-UI-NOTIF-003 Error Toast Message', async ({ page }) => {
  // Arrange
  const notificationPage = new NotificationPage(page);

  // Act
  await notificationPage.goto(env.baseUrl);

  // Assert
  await expect(notificationPage.errorToast).toBeVisible();
});