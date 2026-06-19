export const appiumConnection = {
  hostname: process.env.APPIUM_HOST || "127.0.0.1",
  port: Number(process.env.APPIUM_PORT || "4723"),
  path: process.env.APPIUM_PATH || "/wd/hub",
  logLevel: "error" as const
};

export const androidCapabilities: Record<string, string | number | boolean> = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": process.env.ANDROID_DEVICE_NAME || "Android Emulator",
  "appium:udid": process.env.ANDROID_UDID || "emulator-5554",
  "appium:appPackage": process.env.ANDROID_APP_PACKAGE || "com.anonymous.flashguadmobileapp",
  "appium:appActivity": process.env.ANDROID_APP_ACTIVITY || ".MainActivity",
  "appium:noReset": true,
  "appium:newCommandTimeout": 180,
  "appium:autoGrantPermissions": true,
  "appium:uiautomator2ServerLaunchTimeout": 120000
};
