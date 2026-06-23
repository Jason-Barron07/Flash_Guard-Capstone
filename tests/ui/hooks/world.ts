import { IWorldOptions, World, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { getEnvironmentConfig } from '../config/environments';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TransferPage } from '../pages/TransferPage';
import { NotificationPage } from '../pages/NotificationPage';
import { ReportPage } from '../pages/ReportPage';
import { AccountPage } from '../pages/AccountPage';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  loginPage!: LoginPage;
  dashboardPage!: DashboardPage;
  transferPage!: TransferPage;
  notificationPage!: NotificationPage;
  reportPage!: ReportPage;
  accountPage!: AccountPage;

  readonly env = getEnvironmentConfig();

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    this.loginPage = new LoginPage(this.page);
    this.dashboardPage = new DashboardPage(this.page);
    this.transferPage = new TransferPage(this.page);
    this.notificationPage = new NotificationPage(this.page);
    this.reportPage = new ReportPage(this.page);
    this.accountPage = new AccountPage(this.page);
  }

  async closeBrowser(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
