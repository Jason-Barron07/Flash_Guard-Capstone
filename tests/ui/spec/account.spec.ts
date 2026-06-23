import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';
import { testData } from '../fixtures/testData';
import { getEnvironmentConfig } from '../config/environments';

const env = getEnvironmentConfig();

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
});

test('T-UI-ACC-001 Update Profile', async ({ page }) => {
  // Arrange
  const accountPage = new AccountPage(page);

  // Act
  await accountPage.goto(env.baseUrl);
  await accountPage.updateProfile('Automation User');

  // Assert
  await expect(accountPage.successMessage).toContainText('profile updated');
});

test('T-UI-ACC-002 Change Password', async ({ page }) => {
  // Arrange
  const accountPage = new AccountPage(page);

  // Act
  await accountPage.goto(env.baseUrl);
  await accountPage.changePassword(testData.users.valid.password, 'NewP@ssword123!');

  // Assert
  await expect(accountPage.successMessage).toContainText('password changed');
});

test('T-UI-ACC-003 Add/Remove Payment Method', async ({ page }) => {
  // Arrange
  const accountPage = new AccountPage(page);

  // Act
  await accountPage.goto(env.baseUrl);
  await accountPage.addAndRemovePaymentMethod(testData.paymentMethod);

  // Assert
  await expect(accountPage.successMessage).toContainText('payment method updated');
});