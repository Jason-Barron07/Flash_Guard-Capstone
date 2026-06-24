@NOTIFICATION
Feature: Notifications

  @T-UI-NOTIF-001
  Scenario: T-UI-NOTIF-001 Failed Transfer Handling Notification
    Given the user is signed in for notification checks
    When the user triggers failed transfer handling
    Then failed transfer error message should be displayed

  @T-UI-NOTIF-002
  Scenario: T-UI-NOTIF-002 Validation Error Notification
    Given the user is signed in for notification checks
    When the user performs an invalid transfer action
    Then validation error message should be displayed

  @T-UI-NOTIF-003
  Scenario: T-UI-NOTIF-003 Error Toast Or Modal Display
    Given the user is signed in for notification checks
    When the user triggers failed transfer handling
    Then error toast or modal should be displayed
