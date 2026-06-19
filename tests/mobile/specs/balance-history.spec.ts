import { test, expect } from "../fixtures/mobile.fixture";
import { LoginPage } from "../pom/LoginPage";
import { DashboardPage } from "../pom/DashboardPage";
import { BalanceHistoryPage } from "../pom/BalanceHistoryPage";

const VALID_EMAIL = "alice@flashguard.local";
const VALID_PASSWORD = "offline-demo";

test.beforeEach(async ({ mobileSession }) => {
  const loginPage = new LoginPage(mobileSession);
  const dashboardPage = new DashboardPage(mobileSession);
  const balanceHistoryPage = new BalanceHistoryPage(mobileSession);

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

    await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    await loginPage.dismissAlertIfPresent();
    await loginPage.waitForAuthOrDashboard(20000);
  }

  const onDashboard = await balanceHistoryPage.openDashboardIfNeeded(15000);
  expect(onDashboard).toBeTruthy();
});

test("T-MOB-BAL-001 Display Current Balance", async ({ mobileSession }) => {
  const balanceHistoryPage = new BalanceHistoryPage(mobileSession);

  const balanceText = await balanceHistoryPage.readCurrentBalance(10000);
  expect(balanceText).toMatch(/R\s?[0-9]/i);
});

test("T-MOB-BAL-002 View Transaction History", async ({ mobileSession }) => {
  const balanceHistoryPage = new BalanceHistoryPage(mobileSession);

  const onHistory = await balanceHistoryPage.openHistoryIfNeeded(12000);
  expect(onHistory).toBeTruthy();

  const hasHistory = await balanceHistoryPage.hasTransactionHistoryItems(10000);
  expect(hasHistory).toBeTruthy();
});

test.skip("T-MOB-BAL-003 Filter Transaction History", async () => {
  test.info().annotations.push({
    type: "blocked",
    description: "Blocked: no filter available"
  });
});

test.skip("T-MOB-BAL-004 Export/Share Transaction Screenshot", async () => {
  test.info().annotations.push({
    type: "blocked",
    description: "Blocked: no export/share function available"
  });
});