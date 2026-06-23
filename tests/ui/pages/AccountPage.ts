import type { Locator, Page } from '@playwright/test';
import { APP_ROUTES } from '../utils/constants';

export interface PaymentMethodData {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export class AccountPage {
  readonly page: Page;
  readonly displayNameInput: Locator;
  readonly saveProfileButton: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly changePasswordButton: Locator;
  readonly addPaymentMethodButton: Locator;
  readonly removePaymentMethodButton: Locator;
  readonly cardholderNameInput: Locator;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly savePaymentMethodButton: Locator;
  readonly successMessage: Locator;
  readonly paymentMethodsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.displayNameInput = page.locator('input[name*="display" i], input[placeholder*="display" i]').first();
    this.saveProfileButton = page.getByRole('button', { name: /save profile|save/i }).first();
    this.currentPasswordInput = page.locator('input[name*="current" i][type="password"]').first();
    this.newPasswordInput = page.locator('input[name*="new" i][type="password"]').first();
    this.confirmPasswordInput = page.locator('input[name*="confirm" i][type="password"]').first();
    this.changePasswordButton = page.getByRole('button', { name: /change password|update password/i }).first();
    this.paymentMethodsLink = page.locator('a[href="/payment-methods"], a:has-text("Payment Methods")').first();
    this.addPaymentMethodButton = page
      .getByRole('button', { name: /add\s+(payment\s+)?method|add\s+card|add/i })
      .first();
    this.removePaymentMethodButton = page
      .getByRole('button', { name: /remove\s+(payment\s+)?method|remove\s+card|delete/i })
      .first();
    this.cardholderNameInput = page
      .locator(
        'input[name*="cardholder" i], input[name*="holder" i], input[placeholder*="name on card" i], input[placeholder*="cardholder" i]',
      )
      .first();
    this.cardNumberInput = page
      .locator('input[name*="card" i][name*="number" i], input[placeholder*="card number" i]')
      .first();
    this.expiryInput = page
      .locator('input[name*="exp" i], input[name*="expiry" i], input[placeholder*="mm" i], input[placeholder*="yy" i]')
      .first();
    this.cvvInput = page
      .locator('input[name*="cvv" i], input[name*="cvc" i], input[placeholder*="cvv" i], input[placeholder*="cvc" i]')
      .first();
    this.savePaymentMethodButton = page
      .getByRole('button', { name: /save|add\s+card|confirm|submit/i })
      .first();
    this.successMessage = page
      .getByText(/account|profile|password|payment\s*method|updated|saved|success/i)
      .first();
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}${APP_ROUTES.account}`);
    if ((await this.page.url()).includes('/dashboard')) {
      if (await this.paymentMethodsLink.isVisible({ timeout: 1500 }).catch(() => false)) {
        await this.paymentMethodsLink.click();
      }
    }
  }

  async updateProfile(displayName: string): Promise<void> {
    await this.displayNameInput.fill(displayName);
    await this.saveProfileButton.click();
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.currentPasswordInput.fill(currentPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(newPassword);
    await this.changePasswordButton.click();
  }

  async addAndRemovePaymentMethod(data: PaymentMethodData): Promise<void> {
    if (await this.paymentMethodsLink.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.paymentMethodsLink.click();
    }

    if (!(await this.addPaymentMethodButton.isVisible({ timeout: 3000 }).catch(() => false))) {
      throw new Error('Add payment method control was not found on the current UI.');
    }

    await this.addPaymentMethodButton.click();

    const formVisible = await this.cardNumberInput.isVisible({ timeout: 2500 }).catch(() => false);
    if (!formVisible) {
      throw new Error('Payment method form did not appear after clicking add payment method.');
    }

    if (await this.cardholderNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.cardholderNameInput.fill(data.cardholderName);
    }
    await this.cardNumberInput.fill(data.cardNumber);
    if (await this.expiryInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.expiryInput.fill(data.expiry);
    }
    if (await this.cvvInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.cvvInput.fill(data.cvv);
    }

    if (await this.savePaymentMethodButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.savePaymentMethodButton.click();
    }

    if (await this.removePaymentMethodButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.removePaymentMethodButton.click();
    } else {
      throw new Error('Remove payment method control was not found after adding a payment method.');
    }
  }
}
