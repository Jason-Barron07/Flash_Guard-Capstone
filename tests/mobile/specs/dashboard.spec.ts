import { test, expect } from "../fixtures/mobile.fixture";
import { LoginPage } from "../pom/LoginPage";
import { DashboardPage } from "../pom/DashboardPage";

const VALID_EMAIL = "alice@flashguard.local";
const VALID_PASSWORD = "offline-demo";

test.beforeEach(async ({ mobileSession }) => {
  const loginPage = new LoginPage(mobileSession);
  const dashboardPage = new DashboardPage(mobileSession);

  await loginPage.relaunchApp();
  await loginPage.dismissAlertIfPresent();

  let state = await loginPage.waitForAuthOrDashboard(12000);
  if (!state) {
    await dashboardPage.relaunchApp();
    await loginPage.dismissAlertIfPresent();
    state = await loginPage.waitForAuthOrDashboard(12000);
  }

  if (state !== "dashboard") {
    let onLogin = await loginPage.ensureOnLoginScreen(12000);
    if (!onLogin) {
      await loginPage.clearAppDataAndRelaunch();
      await loginPage.dismissAlertIfPresent();
      onLogin = await loginPage.ensureOnLoginScreen(20000);
    }
    expect(onLogin).toBeTruthy();

    try {
      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const missingLoginInputs = message.includes("Email field not visible")
        || message.includes("Password field not visible")
        || message.includes("Login button not visible");

      if (!missingLoginInputs) {
        throw error;
      }

      await loginPage.clearAppDataAndRelaunch();
      await loginPage.dismissAlertIfPresent();
      const recoveredLogin = await loginPage.ensureOnLoginScreen(20000);
      expect(recoveredLogin).toBeTruthy();
      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    }

    await loginPage.dismissAlertIfPresent();
    state = await loginPage.waitForAuthOrDashboard(20000);
  }

  const onDashboard = await dashboardPage.openDashboardTabIfNeeded(15000);
  expect(onDashboard).toBeTruthy();
});

test("T-MOB-DASH-001 Dashboard Load Verification", async ({ mobileSession }) => {
  const dashboardPage = new DashboardPage(mobileSession);

  const loaded = await dashboardPage.isDashboardLoaded(12000);
  expect(loaded).toBeTruthy();
});

test("T-MOB-DASH-002 Recent Transactions Display", async ({ mobileSession }) => {
  const dashboardPage = new DashboardPage(mobileSession);

  const sectionVisible = await dashboardPage.scrollToRecentTransactions(10000);
  expect(sectionVisible).toBeTruthy();

  const hasTransactions = await dashboardPage.hasRecentTransactionItems(10000);
  expect(hasTransactions).toBeTruthy();
});

test.skip("T-MOB-DASH-003 Refresh Balance", async () => {
  test.info().annotations.push({
    type: "blocked",
    description: "Blocked: no refresh button exists on dashboard UI"
  });
});
