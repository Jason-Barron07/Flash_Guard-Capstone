import { execSync, spawnSync } from "node:child_process";
import { expect, request, test } from "@playwright/test";
import { LoginPage } from "../../ui/pages/LoginPage";
import { TransferPage } from "../../ui/pages/TransferPage";

type TransferResponse = {
  id: number;
  sender_account_id: number;
  recipient_account_id: number;
  amount: number;
  status: string;
};

const WEB_BASE_URL = process.env.BASE_URL || "http://localhost:3000/";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";
const USER_EMAIL = process.env.APP_USERNAME || "alice@flashguard.local";
const USER_PASSWORD = process.env.APP_PASSWORD || "offline-demo";
const RECIPIENT_NAME = process.env.E2E_RECIPIENT_NAME || "Bob Wallet";
const TRANSFER_AMOUNT = Number(process.env.E2E_TRANSFER_AMOUNT || "180");
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || "1433";
const DB_USER = process.env.DB_USER || "sa";
const DB_PASSWORD = process.env.DB_PASSWORD || "YourStrong!Passw0rd";
const DB_NAME = process.env.DB_NAME || "FlashGuard";

async function getBalance(apiBaseUrl: string, accountId: number): Promise<number> {
  const api = await request.newContext({ baseURL: apiBaseUrl });
  const response = await api.get(`/accounts/${accountId}/balance`);
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return Number(payload.balance);
}

function runSqlScalar(query: string): string {
  const result = spawnSync(
    "sqlcmd",
    [
      "-C",
      "-S",
      `${DB_HOST},${DB_PORT}`,
      "-U",
      DB_USER,
      "-P",
      DB_PASSWORD,
      "-d",
      DB_NAME,
      "-Q",
      `SET NOCOUNT ON; ${query}`,
      "-h",
      "-1",
      "-W"
    ],
    { encoding: "utf8", shell: true }
  );

  if (result.status !== 0) {
    throw new Error(`sqlcmd failed: ${result.stderr || result.stdout || "unknown sqlcmd error"}`);
  }

  const lines = (result.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) {
    throw new Error(`No SQL result for query: ${query}`);
  }

  return lines[0];
}

function getSqlBalance(accountId: number): number {
  const scalar = runSqlScalar(`SELECT CAST(balance AS VARCHAR(40)) FROM dbo.accounts WHERE id = ${accountId}`);
  const numeric = Number(scalar);
  if (Number.isNaN(numeric)) {
    throw new Error(`SQL balance is not numeric: ${scalar}`);
  }
  return numeric;
}

function getSqlTransactionStatus(transactionId: number): string {
  return runSqlScalar(`SELECT CAST(status AS VARCHAR(40)) FROM dbo.transactions WHERE id = ${transactionId}`);
}

function authorizePendingTransferInMobile(transactionId: number): void {
  execSync(
    'npm --prefix tests/mobile run test -- specs/e2e-cross-channel-authorization.spec.ts --grep "T-MOB-TR-E2E-001 Authorize Web Pending Transfer"',
    {
      stdio: "inherit",
      env: {
        ...process.env,
        E2E_PENDING_TRANSFER_ID: String(transactionId)
      }
    }
  );
}

test.describe("E2E Cross-Channel - Complete Transfer Lifecycle", () => {
  test("Scenario 1: Web transfer + mobile authorization + API/SQL validation", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const transferPage = new TransferPage(page);
    const api = await request.newContext({ baseURL: API_BASE_URL });

    let createdTransfer: TransferResponse;
    let senderApiBefore = 0;
    let recipientApiBefore = 0;
    let senderSqlBefore = 0;
    let recipientSqlBefore = 0;

    await test.step("1) User logs in via Web UI", async () => {
      await loginPage.goto(WEB_BASE_URL);
      await loginPage.login(USER_EMAIL, USER_PASSWORD);
      await expect(page).toHaveURL(/\/dashboard$/);

      // Validation point: auth API call succeeds and returns a user session token payload.
      const authResponse = await api.post("/auth/login", {
        data: { email: USER_EMAIL, password: USER_PASSWORD }
      });
      expect(authResponse.ok()).toBeTruthy();
      const authPayload = await authResponse.json();
      expect(authPayload.token).toBeTruthy();
      expect(Number(authPayload.user?.id || 0)).toBeGreaterThan(0);
    });

    await test.step("2) Web creates pending transfer", async () => {
      const preValidation = await api.post("/compliance-checks/validate", {
        data: { amount: TRANSFER_AMOUNT }
      });
      expect(preValidation.ok()).toBeTruthy();

      await transferPage.goto(WEB_BASE_URL);
      const transferResponsePromise = page.waitForResponse(
        (res) => res.url().includes("/transactions/transfer") && res.request().method() === "POST"
      );

      await transferPage.submitTransfer(RECIPIENT_NAME, String(TRANSFER_AMOUNT));

      const transferResponse = await transferResponsePromise;
      expect(transferResponse.ok()).toBeTruthy();
      createdTransfer = (await transferResponse.json()) as TransferResponse;
      expect(Number(createdTransfer.id)).toBeGreaterThan(0);
      expect(createdTransfer.status).toBe("pending");

      senderApiBefore = await getBalance(API_BASE_URL, createdTransfer.sender_account_id);
      recipientApiBefore = await getBalance(API_BASE_URL, createdTransfer.recipient_account_id);
      senderSqlBefore = getSqlBalance(createdTransfer.sender_account_id);
      recipientSqlBefore = getSqlBalance(createdTransfer.recipient_account_id);

      // API + SQL both validate pending state before mobile authorization.
      const txBeforeAuth = await api.get(`/transactions/${createdTransfer.id}`);
      expect(txBeforeAuth.ok()).toBeTruthy();
      const txPayload = await txBeforeAuth.json();
      expect(txPayload.status).toBe("pending");
      expect(getSqlTransactionStatus(createdTransfer.id)).toBe("pending");
    });

    await test.step("3) Mobile app authorizes the same pending transfer", async () => {
      authorizePendingTransferInMobile(createdTransfer.id);
    });

    await test.step("4) API validations after mobile authorization", async () => {
      const txAfterAuth = await api.get(`/transactions/${createdTransfer.id}`);
      expect(txAfterAuth.ok()).toBeTruthy();
      const txPayload = await txAfterAuth.json();
      expect(txPayload.status).toBe("completed");

      const alertsResponse = await api.get("/alerts");
      expect(alertsResponse.ok()).toBeTruthy();
      const alerts = (await alertsResponse.json()) as Array<{ id: number; amount: number }>;
      expect(alerts.some((item) => Number(item.id) === createdTransfer.id)).toBeTruthy();

      const historyResponse = await api.get("/transactions/history");
      expect(historyResponse.ok()).toBeTruthy();
      const history = (await historyResponse.json()) as Array<{ id: number; status: string }>;
      const found = history.find((entry) => Number(entry.id) === createdTransfer.id);
      expect(found).toBeTruthy();
      expect(found?.status).toBe("completed");
    });

    await test.step("5) SQL + API balance integrity validation", async () => {
      const senderApiAfter = await getBalance(API_BASE_URL, createdTransfer.sender_account_id);
      const recipientApiAfter = await getBalance(API_BASE_URL, createdTransfer.recipient_account_id);

      const senderSqlAfter = getSqlBalance(createdTransfer.sender_account_id);
      const recipientSqlAfter = getSqlBalance(createdTransfer.recipient_account_id);

      const sqlStatus = getSqlTransactionStatus(createdTransfer.id);
      expect(sqlStatus).toBe("completed");

      const expectedDelta = Number(createdTransfer.amount);
      expect(Number((senderApiBefore - senderApiAfter).toFixed(2))).toBe(Number(expectedDelta.toFixed(2)));
      expect(Number((recipientApiAfter - recipientApiBefore).toFixed(2))).toBe(Number(expectedDelta.toFixed(2)));
      expect(Number((senderSqlBefore - senderSqlAfter).toFixed(2))).toBe(Number(expectedDelta.toFixed(2)));
      expect(Number((recipientSqlAfter - recipientSqlBefore).toFixed(2))).toBe(Number(expectedDelta.toFixed(2)));
    });
  });
});
