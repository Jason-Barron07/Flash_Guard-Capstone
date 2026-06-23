import type { Locator, Page } from '@playwright/test';
import { APP_ROUTES } from '../utils/constants';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeader: Locator;
  readonly balanceCard: Locator;
  readonly recentTransactionsTable: Locator;
  readonly profileName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeader = page.getByRole('heading', { name: /portfolio overview|dashboard/i });
    this.balanceCard = page.getByText(/total net worth|trending_up|R\s*\d+/i).first();
    this.recentTransactionsTable = page.getByRole('heading', { name: /recent transactions/i });
    this.profileName = page.getByRole('heading', { name: /alice ledger|bob wallet/i }).first();
  }

  async goto(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}${APP_ROUTES.dashboard}`);
  }
}
