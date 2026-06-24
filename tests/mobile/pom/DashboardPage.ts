import type { Browser, ChainablePromiseElement } from "webdriverio";

export class DashboardPage {
  constructor(private readonly driver: Browser) {}

  private readonly appPackage = process.env.ANDROID_APP_PACKAGE || "com.anonymous.flashguadmobileapp";

  private readonly dashboardTabSelectors = [
    'android=new UiSelector().text("Dashboard")'
  ];

  private readonly appActivity = process.env.ANDROID_APP_ACTIVITY || ".MainActivity";
  private readonly dashboardLoadMarkers = [
    'android=new UiSelector().textContains("Welcome back")',
    'android=new UiSelector().text("Total Net Worth")',
    'android=new UiSelector().text("Quick Actions")',
    'android=new UiSelector().text("Recent Transactions")'
  ];

  private readonly recentTransactionsHeaderSelectors = [
    'android=new UiSelector().text("Recent Transactions")',
    'android=new UiSelector().text("View All")'
  ];

  private readonly transactionAmountSelectors = [
    'android=new UiSelector().textMatches(".*R\\s?[0-9].*")',
    'android=new UiSelector().textMatches(".*-\\s?R\\s?[0-9].*")',
    'android=new UiSelector().textMatches(".*\\+\\s?R\\s?[0-9].*")'
  ];

  private async getFirstDisplayed(selectors: string[], timeoutMs = 7000): Promise<ChainablePromiseElement | null> {
    const endTime = Date.now() + timeoutMs;

    while (Date.now() < endTime) {
      for (const selector of selectors) {
        const element = await this.driver.$(selector);
        if (await element.isExisting().catch(() => false) && await element.isDisplayed().catch(() => false)) {
          return element;
        }
      }
      await this.driver.pause(200);
    }

    return null;
  }

  async isDashboardLoaded(timeoutMs = 12000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.dashboardLoadMarkers, timeoutMs);
    return Boolean(marker);
  }

  async relaunchApp(): Promise<void> {
    await this.driver.terminateApp(this.appPackage).catch(() => undefined);
        
    await this.driver.startActivity(this.appPackage, this.appActivity).catch(() => undefined);
    await this.driver.activateApp(this.appPackage).catch(() => undefined);
        
    for (let attempt = 0; attempt < 5; attempt++) {
      const currentPackage = await this.driver.getCurrentPackage().catch(() => "");
      if (currentPackage === this.appPackage) {
        return;
      }
            
      await this.driver.startActivity(this.appPackage, this.appActivity).catch(() => undefined);
      await this.driver.pause(700);
    }
  }

  async scrollToRecentTransactions(timeoutMs = 10000): Promise<boolean> {
    if (await this.isRecentTransactionsSectionVisible(1200)) {
      return true;
    }

    const windowRect = await this.driver.getWindowRect().catch(() => null);
    if (!windowRect) {
      return false;
    }

    const endTime = Date.now() + timeoutMs;
    while (Date.now() < endTime) {
      await this.driver.execute("mobile: swipeGesture", {
        left: Math.floor(windowRect.width * 0.1),
        top: Math.floor(windowRect.height * 0.2),
        width: Math.floor(windowRect.width * 0.8),
        height: Math.floor(windowRect.height * 0.7),
        direction: "up",
        percent: 0.7
      }).catch(() => undefined);

      if (await this.isRecentTransactionsSectionVisible(1200)) {
        return true;
      }
    }

    return false;
  }

  async openDashboardTabIfNeeded(timeoutMs = 8000): Promise<boolean> {
    if (await this.isDashboardLoaded(2500)) {
      return true;
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      const dashboardTab = await this.getFirstDisplayed(this.dashboardTabSelectors, 3000);
      if (!dashboardTab) {
        continue;
      }

      await dashboardTab.click();
      if (await this.isDashboardLoaded(timeoutMs)) {
        return true;
      }
    }

    return false;
  }

  async isRecentTransactionsSectionVisible(timeoutMs = 8000): Promise<boolean> {
    const header = await this.getFirstDisplayed([this.recentTransactionsHeaderSelectors[0]], timeoutMs);
    const viewAll = await this.getFirstDisplayed([this.recentTransactionsHeaderSelectors[1]], timeoutMs);
    return Boolean(header && viewAll);
  }

  async hasRecentTransactionItems(timeoutMs = 8000): Promise<boolean> {
    const firstAmount = await this.getFirstDisplayed(this.transactionAmountSelectors, timeoutMs);
    return Boolean(firstAmount);
  }
}
