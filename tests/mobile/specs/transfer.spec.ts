import { test, expect } from "../fixtures/mobile.fixture";
import { LoginPage } from "../pom/LoginPage";
import { DashboardPage } from "../pom/DashboardPage";
import { TransferPage } from "../pom/TransferPage";

const VALID_EMAIL = "alice@flashguard.local";
const VALID_PASSWORD = "offline-demo";
const DEFAULT_RECIPIENT = "Bob Wallet";

test.beforeEach(async ({ mobileSession }) => {
  const loginPage = new LoginPage(mobileSession);
  const dashboardPage = new DashboardPage(mobileSession);
  const transferPage = new TransferPage(mobileSession);

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

  const onTransfer = await transferPage.openTransferTabIfNeeded(15000);
  expect(onTransfer).toBeTruthy();
});

async function submitTransferForApproval(transferPage: TransferPage, loginPage: LoginPage, amount: string): Promise<void> {
  await transferPage.selectRecipient(DEFAULT_RECIPIENT, 10000);
  await transferPage.enterTransferAmount(amount);
  await transferPage.submitTransfer();

  const alertText = await loginPage.waitForAlertText(10000);
  if (alertText) {
    expect(alertText).toMatch(/transfer submitted|queued for approval|submitted/i);
    await loginPage.dismissAlertIfPresent();
  }

  const onHistory = await transferPage.isHistoryScreenDisplayed(12000);
  expect(onHistory).toBeTruthy();
}

test("T-MOB-TR-001 Select Recipient", async ({ mobileSession }) => {
  const transferPage = new TransferPage(mobileSession);

  const recipientVisible = await transferPage.selectRecipient(DEFAULT_RECIPIENT, 10000);
  expect(recipientVisible).toBeTruthy();

  const stillOnTransfer = await transferPage.isTransferScreenDisplayed(5000);
  expect(stillOnTransfer).toBeTruthy();
});

test("T-MOB-TR-002 Enter Transfer Amount", async ({ mobileSession }) => {
  const transferPage = new TransferPage(mobileSession);

  await transferPage.enterTransferAmount("2500");

  const amountValue = await transferPage.readTransferAmountValue(5000);
  expect(amountValue).toContain("2500");

  const totalAmount = await transferPage.readTotalAmount(5000);
  expect(totalAmount).toMatch(/R.*2[\s\u00A0.,]?515([,.]00)?/i);
});

test("T-MOB-TR-003 Enter OTP Confirmation", async ({ mobileSession }) => {
  const transferPage = new TransferPage(mobileSession);
  const loginPage = new LoginPage(mobileSession);

  await submitTransferForApproval(transferPage, loginPage, "175");

  const otpCode = await transferPage.readPendingOtpCode(10000);
  expect(otpCode).toMatch(/^\d{6}$/);

  await transferPage.enterPendingOtp(otpCode);
  const enteredOtp = await transferPage.readPendingOtpValue(5000);
  expect(enteredOtp).toContain(otpCode);
});

test("T-MOB-TR-004 Confirm Transfer", async ({ mobileSession }) => {
  const transferPage = new TransferPage(mobileSession);
  const loginPage = new LoginPage(mobileSession);

  await submitTransferForApproval(transferPage, loginPage, "180");

  const otpCode = await transferPage.readPendingOtpCode(10000);
  expect(otpCode).toMatch(/^\d{6}$/);

  await transferPage.enterPendingOtp(otpCode);
  await transferPage.approvePendingTransfer();

  const alertText = await loginPage.waitForAlertText(10000);
  expect(alertText).toMatch(/authorized|approved/i);
  await loginPage.dismissAlertIfPresent();
});

test.skip("T-MOB-TR-005 Cancel Transfer", async () => {
  test.info().annotations.push({
    type: "blocked",
    description: "Blocked: no cancel button exists on transfer UI"
  });
});