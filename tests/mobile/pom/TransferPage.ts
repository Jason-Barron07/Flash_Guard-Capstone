import type { Browser, ChainablePromiseElement } from "webdriverio";

export class TransferPage {
  constructor(private readonly driver: Browser) {}

  private readonly transferTabSelectors = [
    'android=new UiSelector().text("Transact")'
  ];

  private readonly transferScreenMarkers = [
    'android=new UiSelector().text("From Account")',
    'android=new UiSelector().text("To Beneficiary")',
    'android=new UiSelector().text("Transfer Details")',
    'android=new UiSelector().text("Review Transaction")'
  ];

  private readonly historyScreenMarkers = [
    'android=new UiSelector().text("History")',
    'android=new UiSelector().textContains("Total Spending")',
    'android=new UiSelector().text("One-time code")'
  ];

  private readonly amountInputSelectors = [
    'xpath=//android.widget.TextView[@text="Amount (ZAR)"]/following::android.widget.EditText[1]'
  ];

  private readonly totalAmountValueSelectors = [
    'xpath=//android.widget.TextView[@text="Total Amount"]/following::android.widget.TextView[1]'
  ];

  private readonly reviewTransactionButtonSelectors = [
    'android=new UiSelector().text("Review Transaction")',
    'android=new UiSelector().text("Submitting...")'
  ];

  private readonly otpCodeSelectors = [
    'android=new UiSelector().textMatches("[0-9]{6}")'
  ];

  private readonly otpInputSelectors = [
    'xpath=//android.widget.TextView[@text="One-time code"]/following::android.widget.EditText[1]'
  ];

  private readonly approveButtonSelectors = [
    'android=new UiSelector().text("Approve")'
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

  private recipientSelectors(name: string): string[] {
    return [`android=new UiSelector().text("${name}")`];
  }

  async isTransferScreenDisplayed(timeoutMs = 8000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.transferScreenMarkers, timeoutMs);
    return Boolean(marker);
  }

  async isHistoryScreenDisplayed(timeoutMs = 8000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.historyScreenMarkers, timeoutMs);
    return Boolean(marker);
  }

  async openTransferTabIfNeeded(timeoutMs = 10000): Promise<boolean> {
    if (await this.isTransferScreenDisplayed(2500)) {
      return true;
    }

    const transferTab = await this.getFirstDisplayed(this.transferTabSelectors, 4000);
    if (!transferTab) {
      return false;
    }

    await transferTab.click();
    return this.isTransferScreenDisplayed(timeoutMs);
  }

  async selectRecipient(name: string, timeoutMs = 8000): Promise<boolean> {
    const recipient = await this.getFirstDisplayed(this.recipientSelectors(name), timeoutMs);
    if (!recipient) {
      return false;
    }

    await recipient.click();
    return true;
  }

  async enterTransferAmount(amount: string): Promise<void> {
    const amountInput = await this.getFirstDisplayed(this.amountInputSelectors, 8000);
    if (!amountInput) {
      throw new Error("Transfer amount input not visible");
    }

    await amountInput.clearValue();
    await amountInput.setValue(amount);
  }

  async readTransferAmountValue(timeoutMs = 5000): Promise<string> {
    const amountInput = await this.getFirstDisplayed(this.amountInputSelectors, timeoutMs);
    if (!amountInput) {
      throw new Error("Transfer amount input not visible");
    }

    return (await amountInput.getText().catch(() => "")).trim();
  }

  async readTotalAmount(timeoutMs = 5000): Promise<string> {
    const totalAmount = await this.getFirstDisplayed(this.totalAmountValueSelectors, timeoutMs);
    if (!totalAmount) {
      throw new Error("Total amount value not visible");
    }

    return (await totalAmount.getText().catch(() => "")).trim();
  }

  async submitTransfer(): Promise<void> {
    const reviewButton = await this.getFirstDisplayed(this.reviewTransactionButtonSelectors, 8000);
    if (!reviewButton) {
      throw new Error("Review Transaction button not visible");
    }

    await reviewButton.click();
  }

  async readPendingOtpCode(timeoutMs = 10000): Promise<string> {
    const otpCode = await this.getFirstDisplayed(this.otpCodeSelectors, timeoutMs);
    if (!otpCode) {
      throw new Error("Pending OTP code not visible");
    }

    return (await otpCode.getText().catch(() => "")).trim();
  }

  async enterPendingOtp(code: string): Promise<void> {
    const otpInput = await this.getFirstDisplayed(this.otpInputSelectors, 10000);
    if (!otpInput) {
      throw new Error("Pending OTP input not visible");
    }

    await otpInput.clearValue();
    await otpInput.setValue(code);
  }

  async readPendingOtpValue(timeoutMs = 5000): Promise<string> {
    const otpInput = await this.getFirstDisplayed(this.otpInputSelectors, timeoutMs);
    if (!otpInput) {
      throw new Error("Pending OTP input not visible");
    }

    return (await otpInput.getText().catch(() => "")).trim();
  }

  async approvePendingTransfer(): Promise<void> {
    const approveButton = await this.getFirstDisplayed(this.approveButtonSelectors, 10000);
    if (!approveButton) {
      throw new Error("Approve button not visible for pending transfer");
    }

    await approveButton.click();
  }
}