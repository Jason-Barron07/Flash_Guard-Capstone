@TRANSFER
Feature: Transfers

  @SMOKE @T-UI-TR-001
  Scenario: T-UI-TR-001 Successful Fund Transfer
    Given the user is signed in for transfer checks
    When the user submits a transfer with recipient "Alice Ledgercheck_circle" and amount "500"
    Then the transfer status message should include "success"

  @T-UI-TR-002
  Scenario: T-UI-TR-002 Minimum Amount Validation
    Given the user is signed in for transfer checks
    When the user submits a transfer with recipient "Alice Ledgercheck_circle" and amount "0"
    Then the transfer status message should include "Invalid transfer payload"

  @T-UI-TR-003
  Scenario: T-UI-TR-003 Maximum Amount Validation
    Given the user is signed in for transfer checks
    When the user submits a transfer with recipient "Alice Ledgercheck_circle" and amount "999999.00"
    Then the transfer status message should include "Insufficient funds"

  @T-UI-TR-004
  Scenario: T-UI-TR-004 Decimal Validation
    Given the user is signed in for transfer checks
    When the user submits a transfer with recipient "Alice Ledgercheck_circle" and amount "500"
    Then the transfer status message should include "success"

  @T-UI-TR-005
  Scenario: T-UI-TR-005 Blocked Recipient Validation
    Given the user is signed in for transfer checks
    When the user submits a transfer with recipient "Charlie Frozen" and amount "500"
    Then the transfer status message should include "Sender/recipient not valid"

  @T-UI-TR-006
  Scenario: T-UI-TR-006 Self Transfer Validation
    Given the user is signed in for transfer checks
    When the user attempts to select self as beneficiary
    Then self beneficiary should not be selectable

  @T-UI-TR-007
  Scenario: T-UI-TR-007 OTP Confirmation
    Given the user is signed in for transfer checks
    When the user confirms transfer otp with "123456"
    Then the transfer status message should include "confirmed"

  @T-UI-TR-008
  Scenario: T-UI-TR-008 Failed Transfer Handling
    Given the user is signed in for transfer checks
    When the user submits a transfer with recipient "Charlie Frozen" and amount "500"
    Then the transfer status message should include "Sender/recipient not valid"
