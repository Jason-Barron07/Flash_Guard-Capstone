@AUTH
Feature: Authentication

  @SMOKE @T-UI-AUTH-001
  Scenario: T-UI-AUTH-001 Valid Login
    Given the user navigates to the authentication page
    When the user signs in with valid authentication credentials
    Then the authentication dashboard should be displayed

  @T-UI-AUTH-002
  Scenario: T-UI-AUTH-002 Invalid Password Login
    Given the user navigates to the authentication page
    When the user signs in with an invalid authentication password
    Then an authentication error message should be displayed

  @T-UI-AUTH-003
  Scenario: T-UI-AUTH-003 Locked Account Login
    Given the user navigates to the authentication page
    When the user signs in with a locked authentication account
    Then an authentication error message should be displayed

  @T-UI-AUTH-004
  Scenario: T-UI-AUTH-004 Session Timeout
    Given the user is signed in to the authenticated session
    When the authenticated session times out
    Then the session timeout banner should be displayed

  @T-UI-AUTH-005
  Scenario: T-UI-AUTH-005 Logout
    Given the user is signed in to the authenticated session
    When the user logs out from the authenticated session
    Then the user should be redirected to the login route

  @T-UI-AUTH-006
  Scenario: T-UI-AUTH-006 Re-login After Logout
    Given the user is signed in to the authenticated session
    And the user logs out from the authenticated session
    When the user signs in again with valid authentication credentials
    Then the authentication dashboard should be displayed
