-- SQL-016: Verify no double-spending 
-- Look for accounts with
-- negative balances.

SELECT *

FROM accounts

WHERE balance < 0;

-- SQL-017 Verify transaction isolation (Dirty Reads)

-- Session 1
BEGIN TRANSACTION;

UPDATE accounts
SET balance = balance + 100
WHERE id = 1;

-- No commit was done

-- Session 2

SELECT *

FROM accounts

WHERE id = 1;