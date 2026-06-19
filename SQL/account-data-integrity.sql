-- SQL-001: Verify account balance 
-- Show every account with its stored balance
-- and compare it to the total credits minus debits.

SELECT
    a.id,
    a.full_name,
    a.balance,

    SUM(
        CASE
            WHEN le.entry_type = 'credit' THEN le.amount
            WHEN le.entry_type = 'debit' THEN -le.amount
            ELSE 0
        END
    ) AS CalculatedBalance

FROM accounts a

LEFT JOIN ledger_entries le
ON a.id = le.account_id

GROUP BY
    a.id,
    a.full_name,
    a.balance;

--SQL-002: Verify no duplicate accounts for same email
-- Find duplicate email addresses.

SELECT
    email,
    COUNT(*) AS NumberOfAccounts

FROM accounts

GROUP BY email

HAVING COUNT(*) > 1;


--SQL-003: Verify account soft-delete
-- Display all inactive accounts.
-- If soft delete is working correctly,
-- these records should still exist.

SELECT *

FROM accounts

WHERE is_active = 0;

