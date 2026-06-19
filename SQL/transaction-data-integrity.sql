-- SQL-004: Verify transaction amount matches ledger debit + credit 
-- Add all ledger amounts for each transaction.
-- Debit + Credit should equal twice the transaction amount.

SELECT
    t.id,
    t.amount,
    SUM(le.amount) AS LedgerTotal

FROM transactions t

JOIN ledger_entries le
ON t.id = le.transaction_id

GROUP BY
    t.id,
    t.amount;


-- SQL-005: Verify transaction status progression
-- View every transaction with its status
-- and important timestamps.

SELECT
    id,
    status,
    created_at,
    authorized_at,
    settled_at

FROM transactions

ORDER BY created_at;

-- SQL-006: Verify transaction timestamps are chronological
-- Find transactions where timestamps
-- are in the wrong order.

SELECT *

FROM transactions

WHERE
authorized_at < created_at
OR settled_at < authorized_at;

-- SQL-007: Verify recipient account is credited
-- Check that every recipient has
-- a credit entry in the ledger.

SELECT
    t.id,
    t.recipient_account_id,
    le.entry_type,
    le.amount

FROM transactions t

JOIN ledger_entries le
ON t.id = le.transaction_id

WHERE
le.account_id = t.recipient_account_id;


-- SQL-008: Verify failed transactions don't affect balances
-- Failed transactions should not
-- create ledger entries.

SELECT
    t.id,
    t.status,
    le.id AS LedgerEntry

FROM transactions t

LEFT JOIN ledger_entries le
ON t.id = le.transaction_id

WHERE
t.status = 'failed';