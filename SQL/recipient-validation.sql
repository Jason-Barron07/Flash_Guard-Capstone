-- SQL-014: Verify recipient block list is enforced 
-- Show all blocked recipients.

SELECT *

FROM recipients

WHERE blacklist_status = 'blocked';


-- SQL-015: Verify sender cannot be recipient
-- Find transactions where the sender
-- and recipient are the same account.

SELECT *

FROM transactions

WHERE sender_account_id = recipient_account_id;