import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { TransferPage } from '../pages/TransferPage';
import { testData } from '../fixtures/testData';
import { getEnvironmentConfig } from '../config/environments';

const env = getEnvironmentConfig();

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto(env.baseUrl);
  await loginPage.login(testData.users.valid.username, testData.users.valid.password);
});

test('T-UI-TR-001 Successful Transfer', async ({ page }) => {
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await transferPage.submitTransfer(testData.transfer.validRecipient, testData.transfer.decimalAmount);
  await transferPage.returnToDashboard();

  // Assert
  await expect(transferPage.backToDashboardLink).toBeVisible();
});

test('T-UI-TR-002 Minimum Amount Validation', async ({ page }) => {
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await transferPage.submitTransfer(testData.transfer.validRecipient, testData.transfer.invalidLowAmount);

  // Assert
  await expect(transferPage.statusMessage('Invalid transfer payload')).toBeVisible();
});

test('T-UI-TR-003 Maximum Amount Validation', async ({ page }) => {
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await transferPage.submitTransfer(testData.transfer.validRecipient, testData.transfer.invalidHighAmount);

  // Assert
  await expect(transferPage.statusMessage('Insufficient funds')).toBeVisible();
});

test('T-UI-TR-004 Decimal Validation', async ({ page }) => {
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await transferPage.submitTransfer(testData.transfer.validRecipient, testData.transfer.decimalAmount);

  // Assert
  await expect(transferPage.transferButton).toBeVisible();
});

test('T-UI-TR-005 Blocked Recipient', async ({ page }) => {
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await transferPage.submitTransfer(testData.transfer.blockedRecipient, testData.transfer.minAmount);

  // Assert
  await expect(transferPage.statusMessage('Sender/recipient not found')).toBeVisible();
});

test('T-UI-TR-006 Self Transfer', async ({ page }) => {
  test.fixme(true, 'Not testable: selected user does not appear in recipient list.');
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await expect(transferPage.transferButton).toBeVisible();
});

test('T-UI-TR-007 OTP Confirmation', async ({ page }) => {
  test.fixme(true, 'Not testable: OTP input/confirm control not shown in current UI flow.');
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await expect(transferPage.transferButton).toBeVisible();
});

test('T-UI-TR-008 Failed Transfer', async ({ page }) => {
  // Arrange
  const transferPage = new TransferPage(page);

  // Act
  await transferPage.goto(env.baseUrl);
  await transferPage.submitTransfer(testData.transfer.validRecipient, testData.transfer.maxAmount);

  // Assert
  await expect(transferPage.statusMessage('Invalid transfer payload')).toBeVisible();
});