import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly signInLink: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly logoutLink: Locator;
  readonly sessionExpiredBanner: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInLink = page.getByRole('link', { name: 'Sign In' });
    this.usernameInput = page.getByLabel(/email|username/i);
    this.passwordInput = page.getByLabel(/password/i);
    this.loginButton = page.locator('button[type="submit"]', { hasText: /^Sign In$/ });
    this.logoutLink = page.locator('a[href="/login"]', { hasText: /sign out/i });
    this.sessionExpiredBanner = page.getByText(/session.*(expired|timeout)|please sign in again/i);
    this.errorMessage = page.getByText(/invalid|locked|failed|error/i).first();
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    if (await this.signInLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await this.signInLink.click();
    }

    // Clear and fill username field
    if (await this.usernameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.usernameInput.click({ clickCount: 3 });
      await this.usernameInput.fill(username);
    }

    // Clear and fill password field
    if (await this.passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.passwordInput.click({ clickCount: 3 });
      await this.passwordInput.fill(password);
    }

    // Click the login button and wait for navigation
    await this.loginButton.click();
    await this.page.waitForTimeout(3000);
  }

  async logout(): Promise<void> {
    if (await this.logoutLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await this.logoutLink.click();
      await this.page.waitForURL(/\/login$/, { timeout: 10000 });
    }
  }
}
