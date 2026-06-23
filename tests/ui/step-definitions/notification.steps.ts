import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { signInWithDefaultUser } from './helpers';

Given('the user is signed in for notification checks', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
  await this.transferPage.goto(this.env.baseUrl);
});

When('the user triggers failed transfer handling', async function (this: CustomWorld) {
  await this.transferPage.submitTransfer('Charlie Frozen', '500');
});

When('the user performs an invalid transfer action', async function (this: CustomWorld) {
  await this.transferPage.submitTransfer('Bob Wallet', '0');
});

Then('failed transfer error message should be displayed', async function (this: CustomWorld) {
  await expect(this.transferPage.transferStatusMessage).toContainText(/sender\s*\/\s*recipient\s*not\s*valid/i);
});

Then('validation error message should be displayed', async function (this: CustomWorld) {
  await expect(this.transferPage.transferStatusMessage).toContainText(/invalid\s*transfer\s*payload/i);
});

Then('error toast or modal should be displayed', async function (this: CustomWorld) {
  await expect(this.transferPage.transferStatusMessage).toBeVisible();
  await expect(this.transferPage.transferStatusMessage).toContainText(
    /sender\s*\/\s*recipient\s*not\s*valid|invalid\s*transfer\s*payload|failed/i,
  );
});
