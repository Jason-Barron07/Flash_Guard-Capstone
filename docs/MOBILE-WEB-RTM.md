# Requirements Traceability Matrix (RTM)

| Requirement ID | Description | Test Case ID(s) |
| --- | --- | --- |
| R-AUTH-001 | User can log in with valid credentials | T-UI-AUTH-001, T-MOB-AUTH-001 |
| R-AUTH-002 | Invalid credentials are rejected | T-UI-AUTH-002, T-MOB-AUTH-002 |
| R-AUTH-003 | Locked accounts cannot authenticate | T-UI-AUTH-003 |
| R-AUTH-004 | Session expiry is handled safely | T-UI-AUTH-004 |
| R-AUTH-005 | User can log out cleanly | T-UI-AUTH-005 |
| R-AUTH-006 | User can re-authenticate after logout | T-UI-AUTH-006 |
| R-DASH-001 | Dashboard page renders | T-UI-DASH-001, T-MOB-DASH-001 |
| R-DASH-002 | Balance is displayed | T-UI-DASH-002, T-MOB-BAL-001 |
| R-DASH-003 | Recent transactions are visible | T-UI-DASH-003, T-MOB-DASH-002 |
| R-DASH-004 | Profile details are shown | T-UI-DASH-004 |
| R-TR-001 | Valid transfer succeeds | T-UI-TR-001, T-MOB-TR-001 |
| R-TR-002 | Minimum transfer amount is enforced | T-UI-TR-002, T-MOB-TR-002 |
| R-TR-003 | Maximum transfer amount is enforced | T-UI-TR-003 |
| R-TR-004 | Decimal amount is accepted | T-UI-TR-004, T-MOB-TR-002 |
| R-TR-005 | Blocked recipients are rejected | T-UI-TR-005 |
| R-TR-006 | Self-transfer is blocked | T-UI-TR-006 |
| R-TR-007 | OTP flow confirms transfer | T-UI-TR-007, T-MOB-TR-003, T-MOB-TR-004 |
| R-TR-008 | Failed transfer is surfaced | T-UI-TR-008 |
| R-NOTIF-001 | Success notification appears | T-UI-NOTIF-001 |
| R-NOTIF-002 | Alert notification appears | T-UI-NOTIF-002 |
| R-NOTIF-003 | Error notification appears | T-UI-NOTIF-003 |
| R-RPT-001 | Reports can be generated | T-UI-RPT-001 |
| R-RPT-002 | Transactions can be filtered | T-UI-RPT-002 |
| R-BAL-001 | Current balance is visible in mobile app | T-MOB-BAL-001 |
| R-BAL-002 | Transaction history is viewable in mobile app | T-MOB-BAL-002 |
| R-ACC-001 | User profile can be updated | T-UI-ACC-001 |
| R-ACC-002 | Password can be changed | T-UI-ACC-002 |
| R-ACC-003 | Payment method can be managed | T-UI-ACC-003 |
| R-COMP-001 | Chrome browser support | T-UI-COMP-001 |
| R-COMP-002 | Firefox browser support | T-UI-COMP-002 |
| R-RESP-001 | Mobile responsive layout | T-UI-RESP-001 |
| R-RESP-002 | Tablet responsive layout | T-UI-RESP-002 |
