import { request } from "@playwright/test";
import { test, expect } from "../fixtures/mobile.fixture";
import { LoginPage } from "../pom/LoginPage";
import { DashboardPage } from "../pom/DashboardPage";
import { TransferPage } from "../pom/TransferPage";

const VALID_EMAIL = process.env.APP_USERNAME || "alice@flashguard.local";
const VALID_PASSWORD = process.env.APP_PASSWORD || "offline-demo";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";

async function ensureAuthenticatedOnTransfer(loginPage: LoginPage, dashboardPage: DashboardPage, transferPage: TransferPage): Promise<void> {
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
    state = await loginPage.waitForAuthOrDashboard(20000);
  }

  if (state !== "dashboard") {
    await dashboardPage.relaunchApp();
    await loginPage.dismissAlertIfPresent();
    state = await loginPage.waitForAuthOrDashboard(12000);
  }

  expect(state).toBe("dashboard");

  const onTransfer = await transferPage.openTransferTabIfNeeded(15000);
  expect(onTransfer).toBeTruthy();
}

test("T-MOB-TR-E2E-001 Authorize Web Pending Transfer", async ({ mobileSession }) => {
  const transferId = Number(process.env.E2E_PENDING_TRANSFER_ID || "0");
  expect(transferId).toBeGreaterThan(0);

  const api = await request.newContext({ baseURL: API_BASE_URL });
  const beforeResponse = await api.get(`/transactions/${transferId}`);
  expect(beforeResponse.ok()).toBeTruthy();
  const beforePayload = await beforeResponse.json();
  expect(beforePayload.status).toBe("pending");

  const loginPage = new LoginPage(mobileSession);
  const dashboardPage = new DashboardPage(mobileSession);
  const transferPage = new TransferPage(mobileSession);

  await ensureAuthenticatedOnTransfer(loginPage, dashboardPage, transferPage);

  // Mobile part: user reads OTP on app UI, enters it, and taps Approve.
  const otpCode = await transferPage.readPendingOtpCode(12000);
  expect(otpCode).toMatch(/^\d{6}$/);

  await transferPage.enterPendingOtp(otpCode);
  await transferPage.approvePendingTransfer();

  const alertText = await loginPage.waitForAlertText(10000);
  expect(alertText).toMatch(/authorized|approved/i);
  await loginPage.dismissAlertIfPresent();

  const afterResponse = await api.get(`/transactions/${transferId}`);
  expect(afterResponse.ok()).toBeTruthy();
  const afterPayload = await afterResponse.json();
  expect(afterPayload.status).toBe("completed");
});
