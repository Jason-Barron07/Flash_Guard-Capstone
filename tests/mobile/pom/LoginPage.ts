import type { Browser, ChainablePromiseElement } from "webdriverio";

export class LoginPage {
  constructor(private readonly driver: Browser) {}

  private readonly appPackage = process.env.ANDROID_APP_PACKAGE || "com.anonymous.flashguadmobileapp";

  private readonly emailSelectors = [
    "~email-input",
    "id=com.anonymous.flashguadmobileapp:id/email_input",
    "id=com.anonymous.flashguadmobileapp:id/email",
    'android=new UiSelector().className("android.widget.EditText").instance(0)'
  ];

  private readonly passwordSelectors = [
    "~password-input",
    "id=com.anonymous.flashguadmobileapp:id/password_input",
    "id=com.anonymous.flashguadmobileapp:id/password",
    'android=new UiSelector().className("android.widget.EditText").instance(1)'
  ];

  private readonly loginButtonSelectors = [
    "~login-button",
    "id=com.anonymous.flashguadmobileapp:id/login_button",
    'android=new UiSelector().text("Sign In")',
    'android=new UiSelector().text("Authenticating...")'
  ];

  private readonly loginScreenSelectors = [
    'android=new UiSelector().text("Welcome Back")',
    'android=new UiSelector().text("Email / ID Number")',
    'android=new UiSelector().text("Password")',
    'android=new UiSelector().text("Forgot Password?")',
    'android=new UiSelector().text("Secure Access")',
    'android=new UiSelector().text("Sign in with Camera Face Check")'
  ];

  private readonly signupScreenSelectors = [
    'android=new UiSelector().textContains("Personal Details")',
    'android=new UiSelector().text("Next Step")',
    'android=new UiSelector().textContains("Already have a PrimeFin account")'
  ];

  private readonly signupToLoginSelectors = [
    'android=new UiSelector().text("Sign In")',
    'android=new UiSelector().textContains("Sign In")'
  ];

  private readonly dashboardVerificationSelectors = [
    "~dashboard-screen",
    "id=com.anonymous.flashguadmobileapp:id/dashboard",
    'android=new UiSelector().textContains("Quick Actions")',
    'android=new UiSelector().textContains("Current Balance")',
    'android=new UiSelector().textContains("Dashboard")',
    'android=new UiSelector().textContains("Total Net Worth")'
  ];

  private readonly alertTitleSelectors = [
    "id=android:id/alertTitle",
    "id=com.anonymous.flashguadmobileapp:id/alertTitle",
    "id=com.anonymous.flashguadmobileapp:id/alert_title"
  ];

  private readonly alertMessageSelectors = [
    "id=android:id/message",
    "id=com.anonymous.flashguadmobileapp:id/message"
  ];

  private readonly alertConfirmButtonSelectors = [
    "id=android:id/button1",
    "id=com.anonymous.flashguadmobileapp:id/button1"
  ];

  private readonly loginFailureTextSelectors = [
    'android=new UiSelector().textContains("Login failed")',
    'android=new UiSelector().textContains("Invalid")',
    'android=new UiSelector().textContains("incorrect")',
    'android=new UiSelector().textContains("Unauthorized")',
    'android=new UiSelector().textContains("Request failed")'
  ];

  private isUiAutomatorTemporaryError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();
    return normalized.includes("instrumentation process is not running")
      || normalized.includes("cannot be proxied to uiautomator2 server")
      || normalized.includes("waiting for the root accessibilitynodeinfo")
      || normalized.includes("timed out after");
  }

  private async getFirstDisplayed(selectors: string[], timeoutMs = 7000): Promise<ChainablePromiseElement | null> {
    const endTime = Date.now() + timeoutMs;

    while (Date.now() < endTime) {
      for (const selector of selectors) {
        try {
          const element = await this.driver.$(selector);
          if (await element.isExisting().catch(() => false) && await element.isDisplayed().catch(() => false)) {
            return element;
          }
        } catch (error) {
          if (!this.isUiAutomatorTemporaryError(error)) {
            throw error;
          }
          await this.driver.pause(700);
        }
      }
      await this.driver.pause(350);
    }

    return null;
  }

  private async getElementTextIfVisible(selectors: string[]): Promise<string | null> {
    for (const selector of selectors) {
      try {
        const element = await this.driver.$(selector);
        const isVisible = await element.isExisting().catch(() => false) && await element.isDisplayed().catch(() => false);
        if (isVisible) {
          const text = await element.getText().catch(() => "");
          if (text?.trim()) {
            return text.trim();
          }
        }
      } catch (error) {
        if (!this.isUiAutomatorTemporaryError(error)) {
          throw error;
        }
        await this.driver.pause(700);
      }
    }
    return null;
  }

  private async readAlertTextNow(): Promise<string | null> {
    const titleText = await this.getElementTextIfVisible(this.alertTitleSelectors);
    const messageText = await this.getElementTextIfVisible(this.alertMessageSelectors);

    if (titleText || messageText) {
      return `${titleText || ""}${messageText ? `: ${messageText}` : ""}`.trim();
    }

    const failureText = await this.getElementTextIfVisible(this.loginFailureTextSelectors);
    return failureText;
  }

  async waitForAuthOrDashboard(timeoutMs = 15000): Promise<"dashboard" | "login" | null> {
    const endTime = Date.now() + timeoutMs;

    while (Date.now() < endTime) {
      const dashboardMarker = await this.getFirstDisplayed(this.dashboardVerificationSelectors, 700);
      if (dashboardMarker) {
        return "dashboard";
      }

      const loginMarker = await this.getFirstDisplayed(this.loginScreenSelectors, 700);
      if (loginMarker) {
        return "login";
      }

      const signupMarker = await this.getFirstDisplayed(this.signupScreenSelectors, 700);
      if (signupMarker) {
        const switched = await this.ensureOnLoginScreen(5000);
        if (switched) {
          return "login";
        }
      }

      await this.driver.pause(200);
    }

    return null;
  }

  async dismissAlertIfPresent(): Promise<string | null> {
    const alertText = await this.readAlertTextNow().catch((error) => {
      if (this.isUiAutomatorTemporaryError(error)) {
        return null;
      }
      throw error;
    });
    if (!alertText) {
      return null;
    }

    for (const selector of this.alertConfirmButtonSelectors) {
      const confirm = await this.driver.$(selector);
      const isVisible = await confirm.isExisting().catch(() => false) && await confirm.isDisplayed().catch(() => false);
      if (isVisible) {
        await confirm.click().catch(() => undefined);
        break;
      }
    }

    return alertText;
  }

  async waitForAlertText(timeoutMs = 5000): Promise<string | null> {
    const endTime = Date.now() + timeoutMs;
    while (Date.now() < endTime) {
      const alertText = await this.readAlertTextNow();
      if (alertText) {
        return alertText;
      }
      await this.driver.pause(200);
    }
    return null;
  }

  async relaunchApp(): Promise<void> {
    await this.driver.terminateApp(this.appPackage).catch(() => undefined);
    await this.driver.activateApp(this.appPackage);
  }

  async clearAppDataAndRelaunch(): Promise<void> {
    await this.driver.execute("mobile: clearApp", { appId: this.appPackage }).catch(() => undefined);
    await this.relaunchApp();
  }

  async isLoginScreenDisplayed(timeoutMs = 8000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.loginScreenSelectors, timeoutMs);
    if (!marker) {
      return false;
    }

    const emailField = await this.getFirstDisplayed(this.emailSelectors, 3000);
    return Boolean(emailField);
  }

  async isSignupScreenDisplayed(timeoutMs = 5000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.signupScreenSelectors, timeoutMs);
    return Boolean(marker);
  }

  async ensureOnLoginScreen(timeoutMs = 10000): Promise<boolean> {
    if (await this.isLoginScreenDisplayed(timeoutMs)) {
      return true;
    }

    const onSignupScreen = await this.isSignupScreenDisplayed(3000);
    if (!onSignupScreen) {
      return false;
    }

    let signInSwitch = await this.getFirstDisplayed(this.signupToLoginSelectors, 1200);
    if (!signInSwitch) {
      const windowRect = await this.driver.getWindowRect().catch(() => null);
      if (windowRect) {
        // Signup keeps the Sign In switch near the footer; reveal it with a short upward swipe.
        for (let attempt = 0; attempt < 4 && !signInSwitch; attempt++) {
          await this.driver.execute("mobile: swipeGesture", {
            left: Math.floor(windowRect.width * 0.1),
            top: Math.floor(windowRect.height * 0.2),
            width: Math.floor(windowRect.width * 0.8),
            height: Math.floor(windowRect.height * 0.7),
            direction: "up",
            percent: 0.75
          }).catch(() => undefined);
          signInSwitch = await this.getFirstDisplayed(this.signupToLoginSelectors, 800);
        }
      }
    }

    if (!signInSwitch) {
      return false;
    }

    await signInSwitch.click();
    return this.isLoginScreenDisplayed(timeoutMs);
  }

  async enterEmail(email: string): Promise<void> {
    const emailField = await this.getFirstDisplayed(this.emailSelectors, 12000);
    if (!emailField) {
      throw new Error("Email field not visible on login screen");
    }

    await emailField.clearValue();
    await emailField.setValue(email);
  }

  async enterPassword(password: string): Promise<void> {
    const passwordField = await this.getFirstDisplayed(this.passwordSelectors, 12000);
    if (!passwordField) {
      throw new Error("Password field not visible on login screen");
    }

    await passwordField.clearValue();
    await passwordField.setValue(password);
  }

  async tapLogin(): Promise<void> {
    const loginButton = await this.getFirstDisplayed(this.loginButtonSelectors, 8000);
    if (!loginButton) {
      throw new Error("Login button not visible on login screen");
    }

    await loginButton.click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.dismissAlertIfPresent();
    await this.ensureOnLoginScreen(12000);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapLogin();
  }

  async isDashboardDisplayed(timeoutMs = 15000): Promise<boolean> {
    const marker = await this.getFirstDisplayed(this.dashboardVerificationSelectors, timeoutMs);
    return Boolean(marker);
  }
}
