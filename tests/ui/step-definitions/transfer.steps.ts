import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { signInWithDefaultUser } from './helpers';

Given('the user is signed in for transfer checks', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
  await this.transferPage.goto(this.env.baseUrl);
});

When(
  'the user submits a transfer with recipient {string} and amount {string}',
  async function (this: CustomWorld, recipient: string, amount: string) {
    const recipientAliases: Record<string, string> = {
      'Alice Ledgercheck_circle': 'Bob Wallet',
    };

    const selectedRecipient =
      recipient === 'self'
        ? this.env.username
        : recipientAliases[recipient] ?? recipient;

    await this.transferPage.submitTransfer(selectedRecipient, amount);
  },
);

When('the user confirms transfer otp with {string}', async function (this: CustomWorld, otp: string) {
  await this.transferPage.confirmOtp(otp);
});

When('the user attempts to select self as beneficiary', async function (this: CustomWorld) {
  await this.transferPage.searchBeneficiary(this.env.username);
});

Then('self beneficiary should not be selectable', async function (this: CustomWorld) {
  await expect(this.transferPage.beneficiaryName(this.env.username)).toHaveCount(0);
});

Then('the transfer status message should include {string}', async function (this: CustomWorld, partial: string) {
  await expect(this.transferPage.transferStatusMessage).toContainText(new RegExp(partial, 'i'));
});
