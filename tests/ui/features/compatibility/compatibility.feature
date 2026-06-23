@COMPATIBILITY
Feature: Compatibility and Responsive

  @T-UI-COMP-001
  Scenario: T-UI-COMP-001 Chrome Browser Compatibility
    Given the user is signed in for compatibility checks
    When the user opens the dashboard page for compatibility
    Then the compatibility dashboard header should be visible

  @T-UI-COMP-002
  Scenario: T-UI-COMP-002 Firefox Browser Compatibility
    Given the user is signed in for compatibility checks
    When the user opens the dashboard page for compatibility
    Then the compatibility dashboard header should be visible

  @T-UI-RESP-001
  Scenario: T-UI-RESP-001 Mobile View Validation
    Given the user is signed in for compatibility checks
    When the user switches to a mobile viewport
    Then the compatibility dashboard header should be visible

  @T-UI-RESP-002
  Scenario: T-UI-RESP-002 Tablet View Validation
    Given the user is signed in for compatibility checks
    When the user switches to a tablet viewport
    Then the compatibility dashboard header should be visible
