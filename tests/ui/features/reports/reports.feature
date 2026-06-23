@REPORT
Feature: Reports

  @T-UI-RPT-001
  Scenario: T-UI-RPT-001 Generate Transaction Report
    Given the user is signed in for report checks
    When the user generates a report from "2025-01-01" to "2025-12-31" with type "transactions"
    Then the report results should be visible

  @T-UI-RPT-002
  Scenario: T-UI-RPT-002 Filter Transactions by Date Range
    Given the user is signed in for report checks
    When the user filters report transactions with "flash"
    Then the report results should be visible
