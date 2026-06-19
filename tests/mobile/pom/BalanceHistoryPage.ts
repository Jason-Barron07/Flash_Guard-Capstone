import type { Browser, ChainablePromiseElement } from "webdriverio";

export class BalanceHistoryPage {
  constructor(private readonly driver: Browser) {}

  private readonly dashboardTabSelectors = [
    'android=new UiSelector().text("Dashboard")'
  ];

  private readonly historyTabSelectors = [
    'android=new UiSelector().text("History")'
  ];

  private readonly dashboardMarkers = [
    'android=new UiSelector().textContains("Welcome back")',
    'android=new UiSelector().text("Quick Actions")',
    'android=new UiSelector().text("Recent Transactions")'
  ];

  private readonly balanceValueSelectors = [
    'xpath=//android.widget.TextView[@text="Total Net Worth"]/following::android.widget.TextView[1]'
  ];

  private readonly historyMarkers = [
    'android=new UiSelector().text("History")',
    'android=new UiSelector().textContains("Total Spending")',
    'android=new UiSelector().text("All")'
  ];

  private readonly historyRowSelectors = [
    'android=new UiSelector().textContains("Transfer #")',
    'android=new UiSelector().text("Pending")',
    'android=new UiSelector().text("Completed")',
    'android=new UiSelector().textMatches(".*R\s?[0-9].*")'
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

  async isDashboardVisible(timeoutMs = 10000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.dashboardMarkers, timeoutMs);
    return Boolean(marker);
  }

  async openDashboardIfNeeded(timeoutMs = 10000): Promise<boolean> {
    if (await this.isDashboardVisible(2500)) {
      return true;
    }

    const dashboardTab = await this.getFirstDisplayed(this.dashboardTabSelectors, 4000);
    if (!dashboardTab) {
      return false;
    }

    await dashboardTab.click();
    return this.isDashboardVisible(timeoutMs);
  }

  async readCurrentBalance(timeoutMs = 8000): Promise<string> {
    const balanceValue = await this.getFirstDisplayed(this.balanceValueSelectors, timeoutMs);
    if (!balanceValue) {
      throw new Error("Current balance value not visible on dashboard");
    }

    return (await balanceValue.getText().catch(() => "")).trim();
  }

  async isHistoryVisible(timeoutMs = 10000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.historyMarkers, timeoutMs);
    return Boolean(marker);
  }

  async openHistoryIfNeeded(timeoutMs = 10000): Promise<boolean> {
    if (await this.isHistoryVisible(2500)) {
      return true;
    }

    const historyTab = await this.getFirstDisplayed(this.historyTabSelectors, 4000);
    if (!historyTab) {
      return false;
    }

    await historyTab.click();
    return this.isHistoryVisible(timeoutMs);
  }

  async hasTransactionHistoryItems(timeoutMs = 10000): Promise<boolean> {
    const item = await this.getFirstDisplayed(this.historyRowSelectors, timeoutMs);
    return Boolean(item);
  }
}