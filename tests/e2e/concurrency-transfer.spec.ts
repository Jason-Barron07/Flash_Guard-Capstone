import { test, expect } from '@playwright/test';

import sql from 'mssql';

const dbConfig = {

user: 'sa',

password: 'Password123',

server: 'localhost',

database: 'FlashGuard',

options: { trustServerCertificate: true }

};

test('E2E - Concurrent transfers from Web and Mobile', async ({ browser }) => 
{

const sender = 'USR001';

const recipientA = 'USR002';

const recipientB = 'USR003';

const amountA = 100;

const amountB = 200;

// Get initial balance

const pool = await sql.connect(dbConfig);

const balanceResult = await pool.request()

.input('sender', sql.VarChar, sender)

.query(`

SELECT balance

FROM accounts

WHERE user_id = @sender

`);

const initialBalance = balanceResult.recordset[0].balance;

// Create two separate browser contexts (Web + Mobile)

const webContext = await browser.newContext();

const mobileContext = await browser.newContext({

viewport: { width: 390, height: 844 },

userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'

});

const webPage = await webContext.newPage();

const mobilePage = await mobileContext.newPage();

// Login both sessions

await Promise.all([

webPage.goto('http://localhost:3000'),

mobilePage.goto('http://localhost:3000')

]);

// Web login

await webPage.fill('#username', 'testuser');

await webPage.fill('#password', 'Password123');

await webPage.click('button[type="submit"]');

// Mobile login

await mobilePage.fill('#username', 'testuser');

await mobilePage.fill('#password', 'Password123');

await mobilePage.click('button[type="submit"]');

// Submit both transfers simultaneously

await Promise.all([ (async (): Promise<void> => 
{

await webPage.click('text=New Transfer');

await webPage.fill('#recipient', recipientA);

await webPage.fill('#amount', amountA.toString());

await webPage.click('button:has-text("Submit Transfer")');

})(), (async (): Promise<void> => 
    
{

await mobilePage.click('text=New Transfer');

await mobilePage.fill('#recipient', recipientB);

await mobilePage.fill('#amount', amountB.toString());

await mobilePage.click('button:has-text("Submit Transfer")');

})()

]);

// Verify success messages

await expect(webPage.locator('.alert-success'))

.toContainText('Transfer completed');

await expect(mobilePage.locator('.alert-success'))

.toContainText('Transfer completed');

// Verify both transactions exist

const txResult = await pool.request()

.input('sender', sql.VarChar, sender)

.query(`

SELECT recipient_id, amount

FROM transactions

WHERE sender_id = @sender

AND recipient_id IN ('USR002', 'USR003')

`);

expect(txResult.recordset).toHaveLength(2);

// Verify final balance

const finalBalanceResult = await pool.request()

.input('sender', sql.VarChar, sender)

.query(`

SELECT balance

FROM accounts

WHERE user_id = @sender

`);

const finalBalance = finalBalanceResult.recordset[0].balance;

expect(finalBalance).toBe(initialBalance - amountA - amountB);

// Verify audit logs for both transfers

const auditResult = await pool.request()

.input('sender', sql.VarChar, sender)

.query(`

SELECT COUNT(*) AS count

FROM audit_log

WHERE user_id = @sender

AND action = 'TRANSFER_COMPLETED'

`);

expect(auditResult.recordset[0].count).toBeGreaterThanOrEqual(2);

await webContext.close();

await mobileContext.close();

await pool.close();

});