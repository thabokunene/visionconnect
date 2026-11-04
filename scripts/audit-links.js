import { chromium } from "@playwright/test";
import { auditLinks } from "./link-audit.js";
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH
    ? {
        executablePath: process.env.CHROMIUM_PATH,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--no-zygote"],
      }
    : {},
);
try {
  const result = await auditLinks(
    browser,
    process.env.AUDIT_BASE_URL || "http://127.0.0.1:5173",
  );
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) process.exitCode = 1;
} finally {
  await browser.close();
}
