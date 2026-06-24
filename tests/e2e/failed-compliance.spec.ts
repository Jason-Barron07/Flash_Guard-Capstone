import { test, expect } from '@playwright/test';

import sql from 'mssql';

const dbConfig = {

user: 'sa',

password: 'Password123',

server: 'localhost',

database: 'FlashGuard',

options: { trustServerCertificate: true }

};

test('E2E - Failed compliance check blocks transfer', async ({ page }) => 

{

const sender = 'USR001';

const sanctionedRecipient = 'SANCTIONED_001';

const amount = 500;

// 1. Open Web Application

await page.goto('http://localhost:3000');

// 2. Login

await page.fill('#username', 'testuser');

await page.fill('#password', 'Password123');

await page.click('button[type="submit"]');

// 3. Navigate to transfer page

await page.click('text=New Transfer');

// 4. Submit transfer to sanctioned recipient

await page.fill('#recipient', sanctionedRecipient);

await page.fill('#amount', amount.toString());

await page.click('button:has-text("Submit Transfer")');

// 5. Verify UI error message

await expect(page.locator('.alert-danger'))

.toContainText('Transfer blocked due to compliance restrictions');

// 6. Verify no transaction exists in DB

const pool = await sql.connect(dbConfig);

const transactionResult = await pool.request()

.input('sender', sql.VarChar, sender)

.input('recipient', sql.VarChar, sanctionedRecipient)

.query(`

SELECT COUNT(*) AS count

FROM transactions

WHERE sender_id = @sender

AND recipient_id = @recipient

`);

expect(transactionResult.recordset[0].count).toBe(0);

// 7. Verify audit log entry exists

const auditResult = await pool.request()

.input('sender', sql.VarChar, sender)

.input('recipient', sql.VarChar, sanctionedRecipient)

.query(`

SELECT TOP 1 action, status, failure_reason

FROM audit_log

WHERE user_id = @sender

AND target_id = @recipient

ORDER BY created_at DESC

`);

expect(auditResult.recordset[0].action).toBe('TRANSFER_ATTEMPT');

expect(auditResult.recordset[0].status).toBe('FAILED');

expect(auditResult.recordset[0].failure_reason)

.toContain('SANCTIONED_RECIPIENT');

await pool.close();

});