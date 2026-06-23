import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { signInWithDefaultUser } from './helpers';
import { VIEWPORTS } from '../utils/constants';

Given('the user is signed in for compatibility checks', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
});

When('the user opens the dashboard page for compatibility', async function (this: CustomWorld) {
  await this.dashboardPage.goto(this.env.baseUrl);
});

When('the user switches to a mobile viewport', async function (this: CustomWorld) {
  await this.page.setViewportSize(VIEWPORTS.mobile);
  await this.dashboardPage.goto(this.env.baseUrl);
});

When('the user switches to a tablet viewport', async function (this: CustomWorld) {
  await this.page.setViewportSize(VIEWPORTS.tablet);
  await this.dashboardPage.goto(this.env.baseUrl);
});

Then('the compatibility dashboard header should be visible', async function (this: CustomWorld) {
  await expect(this.dashboardPage.dashboardHeader).toBeVisible();
});
