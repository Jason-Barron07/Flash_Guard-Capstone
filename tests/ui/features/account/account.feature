@ACCOUNT
Feature: Account Management

  @T-UI-ACC-001
  Scenario: T-UI-ACC-001 Update User Profile
    Given the user is signed in for account checks
    When the user updates the profile display name to "Flash Guard QA"
    Then the account success message should be visible

  @T-UI-ACC-002
  Scenario: T-UI-ACC-002 Change Password
    Given the user is signed in for account checks
    When the user changes the account password
    Then the account success message should be visible

  @T-UI-ACC-003
  Scenario: T-UI-ACC-003 Add/Remove Payment Method
    Given the user is signed in for account checks
    When the user adds and removes an account payment method
    Then the account success message should be visible
