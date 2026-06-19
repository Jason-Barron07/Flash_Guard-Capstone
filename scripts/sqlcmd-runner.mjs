import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const [, , sqlFile] = process.argv;

if (!sqlFile) {
  console.error("Usage: node scripts/sqlcmd-runner.mjs <sql-file>");
  process.exit(1);
}

if (!existsSync(sqlFile)) {
  console.error(`SQL file not found: ${sqlFile}`);
  process.exit(1);
}

const args = [
  "-S",
  `${process.env.DB_HOST || "localhost"},${process.env.DB_PORT || "1433"}`,
  "-U",
  process.env.DB_USER || "sa",
  "-P",
  process.env.DB_PASSWORD || "",
  "-d",
  process.env.DB_NAME || "master",
  "-i",
  sqlFile,
  "-b",
  "-C"
];

const result = spawnSync("sqlcmd", args, { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
