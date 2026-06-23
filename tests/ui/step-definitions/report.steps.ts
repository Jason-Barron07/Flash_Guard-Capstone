import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { signInWithDefaultUser } from './helpers';

Given('the user is signed in for report checks', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
});

Given('the user is signed in for history checks', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
});

When(
  'the user generates a report from {string} to {string} with type {string}',
  async function (this: CustomWorld, startDate: string, endDate: string, type: string) {
    await this.reportPage.goto(this.env.baseUrl);
    await this.reportPage.generateReport(type, startDate, endDate);
  },
);

When('the user filters report transactions with {string}', async function (this: CustomWorld, filter: string) {
  await this.reportPage.goto(this.env.baseUrl);
  await this.reportPage.filterTransactions(filter);
});

Then('the report results should be visible', async function (this: CustomWorld) {
  await expect(this.reportPage.reportTable).toBeVisible();
});

Then('the transaction history results should be visible', async function (this: CustomWorld) {
  await expect(this.reportPage.reportTable).toBeVisible();
});
