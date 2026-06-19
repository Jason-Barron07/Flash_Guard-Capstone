import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const verifyDir = "tests/db/verify";
const files = readdirSync(verifyDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("No DB verification scripts found.");
  process.exit(0);
}

for (const file of files) {
  const fullPath = join(verifyDir, file);
  console.log(`Running DB verification: ${fullPath}`);
  const sqlPath = `/workspace/${fullPath.replaceAll("\\", "/")}`;
  const result = spawnSync("docker", [
    "compose",
    "exec",
    "-T",
    "sqlserver",
    "/opt/mssql-tools18/bin/sqlcmd",
    "-C",
    "-S",
    "localhost",
    "-U",
    process.env.DB_USER || "sa",
    "-P",
    process.env.DB_PASSWORD || "YourStrong!Passw0rd",
    "-d",
    process.env.DB_NAME || "FlashGuard",
    "-i",
    sqlPath
  ], {
    stdio: "inherit",
    shell: true
  });
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("All DB verification scripts passed.");
