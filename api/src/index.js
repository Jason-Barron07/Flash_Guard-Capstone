import express from "express";
import cors from "cors";
import sql from "mssql";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const SERVICE_MERCHANT_EMAIL = "services@flashguard.local";

const dbHostCandidates = [...new Set([
  process.env.DB_HOST,
  process.env.DB_HOST_FALLBACK,
  "host.docker.internal",
  "localhost",
  "sqlserver",
].filter(Boolean))];

function createDbConfig(server) {
  return {
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "YourStrong!Passw0rd",
    database: process.env.DB_NAME || "FlashGuard",
    server,
    port: Number(process.env.DB_PORT || 1433),
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  };
}

let pool;
async function getPool() {
  if (pool) return pool;

  let lastError;
  for (const server of dbHostCandidates) {
    try {
      pool = await new sql.ConnectionPool(createDbConfig(server)).connect();
      process.env.DB_HOST = server;
      console.log(`Connected to SQL Server at ${server}:${process.env.DB_PORT || 1433}`);
      return pool;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Failed to connect to SQL Server");
  return pool;
}

function toMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function buildServiceLabel(serviceType) {
  const labels = {
    airtime: "Airtime top-up",
    data: "Data bundle",
    sms: "SMS bundle",
  };
  return labels[String(serviceType || "").toLowerCase()] || null;
}

function generateToken(accountId) {
  return jwt.sign({ accountId }, JWT_SECRET, { expiresIn: "24h" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

app.get("/health", async (_req, res) => {
  try {
    const p = await getPool();
    await p.request().query("SELECT 1 AS ok");
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });
  if (password !== "offline-demo") {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const p = await getPool();
  const account = await p
    .request()
    .input("email", sql.NVarChar(255), email)
    .query(
      "SELECT TOP 1 id, email, full_name, is_active FROM dbo.accounts WHERE email = @email",
    );
  if (!account.recordset.length) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  await p
    .request()
    .input("account_id", sql.Int, account.recordset[0].id)
    .input("action", sql.NVarChar(100), "login")
    .input("metadata", sql.NVarChar(sql.MAX), '{"channel":"api"}')
    .query(
      "INSERT INTO dbo.audit_log (account_id, action, metadata) VALUES (@account_id, @action, @metadata)",
    );
  const token = generateToken(account.recordset[0].id);
  return res.json({ token, user: account.recordset[0] });
});

app.post("/auth/register", async (req, res) => {
  const { email, fullName } = req.body;
  if (!email || !fullName)
    return res.status(400).json({ message: "email and fullName are required" });
  const p = await getPool();
  try {
    const result = await p
      .request()
      .input("email", sql.NVarChar(255), email)
      .input("full_name", sql.NVarChar(255), fullName).query(`
        INSERT INTO dbo.accounts (email, full_name, password_hash, balance, is_active)
        OUTPUT INSERTED.id, INSERTED.email, INSERTED.full_name, INSERTED.balance, INSERTED.is_active
        VALUES (@email, @full_name, 'offline-demo', 0, 1)
      `);
    return res.status(201).json(result.recordset[0]);
  } catch (_e) {
    return res.status(409).json({ message: "Email already exists" });
  }
});

app.post("/auth/logout", async (req, res) => {
  const accountId = Number(req.body.accountId || 1);
  const p = await getPool();
  await p
    .request()
    .input("account_id", sql.Int, accountId)
    .input("action", sql.NVarChar(100), "logout")
    .input("metadata", sql.NVarChar(sql.MAX), '{"channel":"api"}')
    .query(
      "INSERT INTO dbo.audit_log (account_id, action, metadata) VALUES (@account_id, @action, @metadata)",
    );
  res.json({ success: true });
});

app.get("/accounts", async (_req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .query(
      "SELECT id, email, full_name, balance, is_active FROM dbo.accounts ORDER BY id",
    );
  res.json(result.recordset);
});

app.get("/accounts/:accountId", async (req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .input("account_id", sql.Int, Number(req.params.accountId))
    .query(
      "SELECT id, email, full_name, balance, is_active FROM dbo.accounts WHERE id = @account_id",
    );
  if (!result.recordset.length)
    return res.status(404).json({ message: "Account not found" });
  res.json(result.recordset[0]);
});

app.get("/accounts/:accountId/balance", async (req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .input("account_id", sql.Int, Number(req.params.accountId))
    .query("SELECT id, balance FROM dbo.accounts WHERE id = @account_id");
  if (!result.recordset.length)
    return res.status(404).json({ message: "Account not found" });
  res.json(result.recordset[0]);
});

app.put("/accounts/:accountId", async (req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .input("account_id", sql.Int, Number(req.params.accountId))
    .input("full_name", sql.NVarChar(255), req.body.fullName || "Unnamed")
    .input("balance", sql.Decimal(18, 2), req.body.balance !== undefined ? req.body.balance : null)
    .query(`
      UPDATE dbo.accounts
      SET full_name = @full_name
      ${req.body.balance !== undefined ? ", balance = @balance" : ""}
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.full_name, INSERTED.balance, INSERTED.is_active
      WHERE id = @account_id
    `);
  if (!result.recordset.length)
    return res.status(404).json({ message: "Account not found" });
  res.json(result.recordset[0]);
});

app.get("/accounts/:accountId/statement", async (req, res) => {
  const accountId = Number(req.params.accountId);
  const p = await getPool();
  const result = await p.request().input("account_id", sql.Int, accountId)
    .query(`
      SELECT TOP 50 id, sender_account_id, recipient_account_id, amount, status, created_at
      FROM dbo.transactions
      WHERE sender_account_id = @account_id OR recipient_account_id = @account_id
      ORDER BY created_at DESC
    `);
  res.json({ accountId, items: result.recordset });
});

app.get("/transactions/history", async (_req, res) => {
  const p = await getPool();
  const result = await p.request().query(`
    SELECT TOP 100
      id,
      sender_account_id,
      recipient_account_id,
      transaction_type,
      service_type,
      service_network,
      service_phone_number,
      CASE
        WHEN transaction_type = 'service_purchase' AND LOWER(ISNULL(service_type, '')) IN ('airtime', 'data') THEN LOWER(service_type)
        WHEN transaction_type = 'transfer' THEN 'transfer'
        ELSE LOWER(transaction_type)
      END AS transaction_kind,
      amount,
      status,
      created_at,
      compliance_flag
    FROM dbo.transactions
    ORDER BY created_at DESC
  `);
  res.json(result.recordset);
});

app.get("/transactions/pending", async (_req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .query(
      `SELECT id, sender_account_id, recipient_account_id, amount, status, created_at FROM dbo.transactions WHERE status = 'pending' ORDER BY created_at DESC`,
    );
  res.json(result.recordset);
});

app.get("/transactions/:id", async (req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .input("id", sql.Int, Number(req.params.id))
    .query("SELECT * FROM dbo.transactions WHERE id = @id");
  if (!result.recordset.length)
    return res.status(404).json({ message: "Transaction not found" });
  res.json(result.recordset[0]);
});

app.post("/transactions/transfer", async (req, res) => {
  const senderId = Number(req.body.senderAccountId);
  const recipientId = Number(req.body.recipientAccountId);
  const amount = toMoney(req.body.amount);
  if (!senderId || !recipientId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid transfer payload" });
  }

  const p = await getPool();
  const tx = new sql.Transaction(p);
  await tx.begin();
  try {
    const senderRequest = new sql.Request(tx);
    const sender = await senderRequest
      .input("sender_id", sql.Int, senderId)
      .query(
        "SELECT id, balance FROM dbo.accounts WHERE id = @sender_id AND is_active = 1",
      );
    const recipientRequest = new sql.Request(tx);
    const recipient = await recipientRequest
      .input("recipient_id", sql.Int, recipientId)
      .query("SELECT id, is_active FROM dbo.accounts WHERE id = @recipient_id");
    if (
      !sender.recordset.length ||
      !recipient.recordset.length ||
      !recipient.recordset[0].is_active
    ) {
      throw new Error("Sender/recipient not valid");
    }
    if (sender.recordset[0].balance < amount) {
      throw new Error("Insufficient funds");
    }

    let complianceFlag = null;
    if (amount > 10000) complianceFlag = "aml";
    const status = complianceFlag ? "rejected" : "pending";

    const createRequest = new sql.Request(tx);
    const created = await createRequest
      .input("sender_account_id", sql.Int, senderId)
      .input("recipient_account_id", sql.Int, recipientId)
      .input("transaction_type", sql.NVarChar(20), "transfer")
      .input("amount", sql.Decimal(18, 2), amount)
      .input("status", sql.NVarChar(20), status)
      .input("compliance_flag", sql.NVarChar(20), complianceFlag).query(`
        INSERT INTO dbo.transactions (sender_account_id, recipient_account_id, transaction_type, amount, status, compliance_flag)
        OUTPUT INSERTED.*
        VALUES (@sender_account_id, @recipient_account_id, @transaction_type, @amount, @status, @compliance_flag)
      `);

    const createdTx = created.recordset[0];
    const auditRequest = new sql.Request(tx);
    await auditRequest
      .input("account_id", sql.Int, senderId)
      .input("action", sql.NVarChar(100), "transfer_initiated")
      .input(
        "metadata",
        sql.NVarChar(sql.MAX),
        JSON.stringify({ transaction_id: createdTx.id, amount, status }),
      )
      .query(
        "INSERT INTO dbo.audit_log (account_id, action, metadata) VALUES (@account_id, @action, @metadata)",
      );

    await tx.commit();
    return res.status(201).json(createdTx);
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ message: error.message });
  }
});

app.post("/transactions/transfer/:id/authorize", async (req, res) => {
  const id = Number(req.params.id);
  const p = await getPool();
  const tx = new sql.Transaction(p);
  await tx.begin();
  try {
    const readRequest = new sql.Request(tx);
    const existing = await readRequest
      .input("id", sql.Int, id)
      .query("SELECT * FROM dbo.transactions WHERE id = @id");
    if (!existing.recordset.length) throw new Error("Transaction not found");
    const tr = existing.recordset[0];
    if (tr.status !== "pending")
      throw new Error("Only pending transactions can be authorized");

    const balanceRequest = new sql.Request(tx);
    await balanceRequest
      .input("sender_id", sql.Int, tr.sender_account_id)
      .input("recipient_id", sql.Int, tr.recipient_account_id)
      .input("amount", sql.Decimal(18, 2), tr.amount).query(`
        UPDATE dbo.accounts SET balance = balance - @amount WHERE id = @sender_id;
        UPDATE dbo.accounts SET balance = balance + @amount WHERE id = @recipient_id;
      `);

    const writeRequest = new sql.Request(tx);
    await writeRequest
      .input("transaction_id", sql.Int, id)
      .input("sender_id", sql.Int, tr.sender_account_id)
      .input("recipient_id", sql.Int, tr.recipient_account_id)
      .input("amount", sql.Decimal(18, 2), tr.amount).query(`
        UPDATE dbo.transactions
        SET status = 'completed', authorized_at = SYSUTCDATETIME(), settled_at = SYSUTCDATETIME()
        WHERE id = @transaction_id;
        INSERT INTO dbo.ledger_entries (transaction_id, account_id, entry_type, amount)
        VALUES (@transaction_id, @sender_id, 'debit', @amount),
               (@transaction_id, @recipient_id, 'credit', @amount);
      `);

    await writeRequest
      .input("account_id", sql.Int, tr.sender_account_id)
      .input("action", sql.NVarChar(100), "transfer_authorized")
      .input(
        "metadata",
        sql.NVarChar(sql.MAX),
        JSON.stringify({ transaction_id: id }),
      )
      .query(
        "INSERT INTO dbo.audit_log (account_id, action, metadata) VALUES (@account_id, @action, @metadata)",
      );

    await tx.commit();
    const finalResult = await p
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM dbo.transactions WHERE id = @id");
    return res.json(finalResult.recordset[0]);
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ message: error.message });
  }
});

app.post("/transactions/service-purchase", async (req, res) => {
  const senderId = Number(req.body.senderAccountId);
  const serviceType = String(req.body.serviceType || "").toLowerCase();
  const network = String(req.body.network || "").trim();
  const phoneNumber = String(req.body.phoneNumber || "").trim();
  const amount = toMoney(req.body.amount);
  const serviceLabel = buildServiceLabel(serviceType);

  if (!senderId || !serviceLabel || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid service purchase payload" });
  }

  const p = await getPool();
  const tx = new sql.Transaction(p);
  await tx.begin();
  try {
    const senderRequest = new sql.Request(tx);
    const sender = await senderRequest
      .input("sender_id", sql.Int, senderId)
      .query(
        "SELECT id, balance FROM dbo.accounts WHERE id = @sender_id AND is_active = 1",
      );
    const merchantRequest = new sql.Request(tx);
    const merchant = await merchantRequest
      .input("merchant_email", sql.NVarChar(255), SERVICE_MERCHANT_EMAIL)
      .query(
        "SELECT TOP 1 id, is_active FROM dbo.accounts WHERE email = @merchant_email",
      );

    if (!sender.recordset.length || !merchant.recordset.length || !merchant.recordset[0].is_active) {
      throw new Error("Sender or service merchant not valid");
    }

    if (sender.recordset[0].balance < amount) {
      throw new Error("Insufficient funds");
    }

    const merchantId = merchant.recordset[0].id;

    const balanceRequest = new sql.Request(tx);
    await balanceRequest
      .input("sender_id", sql.Int, senderId)
      .input("merchant_id", sql.Int, merchantId)
      .input("amount", sql.Decimal(18, 2), amount).query(`
        UPDATE dbo.accounts SET balance = balance - @amount WHERE id = @sender_id;
        UPDATE dbo.accounts SET balance = balance + @amount WHERE id = @merchant_id;
      `);

    const insertRequest = new sql.Request(tx);
    const created = await insertRequest
      .input("sender_account_id", sql.Int, senderId)
      .input("recipient_account_id", sql.Int, merchantId)
      .input("transaction_type", sql.NVarChar(20), "service_purchase")
      .input("service_type", sql.NVarChar(20), serviceType)
      .input("service_network", sql.NVarChar(50), network)
      .input("service_phone_number", sql.NVarChar(20), phoneNumber)
      .input("amount", sql.Decimal(18, 2), amount)
      .input("status", sql.NVarChar(20), "completed")
      .input("compliance_flag", sql.NVarChar(20), null).query(`
        INSERT INTO dbo.transactions (
          sender_account_id,
          recipient_account_id,
          transaction_type,
          service_type,
          service_network,
          service_phone_number,
          amount,
          status,
          compliance_flag
        )
        OUTPUT INSERTED.*
        VALUES (
          @sender_account_id,
          @recipient_account_id,
          @transaction_type,
          @service_type,
          @service_network,
          @service_phone_number,
          @amount,
          @status,
          @compliance_flag
        )
      `);

    const createdTx = created.recordset[0];
      const ledgerRequest = new sql.Request(tx);
      await ledgerRequest
      .input("transaction_id", sql.Int, createdTx.id)
      .input("sender_id", sql.Int, senderId)
      .input("merchant_id", sql.Int, merchantId)
      .input("amount", sql.Decimal(18, 2), amount).query(`
        INSERT INTO dbo.ledger_entries (transaction_id, account_id, entry_type, amount)
        VALUES (@transaction_id, @sender_id, 'debit', @amount),
               (@transaction_id, @merchant_id, 'credit', @amount);
      `);

    const auditRequest = new sql.Request(tx);
    await auditRequest
      .input("account_id", sql.Int, senderId)
      .input("action", sql.NVarChar(100), "service_purchase_completed")
      .input(
        "metadata",
        sql.NVarChar(sql.MAX),
        JSON.stringify({
          transaction_id: createdTx.id,
          serviceType,
          serviceLabel,
          network,
          phoneNumber,
          amount,
        }),
      )
      .query(
        "INSERT INTO dbo.audit_log (account_id, action, metadata) VALUES (@account_id, @action, @metadata)",
      );

    await tx.commit();
    return res.status(201).json({
      ...createdTx,
      serviceType,
      serviceLabel,
      network,
      phoneNumber,
    });
  } catch (error) {
    await tx.rollback();
    return res.status(400).json({ message: error.message });
  }
});

app.post("/transactions/transfer/:id/cancel", async (req, res) => {
  const p = await getPool();
  const result = await p.request().input("id", sql.Int, Number(req.params.id))
    .query(`
      UPDATE dbo.transactions
      SET status = 'cancelled'
      OUTPUT INSERTED.*
      WHERE id = @id AND status = 'pending'
    `);
  if (!result.recordset.length)
    return res.status(400).json({ message: "Pending transaction not found" });
  return res.json(result.recordset[0]);
});

app.get("/recipients", async (_req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .query("SELECT * FROM dbo.recipients ORDER BY id");
  res.json(result.recordset);
});

app.post("/recipients", async (req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .input("sender_account_id", sql.Int, Number(req.body.senderAccountId))
    .input("recipient_account_id", sql.Int, Number(req.body.recipientAccountId))
    .input(
      "blacklist_status",
      sql.NVarChar(20),
      req.body.blacklistStatus || "clear",
    ).query(`
      INSERT INTO dbo.recipients (sender_account_id, recipient_account_id, blacklist_status)
      OUTPUT INSERTED.*
      VALUES (@sender_account_id, @recipient_account_id, @blacklist_status)
    `);
  res.status(201).json(result.recordset[0]);
});

app.put("/recipients/:recipientId", async (req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .input("id", sql.Int, Number(req.params.recipientId))
    .input(
      "blacklist_status",
      sql.NVarChar(20),
      req.body.blacklistStatus || "clear",
    ).query(`
      UPDATE dbo.recipients
      SET blacklist_status = @blacklist_status
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  if (!result.recordset.length)
    return res.status(404).json({ message: "Recipient not found" });
  return res.json(result.recordset[0]);
});

app.get("/recipients/:recipientId/status", async (req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .input("id", sql.Int, Number(req.params.recipientId))
    .query("SELECT id, blacklist_status FROM dbo.recipients WHERE id = @id");
  if (!result.recordset.length)
    return res.status(404).json({ message: "Recipient not found" });
  res.json(result.recordset[0]);
});

app.get("/audit-logs", async (_req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .query("SELECT TOP 200 * FROM dbo.audit_log ORDER BY created_at DESC");
  res.json(result.recordset);
});

app.get("/compliance-checks", async (_req, res) => {
  const p = await getPool();
  const result = await p
    .request()
    .query(
      "SELECT TOP 200 id, compliance_flag, status, created_at FROM dbo.transactions WHERE compliance_flag IS NOT NULL ORDER BY created_at DESC",
    );
  res.json(result.recordset);
});

app.post("/compliance-checks/validate", (req, res) => {
  const amount = Number(req.body.amount || 0);
  const flagged = amount > 10000;
  res.json({
    flagged,
    rule: flagged ? "aml" : null,
    message: flagged
      ? "Manual review required for amount > 10000"
      : "Compliant",
  });
});

app.get("/alerts", async (_req, res) => {
  const p = await getPool();
  const result = await p.request().query(`
    SELECT TOP 20 id, amount, compliance_flag, status, created_at
    FROM dbo.transactions
    WHERE compliance_flag IS NOT NULL OR amount >= 8000
    ORDER BY created_at DESC
  `);
  res.json(result.recordset);
});

// Payment Methods Endpoints
app.get("/payment-methods", async (req, res) => {
  try {
    const accountId = Number(req.headers["x-account-id"] || 0);
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const p = await getPool();
    const result = await p
      .request()
      .input("account_id", sql.Int, accountId)
      .query(`
        SELECT id, nickname, card_number_last_four as cardNumber, expiry_date as expiryDate, is_active as isActive, created_at as createdAt
        FROM dbo.payment_methods
        WHERE account_id = @account_id AND is_active = 1
        ORDER BY created_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching payment methods:", err.message);
    res.status(500).json({ message: err.message });
  }
});

app.post("/payment-methods", async (req, res) => {
  try {
    const accountId = Number(req.headers["x-account-id"] || 0);
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const { cardNumber, nickname, expiryDate, cvv } = req.body;
    if (!cardNumber || !nickname || !expiryDate || !cvv) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const p = await getPool();
    const lastFour = cardNumber.slice(-4);
    
    const result = await p
      .request()
      .input("account_id", sql.Int, accountId)
      .input("card_number_last_four", sql.NVarChar(4), lastFour)
      .input("card_number_encrypted", sql.NVarChar(255), Buffer.from(cardNumber).toString('base64'))
      .input("nickname", sql.NVarChar(100), nickname)
      .input("expiry_date", sql.NVarChar(5), expiryDate)
      .query(`
        INSERT INTO dbo.payment_methods (account_id, card_number_last_four, card_number_encrypted, nickname, expiry_date)
        VALUES (@account_id, @card_number_last_four, @card_number_encrypted, @nickname, @expiry_date);
        SELECT SCOPE_IDENTITY() as id;
      `);
    
    res.status(201).json({ id: result.recordset[0].id, nickname, cardNumber: `****${lastFour}` });
  } catch (err) {
    console.error("Error adding payment method:", err.message);
    res.status(500).json({ message: err.message });
  }
});

app.put("/payment-methods/:id", async (req, res) => {
  try {
    const accountId = Number(req.headers["x-account-id"] || 0);
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const { nickname, expiryDate } = req.body;
    if (!nickname || !expiryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const p = await getPool();
    const result = await p
      .request()
      .input("id", sql.Int, Number(req.params.id))
      .input("account_id", sql.Int, accountId)
      .input("nickname", sql.NVarChar(100), nickname)
      .input("expiry_date", sql.NVarChar(5), expiryDate)
      .query(`
        UPDATE dbo.payment_methods
        SET nickname = @nickname, expiry_date = @expiry_date, updated_at = SYSUTCDATETIME()
        WHERE id = @id AND account_id = @account_id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    
    res.json({ message: "Payment method updated" });
  } catch (err) {
    console.error("Error updating payment method:", err.message);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/payment-methods/:id", async (req, res) => {
  try {
    const accountId = Number(req.headers["x-account-id"] || 0);
    if (!accountId) return res.status(401).json({ message: "Unauthorized" });

    const p = await getPool();
    const result = await p
      .request()
      .input("id", sql.Int, Number(req.params.id))
      .input("account_id", sql.Int, accountId)
      .query(`
        UPDATE dbo.payment_methods
        SET is_active = 0, updated_at = SYSUTCDATETIME()
        WHERE id = @id AND account_id = @account_id
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Payment method not found" });
    }
    
    res.json({ message: "Payment method deleted" });
  } catch (err) {
    console.error("Error deleting payment method:", err.message);
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Flash-Guard API listening on port ${port}`);
});
