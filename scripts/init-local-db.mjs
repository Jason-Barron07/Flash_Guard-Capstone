import { spawnSync, execSync } from "node:child_process";

function winPathFromWsl(linuxPath) {
  try {
    const out = execSync(`wslpath -w "${linuxPath.replace(/"/g, '\\"')}"`, {
      encoding: "utf8",
    }).trim();
    return out;
  } catch (e) {
    return null;
  }
}

const cwd = process.cwd();
let command = null;
let args = [];

if (process.platform === "win32") {
  command = "powershell";
  args = [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    ".\\scripts\\init-local-db.ps1",
  ];
} else if (process.env.WSL_DISTRO_NAME) {
  const winCwd = winPathFromWsl(cwd);
  if (!winCwd) {
    console.error("Failed to convert WSL path to Windows path with wslpath.");
    process.exit(2);
  }
  command = "powershell.exe";
  args = [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    `${winCwd}\\scripts\\init-local-db.ps1`,
  ];
} else {
  console.error(
    "No suitable init script found for this platform. Use Windows PowerShell or WSL with powershell.exe available.",
  );
  process.exit(1);
}

const res = spawnSync(command, args, { stdio: "inherit", shell: false });
if (res.error) {
  console.error("Failed to run DB init command:", res.error);
  process.exit(1);
}
process.exit(res.status ?? 1);
