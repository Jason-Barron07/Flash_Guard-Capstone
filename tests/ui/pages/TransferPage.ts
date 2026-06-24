import type { Locator, Page } from '@playwright/test';

export class TransferPage {
  readonly page: Page;
  readonly transferFundsLink: Locator;
  readonly beneficiarySection: Locator;
  readonly beneficiarySearchInput: Locator;
  readonly beneficiaryNameItems: Locator;
  readonly amountInput: Locator;
  readonly transferButton: Locator;
  readonly backToDashboardLink: Locator;
  readonly otpInput: Locator;
  readonly confirmOtpButton: Locator;
  readonly transferStatusMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.transferFundsLink = page.locator('a[href="/transfers"]', { hasText: /transfer funds/i }).first();
    this.beneficiarySection = page.locator('section', {
      has: page.getByRole('heading', { name: /to beneficiary/i }),
    });
    this.beneficiarySearchInput = this.beneficiarySection.getByPlaceholder(/search saved beneficiaries/i);
    this.beneficiaryNameItems = this.beneficiarySection.locator('span.font-label-md.text-label-md.text-primary');
    this.amountInput = page.getByPlaceholder('0.00');
    this.transferButton = page.getByRole('button', { name: /confirm\s*&\s*transfer/i });
    this.backToDashboardLink = page.getByRole('link', { name: 'dashboard Dashboard' });
    this.otpInput = page.locator('input[autocomplete="one-time-code"], input[name*="otp" i]').first();
    this.confirmOtpButton = page.getByRole('button', { name: /confirm|verify|otp/i }).first();
    this.transferStatusMessage = page
      .getByText(
        /transfer\s*#\d+\s*created\s*successfully|success|failed|minimum|maximum|blocked|self|confirmed|invalid\s*transfer\s*payload|insufficient\s*funds|sender\s*\/\s*recipient\s*not\s*valid/i,
      )
      .first();
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl.replace(/\/$/, '')}/transfers`);
    if (!(await this.page.url().match(/\/transfers$/))) {
      await this.transferFundsLink.click();
    }
  }

  async submitTransfer(recipient: string, amount: string): Promise<void> {
    const normalizedRecipient = recipient.replace(/check_circle/gi, '').trim();

    if (await this.beneficiarySearchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.beneficiarySearchInput.fill(normalizedRecipient);
    }

    const escapedRecipient = normalizedRecipient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const candidateName = this.beneficiarySection
      .getByText(new RegExp(`^\\s*${escapedRecipient}\\s*$`, 'i'))
      .first();
    if (await candidateName.isVisible({ timeout: 2000 }).catch(() => false)) {
      await candidateName.click();

      const candidateRow = candidateName.locator(
        'xpath=ancestor::div[contains(@class,"justify-between") and contains(@class,"cursor-pointer")][1]',
      );
      const selectButton = candidateRow.getByRole('button', { name: /^Select$/i });
      if (await selectButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await selectButton.click();
      }
    }

    await this.amountInput.click({ clickCount: 3 });
    await this.amountInput.fill(amount);
    await this.amountInput.press('Tab');

    if (await this.transferButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await this.transferButton.click();
    }
  }

  async searchBeneficiary(query: string): Promise<void> {
    await this.beneficiarySearchInput.fill(query);
  }

  beneficiaryName(name: string): Locator {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.beneficiarySection.getByText(new RegExp(`^\\s*${escaped}\\s*$`, 'i')).first();
  }

  async returnToDashboard(): Promise<void> {
    await this.backToDashboardLink.click();
  }

  statusMessage(message: string): Locator {
    return this.page.getByText(message);
  }

  async confirmOtp(otp: string): Promise<void> {
    if (await this.otpInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.otpInput.fill(otp);
      await this.confirmOtpButton.click();
    }
  }
}
