import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { signInWithDefaultUser } from './helpers';
import { testData } from '../fixtures/testData';

Given('the user is signed in for account checks', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
  await this.accountPage.goto(this.env.baseUrl);
});

When('the user updates the profile display name to {string}', async function (this: CustomWorld, displayName: string) {
  await this.accountPage.updateProfile(displayName);
});

When('the user changes the account password', async function (this: CustomWorld) {
  await this.accountPage.changePassword(this.env.password, `${this.env.password}1`);
});

When('the user adds and removes an account payment method', async function (this: CustomWorld) {
  await this.accountPage.addAndRemovePaymentMethod(testData.paymentMethod);
});

Then('the account success message should be visible', async function (this: CustomWorld) {
  await expect(this.accountPage.successMessage).toBeVisible();
});
