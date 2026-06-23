# Coverage Report

## Scope
- Web UI automation for authentication, dashboard, transfers, notifications, reporting, account, browser compatibility, and responsive views.
- Mobile automation for authentication, dashboard, balance/history, and transfer flows.

## Included Test Packs - Web
- `tests/ui/spec/auth.spec.ts`
- `tests/ui/spec/dashboard.spec.ts`
- `tests/ui/spec/transfer.spec.ts`
- `tests/ui/spec/notifications.spec.ts`
- `tests/ui/spec/reports.spec.ts`
- `tests/ui/spec/account.spec.ts`
- `tests/ui/spec/compatibility.spec.ts`

## Included Test Packs - Mobile
- `tests/mobile/specs/auth.spec.ts`
- `tests/mobile/specs/dashboard.spec.ts`
- `tests/mobile/specs/balance-history.spec.ts`
- `tests/mobile/specs/transfer.spec.ts`

## Notes
- Tests are implemented with the Page Object Model (POM).
- Web locators are centralized in `tests/ui/pages/`.
- Mobile locators are centralized in `tests/mobile/pom/`.
- Web failures capture screenshot, trace, and video via Playwright config.
- Mobile failures capture trace and result artifacts under `tests/mobile/artifacts/`.
- Web HTML report output is generated under `tests/ui/artifacts/playwright-report/`.
- Mobile HTML report output is generated under `tests/mobile/artifacts/playwright-report/`.
