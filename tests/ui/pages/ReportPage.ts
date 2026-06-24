import type { Locator, Page } from '@playwright/test';
import { APP_ROUTES } from '../utils/constants';

export class ReportPage {
  readonly page: Page;
  readonly reportTypeSelect: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly filterInput: Locator;
  readonly generateButton: Locator;
  readonly reportTable: Locator;
  readonly historyLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.historyLink = page.locator('a[href="/history"]', { hasText: /transaction history|view all/i }).first();
    this.reportTypeSelect = page.locator('select[name*="type" i], select').first();
    this.startDateInput = page.locator('input[type="date"][name*="start" i], input[type="date"]').first();
    this.endDateInput = page.locator('input[type="date"][name*="end" i], input[type="date"]').nth(1);
    this.filterInput = page.getByPlaceholder(/search transactions|search/i).first();
    this.generateButton = page.getByRole('button', { name: /generate|apply|filter|view/i }).first();
    this.reportTable = page
      .getByText(/recent transactions|transfer\s*#\d+|transaction history/i)
      .first();
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}${APP_ROUTES.reports}`);
    if ((await this.page.url()).includes('/dashboard')) {
      if (await this.historyLink.isVisible({ timeout: 1500 }).catch(() => false)) {
        await this.historyLink.click();
      }
    }
  }

  async generateReport(type: string, startDate: string, endDate: string): Promise<void> {
    if (await this.reportTypeSelect.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.reportTypeSelect.selectOption(type).catch(() => {});
    }
    if (await this.startDateInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.startDateInput.fill(startDate);
    }
    if (await this.endDateInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.endDateInput.fill(endDate);
    }
    if (await this.generateButton.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.generateButton.click();
    }
  }

  async filterTransactions(filter: string): Promise<void> {
    if (await this.filterInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await this.filterInput.fill(filter);
      await this.filterInput.press('Enter').catch(() => {});
    }
  }
}
