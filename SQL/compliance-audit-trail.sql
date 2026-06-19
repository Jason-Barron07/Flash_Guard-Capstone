-- SQL-010: Verify audit_log entry for every transaction
-- Check that every transaction has at least one audit log
-- entry for the sender's account.

SELECT
    t.id AS TransactionID,
    t.sender_account_id,
    a.id AS AuditLogID,
    a.action,
    a.created_at

FROM transactions t

LEFT JOIN audit_log a
ON t.sender_account_id = a.account_id

WHERE a.id IS NULL;


-- SQL-011: Verify compliance flags (AML, sanctions check) are logged
-- Find transactions that have
-- a compliance flag.

SELECT *

FROM transactions

WHERE compliance_flag IS NOT NULL; 


-- SQL-012: Verify failed compliance checks prevent transaction
--



-- SQL-013: Verify user login/logout audit trail
-- Display login and logout actions.

SELECT *

FROM audit_log

WHERE action = 'LOGIN'
OR action = 'LOGOUT'

ORDER BY created_at DESC;