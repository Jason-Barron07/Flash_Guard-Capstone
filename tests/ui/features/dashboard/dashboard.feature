@DASHBOARD
Feature: Dashboard

  @SMOKE @T-UI-DASH-001
  Scenario: T-UI-DASH-001 Dashboard Load Verification
    Given the user is signed in for dashboard checks
    When the user opens the dashboard page
    Then the dashboard header should be visible

  @T-UI-DASH-002
  Scenario: T-UI-DASH-002 Balance Display Accuracy
    Given the user is signed in for dashboard checks
    When the user opens the dashboard page
    Then the dashboard balance card should be visible

  @T-UI-DASH-003
  Scenario: T-UI-DASH-003 Recent Transactions Display
    Given the user is signed in for dashboard checks
    When the user opens the dashboard page
    Then the dashboard recent transactions should be visible

  @T-UI-DASH-004
  Scenario: T-UI-DASH-004 Profile Information Display
    Given the user is signed in for dashboard checks
    When the user opens the dashboard page
    Then the dashboard profile information should be visible
