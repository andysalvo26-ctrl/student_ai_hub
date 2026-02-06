#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "config.json");

async function main() {
  console.log("Wix Site Snapshot - Environment Check");
  console.log(`Node: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);

  let configRaw = "";
  try {
    configRaw = await fs.readFile(configPath, "utf8");
    const config = JSON.parse(configRaw);
    console.log(`Config: OK (${configPath})`);
    console.log(`Sitemap URL: ${config.sitemapUrl}`);
    console.log(`Output Base Dir: ${config.outputBaseDir}`);
    console.log(`Input Mode: ${config.input?.mode || "auto"}`);
    console.log(`Links File: ${config.input?.linksFile || "none"}`);
    console.log(`Wait Until: ${config.crawl?.waitUntil}`);
    console.log(`Timeout (ms): ${config.crawl?.timeoutMs}`);
    console.log(`Hydration Wait (ms): ${config.crawl?.hydrationWaitMs}`);
    console.log(`HAR: ${config.har?.enabled ? `${config.har.mode} (${config.har.content})` : "disabled"}`);
    console.log(`Blocking: ${config.blocking?.enabled ? "enabled" : "disabled"}`);
  } catch (err) {
    console.error("Config: FAILED");
    console.error(String(err?.message || err));
    process.exit(1);
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const version = await browser.version();
    const execPath = chromium.executablePath();
    await browser.close();
    console.log(`Playwright: OK (chromium ${version})`);
    console.log(`Chromium executable: ${execPath}`);
  } catch (err) {
    console.error("Playwright: FAILED to launch chromium");
    console.error(String(err?.message || err));
    console.error("Hint: run 'npx playwright install chromium' inside snapshots/rig");
    process.exit(1);
  }
}

main();
