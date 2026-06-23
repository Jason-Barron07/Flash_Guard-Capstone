import { accessSync, constants } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const APPIUM_HOST = process.env.APPIUM_HOST || "127.0.0.1";
const APPIUM_PORT = Number(process.env.APPIUM_PORT || "4723");
const APPIUM_PATH = process.env.APPIUM_PATH || "/wd/hub";
const ANDROID_UDID = process.env.ANDROID_UDID || "emulator-5554";

const isWindows = process.platform === "win32";

function log(message) {
  process.stdout.write(`[preflight] ${message}\n`);
}

function fail(message) {
  process.stderr.write(`[preflight] ERROR: ${message}\n`);
  process.exit(1);
}

function normalizeBasePath(input) {
  if (!input || input === "/") {
    return "";
  }

  const withLeadingSlash = input.startsWith("/") ? input : `/${input}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

async function getJsonWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function canExecute(filePath) {
  try {
    accessSync(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveAdbCommand() {
  const candidates = [];
  const adbName = isWindows ? "adb.exe" : "adb";

  const sdkRoots = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT].filter(Boolean);
  for (const sdkRoot of sdkRoots) {
    candidates.push(path.join(sdkRoot, "platform-tools", adbName));
  }

  candidates.push("adb");

  for (const candidate of candidates) {
    try {
      if (candidate !== "adb" && !canExecute(candidate)) {
        continue;
      }

      execFileSync(candidate, ["version"], { stdio: "ignore" });
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  return null;
}

function parseConnectedDevices(adbOutput) {
  return adbOutput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.toLowerCase().startsWith("list of devices attached"))
    .map((line) => {
      const [id, state = "unknown"] = line.split(/\s+/);
      return { id, state };
    });
}

async function checkAppium() {
  const basePath = normalizeBasePath(APPIUM_PATH);
  const statusUrl = `http://${APPIUM_HOST}:${APPIUM_PORT}${basePath}/status`;

  log(`Checking Appium at ${statusUrl}`);

  let status;
  try {
    status = await getJsonWithTimeout(statusUrl, 5000);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(
      `Unable to reach Appium at ${statusUrl} (${message}). Start it with: npx appium --address ${APPIUM_HOST} --port ${APPIUM_PORT} --base-path ${APPIUM_PATH}`
    );
  }

  const ready = status?.value?.ready;
  if (ready === false) {
    fail(`Appium responded but is not ready: ${JSON.stringify(status)}`);
  }

  log("Appium endpoint is reachable.");
}

function checkAndroidDevice() {
  const adbCommand = resolveAdbCommand();
  if (!adbCommand) {
    fail("adb was not found. Install Android platform-tools or set ANDROID_HOME/ANDROID_SDK_ROOT.");
  }

  log(`Checking adb devices using: ${adbCommand}`);

  let adbOutput;
  try {
    adbOutput = execFileSync(adbCommand, ["devices"], { encoding: "utf8" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Failed to execute adb devices (${message}).`);
  }

  const devices = parseConnectedDevices(adbOutput);
  const targetDevice = devices.find((entry) => entry.id === ANDROID_UDID);

  if (!targetDevice) {
    const connected = devices.length
      ? devices.map((entry) => `${entry.id} (${entry.state})`).join(", ")
      : "none";
    fail(`Expected Android device ${ANDROID_UDID} is not connected. Connected devices: ${connected}`);
  }

  if (targetDevice.state !== "device") {
    fail(`Android device ${ANDROID_UDID} is in state '${targetDevice.state}', expected 'device'.`);
  }

  log(`Android device ${ANDROID_UDID} is connected.`);
}

async function main() {
  log("Starting mobile environment preflight checks...");
  await checkAppium();
  checkAndroidDevice();
  log("Preflight checks passed.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  fail(message);
});
