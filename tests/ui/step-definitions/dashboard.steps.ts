import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { signInWithDefaultUser } from './helpers';

Given('the user is signed in for dashboard checks', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
});

When('the user opens the dashboard page', async function (this: CustomWorld) {
  await this.dashboardPage.goto(this.env.baseUrl);
});

Then('the dashboard header should be visible', async function (this: CustomWorld) {
  await expect(this.dashboardPage.dashboardHeader).toBeVisible();
});

Then('the dashboard balance card should be visible', async function (this: CustomWorld) {
  await expect(this.dashboardPage.balanceCard).toBeVisible();
});

Then('the dashboard recent transactions should be visible', async function (this: CustomWorld) {
  await expect(this.dashboardPage.recentTransactionsTable).toBeVisible();
});

Then('the dashboard profile information should be visible', async function (this: CustomWorld) {
  await expect(this.dashboardPage.profileName).toBeVisible();
});
