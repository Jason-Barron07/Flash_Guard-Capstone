import type { Locator, Page } from '@playwright/test';
import { APP_ROUTES } from '../utils/constants';

export class NotificationPage {
  readonly page: Page;
  readonly successToast: Locator;
  readonly alertBanner: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.successToast = page.getByTestId('toast-success');
    this.alertBanner = page.getByTestId('alert-banner');
    this.errorToast = page.getByTestId('toast-error');
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}${APP_ROUTES.notifications}`);
  }
}
