import { mkdirSync, existsSync, copyFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const targetDir = "reports/evidence";
mkdirSync(targetDir, { recursive: true });

const candidateFiles = [
  "reports/newman-junit.xml",
  "reports/ui-report.html",
  "reports/mobile-summary.md",
  "docs/RTM.md",
  "docs/Coverage-Analysis.md",
  "docs/Test-Strategy.md",
  "docs/Offline-Runbook.md",
  "docs/Submission-Checklist.md"
];

for (const file of candidateFiles) {
  if (existsSync(file)) {
    copyFileSync(file, join(targetDir, file.replaceAll("/", "_")));
  }
}

if (existsSync("tests/db/verify")) {
  for (const file of readdirSync("tests/db/verify")) {
    if (file.endsWith(".sql")) {
      copyFileSync(
        join("tests/db/verify", file),
        join(targetDir, `sql_verify_${file}`)
      );
    }
  }
}

console.log(`Evidence bundle ready in ${targetDir}`);
