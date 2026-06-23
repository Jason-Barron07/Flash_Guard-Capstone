import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';
import { signInWithDefaultUser } from './helpers';

Given('the user navigates to the authentication page', async function (this: CustomWorld) {
  await this.loginPage.goto(this.env.baseUrl);
});

When('the user signs in with valid authentication credentials', async function (this: CustomWorld) {
  await this.loginPage.login(this.env.username, this.env.password);
});

When('the user signs in with an invalid authentication password', async function (this: CustomWorld) {
  await this.loginPage.login(this.env.username, this.env.invalidPassword);
});

When('the user signs in with a locked authentication account', async function (this: CustomWorld) {
  await this.loginPage.login(this.env.lockedUsername, this.env.password);
});

Then('the authentication dashboard should be displayed', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/dashboard$/);
});

Then('an authentication error message should be displayed', async function (this: CustomWorld) {
  await expect(this.loginPage.errorMessage).toBeVisible();
});

Given('the user is signed in to the authenticated session', async function (this: CustomWorld) {
  await signInWithDefaultUser(this);
});

When('the authenticated session times out', async function (this: CustomWorld) {
  await this.page.waitForTimeout(3000);
  await this.page.reload();
});

Then('the session timeout banner should be displayed', async function (this: CustomWorld) {
  await expect(this.loginPage.sessionExpiredBanner).toBeVisible();
});

When('the user logs out from the authenticated session', async function (this: CustomWorld) {
  await this.loginPage.logout();
});

Then('the user should be redirected to the login route', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login$/);
});

When('the user signs in again with valid authentication credentials', async function (this: CustomWorld) {
  await this.loginPage.login(this.env.username, this.env.password);
});
