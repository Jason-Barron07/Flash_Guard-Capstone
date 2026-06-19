# Mobile Playwright + Appium Tests

This folder contains mobile automation tests implemented with Playwright Test Runner, Appium, UiAutomator2, TypeScript, and POM.

## Prerequisites

- Android emulator is running (default expected: `emulator-5554`)
- Appium server is running on `127.0.0.1:4723`
- Mobile app is installed and launchable on the emulator
- API/backend stack is reachable if running login happy-path tests

## Install

```powershell
npm --prefix tests/mobile install
```

## Run auth test

```powershell
npm --prefix tests/mobile run test:auth
```

## Run full mobile suite

```powershell
npm --prefix tests/mobile test
```

## Open report

```powershell
npm --prefix tests/mobile run report
```

## Test case delivered

- T-MOB-AUTH-001 Valid Login in `specs/auth.spec.ts`
- POM selectors centralized in `pom/LoginPage.ts`

## Optional environment overrides

- `APPIUM_HOST`
- `APPIUM_PORT`
- `APPIUM_PATH` (defaults to `/wd/hub`)
- `ANDROID_UDID`
- `ANDROID_DEVICE_NAME`
- `ANDROID_APP_PACKAGE`
- `ANDROID_APP_ACTIVITY`
