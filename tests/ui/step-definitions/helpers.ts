import { expect } from '@playwright/test';
import { CustomWorld } from '../hooks/world';

export async function signInWithDefaultUser(world: CustomWorld): Promise<void> {
  await world.loginPage.goto(world.env.baseUrl);
  await world.loginPage.login(world.env.username, world.env.password);
  await expect(world.page).toHaveURL(/\/dashboard$/);
}
