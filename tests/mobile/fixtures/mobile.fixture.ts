import { test as base } from "@playwright/test";
import type { Browser } from "webdriverio";
import { remote } from "webdriverio";

import { appiumConnection, androidCapabilities } from "../config/androidCapabilities";

type MobileFixtures = {
  mobileSession: Browser;
  freshMobileSession: Browser;
};

const isUiAutomatorCrash = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return normalized.includes("instrumentation process is not running")
    || normalized.includes("cannot be proxied to uiautomator2 server")
    || normalized.includes("waiting for the root accessibilitynodeinfo")
    || normalized.includes("timed out after");
};

const createHealthySession = async (capabilities: Record<string, string | number | boolean>): Promise<Browser> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const session = await remote({
      ...appiumConnection,
      capabilities
    });

    try {
      await session.updateSettings({
        waitForIdleTimeout: 100,
        waitForSelectorTimeout: 15000
      }).catch(() => undefined);

      await session.getWindowRect();
      return session;
    } catch (error) {
      lastError = error;
      await session.deleteSession().catch(() => undefined);

      if (!isUiAutomatorCrash(error) || attempt === 3) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw (lastError instanceof Error ? lastError : new Error("Unable to establish a healthy Appium session"));
};

export const test = base.extend<MobileFixtures>({
  mobileSession: async ({}, use) => {
    const mobileSession = await createHealthySession(androidCapabilities);

    try {
      await use(mobileSession);
    } finally {
      await mobileSession.deleteSession();
    }
  },
  freshMobileSession: async ({}, use) => {
    const freshMobileSession = await createHealthySession({
      ...androidCapabilities,
      "appium:noReset": false,
      "appium:fullReset": false
    });

    try {
      await use(freshMobileSession);
    } finally {
      await freshMobileSession.deleteSession();
    }
  }
});

export { expect } from "@playwright/test";
