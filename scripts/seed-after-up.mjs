import { spawnSync } from "node:child_process";

console.log("Seeding database using container sqlcmd...");
const args = ["compose", "--profile", "seed", "run", "--rm", "app-seed"];

const res = spawnSync("docker", args, { stdio: "inherit", shell: false });
if (res.error) {
  console.error("Failed to run docker compose seed container:", res.error);
  process.exit(1);
}
process.exit(res.status ?? 1);
