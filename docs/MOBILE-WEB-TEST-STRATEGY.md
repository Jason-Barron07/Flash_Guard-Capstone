# Test Strategy

## Objective
Validate core FlashGuard fintech web and mobile journeys using stable, maintainable automation.

- Web: Playwright + TypeScript for browser-based functional and compatibility coverage.
- Mobile: Playwright test runner + Appium + WebdriverIO for Android device/emulator coverage.

## Design Principles
- Page Object Model for maintainability.
- AAA pattern in tests for readability.
- Explicit assertions with Playwright expect.
- No fixed `wait` usage.

## Platform Coverage
- Web coverage includes authentication, dashboard, transfers, notifications, reports, account management, compatibility, and responsive checks.
- Mobile coverage includes authentication, dashboard, balance/history, and transfer journeys.

## Environments
- Configured through `.env` variables.
- Web variables include BASE_URL, APP_USERNAME, APP_PASSWORD, and related runtime values.
- Mobile variables include ANDROID_APP_PACKAGE, ANDROID_APP_ACTIVITY, and Appium/device settings.
- Mobile execution requires a running Android emulator/device and reachable Appium server.

## Browsers
- Chromium
- Firefox

## Mobile Runtime
- Android (emulator/device)
- Appium (UiAutomator2)
- Session bootstrap and teardown through mobile fixtures

## Reporting
- Web HTML report: tests/ui/artifacts/playwright-report/
- Web failure artifacts: tests/ui/artifacts/test-results/
- Mobile HTML report: tests/mobile/artifacts/playwright-report/
- Mobile failure artifacts: tests/mobile/artifacts/test-results/

## CI/CD
- Pipeline executes lint/typecheck and automated suites for both web and mobile tracks.
- Mobile pipeline requires Android emulator setup, Appium availability, and application install before execution.
- Platform reports and failure artifacts are published as workflow artifacts.
