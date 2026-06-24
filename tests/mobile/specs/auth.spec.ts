import { test, expect } from "../fixtures/mobile.fixture";
import { LoginPage } from "../pom/LoginPage";

const isUiTimeoutError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return normalized.includes("waiting for the root accessibilitynodeinfo")
    || normalized.includes("timed out after");
};

async function withUiRetry<T>(task: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (!isUiTimeoutError(error) || attempt > retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw (lastError instanceof Error ? lastError : new Error("UI retry failed"));
}

async function resolveAppState(loginPage: LoginPage, requireLogin = false): Promise<"dashboard" | "login" | null> {
  await loginPage.dismissAlertIfPresent();

  let appState = await loginPage.waitForAuthOrDashboard(15000);
  const shouldRetry = !appState || (requireLogin && appState === "dashboard");

  if (shouldRetry) {
    await loginPage.relaunchApp();
    await loginPage.dismissAlertIfPresent();
    appState = await loginPage.waitForAuthOrDashboard(15000);
  }

  return appState;
}

test("T-MOB-AUTH-001 Valid Login", async ({ mobileSession }) => {
  const loginPage = new LoginPage(mobileSession);

  await withUiRetry(async () => {
    await loginPage.relaunchApp();
  });

  const appState = await withUiRetry(async () => resolveAppState(loginPage));

  if (!appState) {
    throw new Error("App is not on dashboard or login screen; unable to continue T-MOB-AUTH-001");
  }

  if (appState === "login") {
    await withUiRetry(async () => {
      await loginPage.login("alice@flashguard.local", "offline-demo");
    });
  }

  const alertText = await loginPage.dismissAlertIfPresent();
  if (alertText && /login failed/i.test(alertText)) {
    throw new Error(`Login failed alert shown: ${alertText}`);
  }

  const isDashboardVisible = await withUiRetry(async () => loginPage.isDashboardDisplayed(12000));
  expect(isDashboardVisible).toBeTruthy();
});

test("T-MOB-AUTH-002 Invalid Login", async ({ freshMobileSession }) => {
  const loginPage = new LoginPage(freshMobileSession);

  await withUiRetry(async () => {
    await loginPage.relaunchApp();
  });
  await withUiRetry(async () => {
    await loginPage.dismissAlertIfPresent();
  });
  let alignedToLogin = await withUiRetry(async () => loginPage.ensureOnLoginScreen(12000));
  if (!alignedToLogin) {
    await withUiRetry(async () => {
      await loginPage.clearAppDataAndRelaunch();
    });
    await withUiRetry(async () => {
      await loginPage.dismissAlertIfPresent();
    });
    alignedToLogin = await withUiRetry(async () => loginPage.ensureOnLoginScreen(20000));
  }

  const invalidEmail = `no-user-${Date.now()}@flashguard.local`;
  try {
    await withUiRetry(async () => {
      await loginPage.login(invalidEmail, "wrong-password");
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const missingLoginInputs = message.includes("Email field not visible")
      || message.includes("Password field not visible")
      || message.includes("Login button not visible");

    if (!missingLoginInputs) {
      throw error;
    }

    await withUiRetry(async () => {
      await loginPage.clearAppDataAndRelaunch();
    });
    await withUiRetry(async () => {
      await loginPage.dismissAlertIfPresent();
    });
    await withUiRetry(async () => loginPage.ensureOnLoginScreen(20000));
    await withUiRetry(async () => {
      await loginPage.login(invalidEmail, "wrong-password");
    });
  }

  const alertText = await loginPage.waitForAlertText(5000);
  if (alertText) {
    expect(alertText).toMatch(/login failed|invalid|incorrect|unauthorized/i);
    await loginPage.dismissAlertIfPresent();
  }

  const isDashboardVisible = await withUiRetry(async () => loginPage.isDashboardDisplayed(5000));
  expect(isDashboardVisible).toBeFalsy();

  if (!alertText) {
    const stillOnLogin = await withUiRetry(async () => loginPage.isLoginScreenDisplayed(5000));
    expect(stillOnLogin).toBeTruthy();
  }
});