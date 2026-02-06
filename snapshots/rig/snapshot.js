#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { setTimeout as sleep } from "timers/promises";
import { chromium } from "playwright";
import { XMLParser } from "fast-xml-parser";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import pLimit from "p-limit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "config.json");

function formatTimestamp(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${d}_${hh}-${mm}-${ss}`;
}

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function extractTextFromDom(root) {
  if (!root) {
    return { text: "", wordCount: 0, headingCount: 0, missingMainContent: "yes (no root)" };
  }

  root.querySelectorAll("script, style, noscript").forEach((el) => el.remove());

  const lines = [];
  let headingCount = 0;
  const elements = root.querySelectorAll("h1,h2,h3,h4,h5,h6,p,li");

  for (const el of elements) {
    const tag = el.tagName.toLowerCase();
    const text = cleanText(el.textContent || "");
    if (!text) continue;

    if (tag.startsWith("h")) {
      const level = Number(tag.slice(1)) || 1;
      const prefix = "#".repeat(Math.min(level, 6));
      lines.push(`${prefix} ${text}`);
      headingCount += 1;
    } else {
      lines.push(text);
    }
  }

  const text = lines.join("\n\n").trim();
  const wordCount = text ? text.split(/\s+/).length : 0;

  let missingMainContent = "no";
  if (!text) {
    missingMainContent = "yes (no text extracted)";
  } else if (wordCount < 80) {
    missingMainContent = "yes (low word count)";
  } else if (headingCount === 0) {
    missingMainContent = "maybe (no headings)";
  }

  return { text, wordCount, headingCount, missingMainContent };
}

function extractText(html, url) {
  let readableResult = null;
  try {
    const readabilityDom = new JSDOM(html, { url });
    const reader = new Readability(readabilityDom.window.document);
    readableResult = reader.parse();
  } catch {
    readableResult = null;
  }

  if (readableResult && readableResult.content) {
    const articleDom = new JSDOM(readableResult.content, { url });
    const articleRoot = articleDom.window.document.body;
    const extracted = extractTextFromDom(articleRoot);
    if (extracted.wordCount > 0) {
      return extracted;
    }
  }

  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;
  doc
    .querySelectorAll("nav, footer, header, [role='navigation'], [role='banner'], [role='contentinfo'], aside")
    .forEach((el) => el.remove());

  const main = doc.querySelector("main");
  const root = main || doc.body || doc.documentElement;
  return extractTextFromDom(root);
}

function createSlugger() {
  const used = new Map();
  return (url) => {
    let slug = "";
    try {
      const u = new URL(url);
      const pathName = u.pathname || "/";
      if (pathName === "/" || pathName.trim() === "") {
        slug = "home";
      } else {
        slug = pathName
          .replace(/^\/+/, "")
          .replace(/\/+$/, "")
          .replace(/\/+/g, "-")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-/g, "")
          .replace(/-$/g, "")
          .toLowerCase();
      }
    } catch {
      slug = "page";
    }

    if (!slug) slug = "page";

    const count = used.get(slug) || 0;
    used.set(slug, count + 1);
    if (count > 0) {
      return `${slug}-${count + 1}`;
    }
    return slug;
  };
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function parseSitemap(xml, parser) {
  const data = parser.parse(xml);

  if (data.urlset && data.urlset.url) {
    const urls = Array.isArray(data.urlset.url) ? data.urlset.url : [data.urlset.url];
    return urls
      .map((u) => ({
        url: (u.loc || "").trim(),
        lastmod: u.lastmod ? String(u.lastmod).trim() : null
      }))
      .filter((u) => u.url);
  }

  if (data.sitemapindex && data.sitemapindex.sitemap) {
    const sitemaps = Array.isArray(data.sitemapindex.sitemap)
      ? data.sitemapindex.sitemap
      : [data.sitemapindex.sitemap];

    const all = [];
    for (const sm of sitemaps) {
      const loc = (sm.loc || "").trim();
      if (!loc) continue;
      const subXml = await fetchText(loc);
      const subUrls = await parseSitemap(subXml, parser);
      all.push(...subUrls);
    }
    return all;
  }

  return [];
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("#")) return null;
  const url = new URL(trimmed);
  url.hash = "";
  return url.toString();
}

async function loadLinksFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const urls = [];
  const seen = new Set();
  const invalid = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.trim().startsWith("#")) continue;
    try {
      const normalized = normalizeUrl(line);
      if (!normalized) continue;
      if (!seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    } catch {
      invalid.push(line);
    }
  }

  if (invalid.length) {
    const preview = invalid.slice(0, 5).join(" | ");
    throw new Error(`Invalid URL(s) in links file: ${preview}`);
  }

  return urls;
}

async function loadInputEntries(config, parser) {
  const inputMode = config.input?.mode || "auto";
  const linksFile = config.input?.linksFile ? path.resolve(__dirname, config.input.linksFile) : null;

  if (inputMode === "links") {
    if (!linksFile) {
      throw new Error("Input mode is 'links' but no linksFile is configured.");
    }
    const urls = await loadLinksFile(linksFile);
    if (!urls.length) {
      throw new Error("Links file is empty.");
    }
    return { inputMode: "links", inputSource: linksFile, entries: urls.map((url) => ({ url, lastmod: null })) };
  }

  if (inputMode === "auto" && linksFile && (await fileExists(linksFile))) {
    const urls = await loadLinksFile(linksFile);
    if (urls.length) {
      return { inputMode: "links", inputSource: linksFile, entries: urls.map((url) => ({ url, lastmod: null })) };
    }
  }

  const sitemapXml = await fetchText(config.sitemapUrl);
  const entries = await parseSitemap(sitemapXml, parser);
  return { inputMode: "sitemap", inputSource: config.sitemapUrl, entries };
}

function buildUrlBlocker(config) {
  if (!config.blocking?.enabled) return null;
  const patterns = (config.blocking.urlSubstrings || []).map((p) => p.toLowerCase()).filter(Boolean);
  if (!patterns.length) return null;

  return (url) => {
    const lower = url.toLowerCase();
    return patterns.some((p) => lower.includes(p));
  };
}

async function applyBlocking(context, config) {
  const matcher = buildUrlBlocker(config);
  if (!matcher) return;

  await context.route("**/*", (route) => {
    const url = route.request().url();
    if (matcher(url)) {
      return route.abort();
    }
    return route.continue();
  });
}

async function waitForSelectorCandidate(page, selectors, timeoutMs) {
  const candidates = Array.isArray(selectors) ? selectors : [];
  for (const selector of candidates) {
    try {
      await page.waitForSelector(selector, { timeout: timeoutMs, state: "attached" });
      return { found: true, selector };
    } catch {
      // Try next selector.
    }
  }
  return { found: false, selector: null };
}

async function waitForFontsReady(page, timeoutMs) {
  try {
    const supported = await page.evaluate(() => !!document.fonts && typeof document.fonts.ready?.then === "function");
    if (!supported) {
      return { supported: false, ready: false };
    }

    const result = await page.evaluate(async (timeout) => {
      const readyPromise = document.fonts.ready.then(
        () => "ready",
        () => "error"
      );
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve("timeout"), timeout));
      return await Promise.race([readyPromise, timeoutPromise]);
    }, timeoutMs);

    return { supported: true, ready: result === "ready" };
  } catch {
    return { supported: true, ready: false };
  }
}

async function waitForStability(page, stability) {
  try {
    const result = await page.evaluate(({ checks, delayMs, tolerance }) => {
      const getState = () => {
        const docEl = document.documentElement;
        const height = docEl ? docEl.scrollHeight : 0;
        const textLength = document.body ? document.body.innerText.length : 0;
        return { height, textLength };
      };

      return new Promise((resolve) => {
        let stableCount = 0;
        let totalChecks = 0;
        let last = getState();
        const start = performance.now();
        const maxChecks = Math.max(checks * 6, checks + 2);

        const tick = () => {
          totalChecks += 1;
          requestAnimationFrame(() => {
            const current = getState();
            const heightStable = Math.abs(current.height - last.height) <= tolerance;
            const textStable = Math.abs(current.textLength - last.textLength) <= tolerance;
            if (heightStable && textStable) {
              stableCount += 1;
            } else {
              stableCount = 0;
            }
            last = current;

            if (stableCount >= checks) {
              resolve({ stable: true, totalChecks, elapsedMs: performance.now() - start, last: current });
              return;
            }

            if (totalChecks >= maxChecks) {
              resolve({ stable: false, totalChecks, elapsedMs: performance.now() - start, last: current });
              return;
            }

            setTimeout(tick, delayMs);
          });
        };

        setTimeout(tick, delayMs);
      });
    }, stability);

    return result;
  } catch (error) {
    return { stable: false, error: String(error?.message || error) };
  }
}

async function waitForReadiness(page, config) {
  const selectorTimeout = Math.min(20000, config.crawl.timeoutMs || 120000);
  const selectors = config.readiness?.selectorCandidates || [];

  const signals = {
    selectorFound: false,
    selector: null,
    fontsSupported: false,
    fontsReady: false,
    stability: { stable: false }
  };

  try {
    const selectorResult = await waitForSelectorCandidate(page, selectors, selectorTimeout);
    signals.selectorFound = selectorResult.found;
    signals.selector = selectorResult.selector;
  } catch (error) {
    signals.selectorError = String(error?.message || error);
  }

  try {
    const fontResult = await waitForFontsReady(page, 5000);
    signals.fontsSupported = fontResult.supported;
    signals.fontsReady = fontResult.ready;
  } catch (error) {
    signals.fontsError = String(error?.message || error);
  }

  try {
    const stability = await waitForStability(page, config.readiness?.stability || { checks: 2, delayMs: 200, tolerance: 10 });
    signals.stability = stability;
  } catch (error) {
    signals.stability = { stable: false, error: String(error?.message || error) };
  }

  return signals;
}

function computeConfidence(signals, missingMainContent, statusOk) {
  let level = "Low";
  const reasons = [];

  if (signals.selectorFound && signals.stability?.stable) {
    level = "High";
  } else if (signals.selectorFound || signals.stability?.stable) {
    level = "Medium";
  }

  if (!signals.selectorFound) {
    reasons.push("selector not found");
  }
  if (!signals.stability?.stable) {
    reasons.push("stability not reached");
  }
  if (signals.fontsSupported && !signals.fontsReady) {
    reasons.push("fonts not ready");
  }

  if (missingMainContent && missingMainContent.startsWith("yes")) {
    reasons.push(missingMainContent);
    if (level === "High") level = "Medium";
    else if (level === "Medium") level = "Low";
  }

  if (!statusOk) {
    level = "Low";
    reasons.push("capture failed");
  }

  if (!reasons.length) {
    reasons.push("all readiness signals achieved");
  }

  return { level, reasons };
}

function downgradeConfidence(level) {
  if (level === "High") return "Medium";
  if (level === "Medium") return "Low";
  return "Low";
}

function analyzeTextSignals(text) {
  const safeText = text || "";
  const lower = safeText.toLowerCase();
  const hasTopBottomTokens = lower.includes("top of page") || lower.includes("bottom of page");
  const placeholderPhrases = [
    "this page is presented as a demonstration",
    "when complete",
    "will expand",
    "coming soon",
    "under construction",
    "continues to develop"
  ];
  const placeholderHits = placeholderPhrases.filter((phrase) => lower.includes(phrase));

  const lines = safeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const counts = new Map();
  for (const line of lines) {
    counts.set(line, (counts.get(line) || 0) + 1);
  }
  const duplicateLines = [];
  let duplicateCount = 0;
  for (const [line, count] of counts.entries()) {
    if (count > 1) {
      duplicateCount += count - 1;
      if (duplicateLines.length < 5) {
        duplicateLines.push(`${line} (x${count})`);
      }
    }
  }
  const duplicateRatio = lines.length ? duplicateCount / lines.length : 0;

  return {
    hasTopBottomTokens,
    placeholderHits,
    duplicateLines,
    duplicateRatio
  };
}

function buildAuditConfidence(baseConfidence, signals, wordCount, statusOk) {
  let level = baseConfidence?.level || "Low";
  const reasons = new Set(baseConfidence?.reasons || []);

  if (!statusOk) {
    level = "Low";
    reasons.add("capture failed");
  }

  if (wordCount < 120) {
    level = downgradeConfidence(level);
    reasons.add("low word count");
  }

  if (signals.hasTopBottomTokens) {
    level = downgradeConfidence(level);
    reasons.add("page chrome tokens present");
  }

  if (signals.placeholderHits.length) {
    level = downgradeConfidence(level);
    reasons.add(`placeholder language: ${signals.placeholderHits.join("; ")}`);
  }

  if (signals.duplicateRatio >= 0.2) {
    level = downgradeConfidence(level);
    reasons.add(`duplicate lines ratio ${signals.duplicateRatio.toFixed(2)}`);
  }

  return { level, reasons: Array.from(reasons) };
}

function summarizePages(list) {
  if (!list.length) return "None.";
  return list.map((item) => item.url).join("; ");
}

function buildAuditReport({ bundleData, results, inputData, startTime, runDir }) {
  const pageAudits = bundleData.map((page) => {
    const signals = analyzeTextSignals(page.text);
    const auditConfidence = buildAuditConfidence(page.confidence, signals, page.wordCount, page.status.ok);
    return {
      ...page,
      auditConfidence,
      signals
    };
  });

  const total = results.length;
  const failed = results.filter((item) => !item.status.ok);
  const succeeded = total - failed.length;

  const high = pageAudits.filter((p) => p.auditConfidence.level === "High");
  const medium = pageAudits.filter((p) => p.auditConfidence.level === "Medium");
  const low = pageAudits.filter((p) => p.auditConfidence.level === "Low");

  const lowWordCount = pageAudits.filter((p) => p.wordCount < 120);
  const noHeadings = pageAudits.filter((p) => p.headingCount === 0);
  const chromeTokens = pageAudits.filter((p) => p.signals.hasTopBottomTokens);
  const placeholders = pageAudits.filter((p) => p.signals.placeholderHits.length);
  const duplicates = pageAudits.filter((p) => p.signals.duplicateRatio >= 0.2);

  let rating = "Institution-safe as-is";
  if (failed.length || low.length || medium.length) {
    rating = "Conditionally usable with caveats";
  }
  if (failed.length / total >= 0.2 || low.length / total >= 0.3) {
    rating = "Not reliable for institutional use";
  }

  const lines = [];
  lines.push("# Snapshot Audit: Student AI Hub");
  lines.push(`Captured: ${startTime.toISOString()}`);
  lines.push(`Input: ${inputData.inputMode} — ${inputData.inputSource}`);
  lines.push(`Run folder: ${path.basename(runDir)}`);
  lines.push("");
  lines.push("## Executive Summary");
  lines.push(`Rating: ${rating}`);
  lines.push(`Total pages: ${total}`);
  lines.push(`Succeeded: ${succeeded}`);
  lines.push(`Failed: ${failed.length}`);
  lines.push(`High confidence pages: ${high.length}`);
  lines.push(`Medium confidence pages: ${medium.length}`);
  lines.push(`Low confidence pages: ${low.length}`);
  lines.push("");
  lines.push("## Axis 1 — Capture Fidelity");
  lines.push(`Pages with page-chrome tokens (\"top of page\"/\"bottom of page\"): ${chromeTokens.length}`);
  lines.push(`Pages with duplicate-line artifacts: ${duplicates.length}`);
  lines.push(`Pages with low word count (<120): ${lowWordCount.length}`);
  lines.push(`Pages with no headings: ${noHeadings.length}`);
  lines.push(`Capture failures: ${failed.length}`);
  if (chromeTokens.length) {
    lines.push(`Pages with chrome tokens: ${summarizePages(chromeTokens)}`);
  }
  if (duplicates.length) {
    lines.push(`Pages with duplicate-line artifacts: ${summarizePages(duplicates)}`);
  }
  if (failed.length) {
    lines.push(`Failed pages: ${summarizePages(failed)}`);
  }
  lines.push("");
  lines.push("## Axis 2 — Coverage & Completeness");
  lines.push(`Input pages: ${total}`);
  lines.push(`Pages with low word count (<120): ${summarizePages(lowWordCount)}`);
  lines.push(`Pages with no headings: ${summarizePages(noHeadings)}`);
  lines.push(`Pages with placeholder language: ${summarizePages(placeholders)}`);
  lines.push("");
  lines.push("## Axis 3 — Verbatim Confidence (Per Page)");
  for (const page of pageAudits) {
    const reasons = page.auditConfidence.reasons.join("; ");
    lines.push(`- ${page.url} — ${page.auditConfidence.level} — ${reasons}`);
  }
  lines.push("");
  lines.push("## Axis 4 — Analytical Usability");
  lines.push(`Safe for content analysis: ${summarizePages(high)}`);
  lines.push(`Use with caution: ${summarizePages(medium)}`);
  lines.push(`Not safe for institutional use: ${summarizePages(low)}`);
  lines.push("");
  lines.push("## Known Limitations & Non-Claims");
  lines.push("This audit uses only the captured artifacts and does not infer live-site content.");
  lines.push("Short or placeholder-like pages may reflect capture artifacts or unfinished content; this audit does not resolve which.");
  lines.push("Visual layout, interactive elements, and embedded media are not evaluated here.");

  return lines.join(\"\\n\");
}

function getBackoffMs(backoffList, attempt) {
  if (!Array.isArray(backoffList) || backoffList.length === 0) return 0;
  return backoffList[Math.min(attempt - 1, backoffList.length - 1)] || 0;
}

async function main() {
  const startTime = new Date();
  const runTimestamp = formatTimestamp(startTime);

  const configRaw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(configRaw);

  const outputBaseDir = path.resolve(__dirname, config.outputBaseDir);
  const runDir = path.join(outputBaseDir, runTimestamp);
  const pagesDir = path.join(runDir, "pages");

  await fs.mkdir(pagesDir, { recursive: true });

  const parser = new XMLParser({ ignoreAttributes: false });
  const inputData = await loadInputEntries(config, parser);
  const sitemapEntries = inputData.entries;

  if (!sitemapEntries.length) {
    throw new Error("No URLs found in input source.");
  }

  if (config.auth?.enabled) {
    throw new Error("Auth is not enabled for this snapshot rig yet.");
  }

  const browser = await chromium.launch({ headless: true });

  const usePerPageHar = Boolean(config.har?.enabled && config.har.mode === "perPage");
  const runHarRel = config.har?.enabled && config.har.mode === "run" ? "run.har" : null;
  const runHarPath = runHarRel ? path.join(runDir, runHarRel) : null;

  let sharedContext = null;
  if (!usePerPageHar) {
    const contextOptions = { userAgent: config.crawl.userAgent };
    if (runHarPath) {
      contextOptions.recordHar = { path: runHarPath, content: config.har?.content || "embed" };
    }
    sharedContext = await browser.newContext(contextOptions);
    sharedContext.setDefaultTimeout(config.crawl.timeoutMs);
    await applyBlocking(sharedContext, config);
  }

  const limit = pLimit(config.crawl.concurrency || 1);
  const slugger = createSlugger();

  const results = new Array(sitemapEntries.length);
  const bundleData = new Array(sitemapEntries.length);

  const maxAttempts = Math.max(1, config.retries?.attempts || 1);

  const tasks = sitemapEntries.map((entry, index) =>
    limit(async () => {
      const url = entry.url;
      const slug = slugger(url);

      const pageDir = path.join(pagesDir, slug);
      await fs.mkdir(pageDir, { recursive: true });

      const htmlRel = path.join("pages", slug, "page.html");
      const textRel = path.join("pages", slug, "page.txt");
      const screenshotRel = path.join("pages", slug, "screenshot.png");
      const metadataRel = path.join("pages", slug, "capture.json");
      const siteContainerRel = path.join("pages", slug, "site_container.html");
      const mhtmlRel = path.join("pages", slug, "page.mhtml");
      const harRel = usePerPageHar ? path.join("pages", slug, "page.har") : runHarRel;

      const record = {
        url,
        slug,
        source: {
          sitemapLastmod: entry.lastmod || null,
          inputMode: inputData.inputMode,
          inputSource: inputData.inputSource
        },
        files: {
          html: htmlRel,
          text: textRel,
          screenshot: screenshotRel,
          metadata: metadataRel,
          siteContainerHtml: siteContainerRel,
          har: harRel || null,
          mhtml: config.mhtml?.enabled ? mhtmlRel : null
        },
        capturedAt: new Date().toISOString(),
        status: { ok: true },
        readiness: null,
        confidence: null,
        network: null,
        attempts: { total: maxAttempts, last: 0 }
      };

      let title = "";
      let finalUrl = "";
      let html = "";
      let text = "";
      let wordCount = 0;
      let headingCount = 0;
      let missingMainContent = "no";
      let readinessSignals = null;
      let confidence = null;
      let captureStatusOk = true;
      let errorMessage = null;
      let requestCount = 0;
      let failedRequests = 0;
      let viewport = null;
      let htmlWritten = false;
      let screenshotWritten = false;
      let textWritten = false;
      let siteContainerWritten = false;
      let mhtmlWritten = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        record.attempts.last = attempt;
        let page = null;
        let context = sharedContext;
        let ownsContext = false;

        if (usePerPageHar) {
          const contextOptions = { userAgent: config.crawl.userAgent };
          if (harRel) {
            contextOptions.recordHar = { path: path.join(runDir, harRel), content: config.har?.content || "embed" };
          }
          context = await browser.newContext(contextOptions);
          context.setDefaultTimeout(config.crawl.timeoutMs);
          await applyBlocking(context, config);
          ownsContext = true;
        }

        try {
          page = await context.newPage();
          viewport = page.viewportSize();

          requestCount = 0;
          failedRequests = 0;
          page.on("request", () => {
            requestCount += 1;
          });
          page.on("requestfailed", () => {
            failedRequests += 1;
          });

          await page.goto(url, {
            waitUntil: config.crawl.waitUntil,
            timeout: config.crawl.timeoutMs
          });

          await sleep(Math.max(0, config.crawl.hydrationWaitMs || 0));

          readinessSignals = await waitForReadiness(page, config);

          html = await page.content();
          await fs.writeFile(path.join(pageDir, "page.html"), html, "utf8");
          htmlWritten = true;

          title = await page.title();
          finalUrl = page.url();

          try {
            const siteContainerHtml = await page.evaluate(() => {
              const el = document.querySelector("#SITE_CONTAINER") ||
                document.querySelector("[data-testid='site-root']") ||
                document.querySelector("main");
              return el ? el.outerHTML : null;
            });
            if (siteContainerHtml) {
              await fs.writeFile(path.join(pageDir, "site_container.html"), siteContainerHtml, "utf8");
              siteContainerWritten = true;
            }
          } catch {
            // Site container is optional.
          }

          if (config.mhtml?.enabled) {
            try {
              const client = await context.newCDPSession(page);
              const snapshot = await client.send("Page.captureSnapshot", { format: "mhtml" });
              await fs.writeFile(path.join(pageDir, "page.mhtml"), snapshot.data, "utf8");
              mhtmlWritten = true;
            } catch {
              // MHTML is optional.
            }
          }

          const extracted = extractText(html, url);
          text = extracted.text;
          wordCount = extracted.wordCount;
          headingCount = extracted.headingCount;
          missingMainContent = extracted.missingMainContent;

          await fs.writeFile(path.join(pageDir, "page.txt"), text, "utf8");
          textWritten = true;

          await page.screenshot({ path: path.join(pageDir, "screenshot.png"), fullPage: true });
          screenshotWritten = true;

          captureStatusOk = true;
          errorMessage = null;
          break;
        } catch (err) {
          captureStatusOk = false;
          errorMessage = String(err?.message || err);

          if (page) {
            try {
              if (!htmlWritten) {
                html = await page.content();
                await fs.writeFile(path.join(pageDir, "page.html"), html, "utf8");
                htmlWritten = true;
              }
            } catch {
              // Best effort.
            }

            try {
              if (!screenshotWritten) {
                await page.screenshot({ path: path.join(pageDir, "screenshot.png"), fullPage: true });
                screenshotWritten = true;
              }
            } catch {
              // Best effort.
            }

            try {
              if (!textWritten && html) {
                const extracted = extractText(html, url);
                text = extracted.text;
                wordCount = extracted.wordCount;
                headingCount = extracted.headingCount;
                missingMainContent = extracted.missingMainContent;
                await fs.writeFile(path.join(pageDir, "page.txt"), text, "utf8");
                textWritten = true;
              }
            } catch {
              // Best effort.
            }

            try {
              if (!siteContainerWritten) {
                const siteContainerHtml = await page.evaluate(() => {
                  const el = document.querySelector("#SITE_CONTAINER") ||
                    document.querySelector("[data-testid='site-root']") ||
                    document.querySelector("main");
                  return el ? el.outerHTML : null;
                });
                if (siteContainerHtml) {
                  await fs.writeFile(path.join(pageDir, "site_container.html"), siteContainerHtml, "utf8");
                  siteContainerWritten = true;
                }
              }
            } catch {
              // Best effort.
            }

            try {
              if (config.mhtml?.enabled && !mhtmlWritten) {
                const client = await context.newCDPSession(page);
                const snapshot = await client.send("Page.captureSnapshot", { format: "mhtml" });
                await fs.writeFile(path.join(pageDir, "page.mhtml"), snapshot.data, "utf8");
                mhtmlWritten = true;
              }
            } catch {
              // Best effort.
            }

            try {
              title = title || (await page.title());
              finalUrl = finalUrl || page.url();
            } catch {
              // Best effort.
            }
          }

          if (attempt < maxAttempts) {
            const backoff = getBackoffMs(config.retries?.backoffMs, attempt);
            if (backoff > 0) {
              await sleep(backoff);
            }
          }
        } finally {
          if (page) {
            await page.close();
          }
          if (ownsContext && context) {
            await context.close();
          }
        }
      }

      if (!readinessSignals) {
        readinessSignals = {
          selectorFound: false,
          selector: null,
          fontsSupported: false,
          fontsReady: false,
          stability: { stable: false }
        };
      }

      if (!htmlWritten && (await fileExists(path.join(runDir, htmlRel)))) {
        htmlWritten = true;
      }
      if (!textWritten && (await fileExists(path.join(runDir, textRel)))) {
        textWritten = true;
      }
      if (!screenshotWritten && (await fileExists(path.join(runDir, screenshotRel)))) {
        screenshotWritten = true;
      }
      if (!siteContainerWritten && (await fileExists(path.join(runDir, siteContainerRel)))) {
        siteContainerWritten = true;
      }
      if (config.mhtml?.enabled && !mhtmlWritten && (await fileExists(path.join(runDir, mhtmlRel)))) {
        mhtmlWritten = true;
      }

      if (!text && missingMainContent === "no") {
        missingMainContent = "yes (no text extracted)";
      }

      confidence = computeConfidence(readinessSignals, missingMainContent, captureStatusOk);

      record.status = captureStatusOk ? { ok: true } : { ok: false, error: errorMessage };
      record.readiness = readinessSignals;
      record.confidence = confidence;
      record.network = {
        requests: requestCount,
        failed: failedRequests,
        har: harRel ? { path: harRel, mode: usePerPageHar ? "perPage" : "run" } : null
      };
      record.finalUrl = finalUrl || url;
      record.title = title || "";
      record.files.html = htmlWritten ? htmlRel : null;
      record.files.text = textWritten ? textRel : null;
      record.files.screenshot = screenshotWritten ? screenshotRel : null;
      record.files.siteContainerHtml = siteContainerWritten ? siteContainerRel : null;
      if (config.mhtml?.enabled) {
        record.files.mhtml = mhtmlWritten ? mhtmlRel : null;
      } else {
        record.files.mhtml = null;
      }

      const metadata = {
        capturedAt: new Date().toISOString(),
        url,
        finalUrl: finalUrl || url,
        title: title || "",
        viewport,
        userAgent: config.crawl.userAgent,
        readiness: readinessSignals,
        confidence: confidence.level,
        attempts: record.attempts
      };

      try {
        await fs.writeFile(path.join(pageDir, "capture.json"), JSON.stringify(metadata, null, 2), "utf8");
      } catch {
        // Metadata is helpful but should not block the run.
      }

      results[index] = record;
      bundleData[index] = {
        url,
        slug,
        title: title || "Untitled",
        text,
        wordCount,
        headingCount,
        missingMainContent,
        status: record.status,
        confidence,
        readiness: readinessSignals,
        files: record.files
      };
    })
  );

  await Promise.all(tasks);
  if (sharedContext) {
    await sharedContext.close();
  }
  await browser.close();

  const indexPath = path.join(runDir, "index.json");
  await fs.writeFile(indexPath, JSON.stringify(results, null, 2), "utf8");

  const bundleLines = [];
  bundleLines.push("# Wix Site Snapshot: Student AI Hub");
  bundleLines.push(`Captured: ${startTime.toISOString()}`);
  bundleLines.push(`Input: ${inputData.inputMode} — ${inputData.inputSource}`);
  if (runHarRel) {
    bundleLines.push(`Run HAR: ${runHarRel}`);
  }
  bundleLines.push("");
  bundleLines.push("## Table of URLs");
  for (const record of results) {
    bundleLines.push(`- ${record.slug} — ${record.url}`);
  }

  for (const pageInfo of bundleData) {
    bundleLines.push("");
    bundleLines.push(`# ${pageInfo.title} — ${pageInfo.url}`);
    bundleLines.push("## Capture Summary");
    bundleLines.push(`- Capture Confidence: ${pageInfo.confidence.level}`);
    bundleLines.push(`- Confidence Reasons: ${pageInfo.confidence.reasons.join("; ")}`);
    bundleLines.push(`- Files: html=${pageInfo.files.html}, text=${pageInfo.files.text}, screenshot=${pageInfo.files.screenshot}`);
    if (pageInfo.files.har) {
      bundleLines.push(`- HAR: ${pageInfo.files.har}`);
    }
    bundleLines.push(`- Metadata: ${pageInfo.files.metadata}`);
    if (pageInfo.files.siteContainerHtml) {
      bundleLines.push(`- Site Container: ${pageInfo.files.siteContainerHtml}`);
    }
    if (pageInfo.files.mhtml) {
      bundleLines.push(`- MHTML: ${pageInfo.files.mhtml}`);
    }

    bundleLines.push("## Extracted Content");

    if (pageInfo.status.ok) {
      if (pageInfo.text) {
        bundleLines.push(pageInfo.text);
      } else {
        bundleLines.push("(no extracted content)");
      }
    } else {
      bundleLines.push(`(capture failed: ${pageInfo.status.error})`);
    }

    bundleLines.push("## Notes");
    bundleLines.push(`- Word count: ${pageInfo.wordCount}`);
    bundleLines.push(`- Heading count: ${pageInfo.headingCount}`);
    bundleLines.push(`- Missing main content: ${pageInfo.missingMainContent}`);
    bundleLines.push(`- Selector found: ${pageInfo.readiness.selectorFound ? pageInfo.readiness.selector : "no"}`);
    bundleLines.push(`- Stability reached: ${pageInfo.readiness.stability?.stable ? "yes" : "no"}`);
    bundleLines.push(`- Fonts ready: ${pageInfo.readiness.fontsSupported ? (pageInfo.readiness.fontsReady ? "yes" : "no") : "unsupported"}`);
    bundleLines.push(`- Capture status: ${pageInfo.status.ok ? "success" : "failure"}`);
    if (!pageInfo.status.ok && pageInfo.status.error) {
      bundleLines.push(`- Error: ${pageInfo.status.error}`);
    }
  }

  const bundlePath = path.join(runDir, "bundle.md");
  await fs.writeFile(bundlePath, bundleLines.join("\n"), "utf8");

  const total = results.length;
  const failed = results.filter((r) => !r.status.ok);
  const succeeded = total - failed.length;

  const mediumLow = results.filter((r) => r.confidence && r.confidence.level !== "High");

  const summaryLines = [];
  summaryLines.push("Wix Site Snapshot Summary");
  summaryLines.push(`Captured: ${startTime.toISOString()}`);
  summaryLines.push(`Total pages: ${total}`);
  summaryLines.push(`Succeeded: ${succeeded}`);
  summaryLines.push(`Failed: ${failed.length}`);
  summaryLines.push(`Output folder: ${runDir}`);

  if (mediumLow.length) {
    summaryLines.push("");
    summaryLines.push("Medium/Low Confidence:");
    for (const item of mediumLow) {
      summaryLines.push(`- ${item.url} :: ${item.confidence.level} :: ${item.confidence.reasons.join("; ")}`);
    }
  }

  if (failed.length) {
    summaryLines.push("");
    summaryLines.push("Failures:");
    for (const item of failed) {
      summaryLines.push(`- ${item.url} :: ${item.status.error || "Unknown error"}`);
    }
  }

  const summaryPath = path.join(runDir, "summary.txt");
  await fs.writeFile(summaryPath, summaryLines.join("\n"), "utf8");

  const auditReport = buildAuditReport({
    bundleData,
    results,
    inputData,
    startTime,
    runDir
  });
  const auditPath = path.join(runDir, "snapshot_audit.md");
  await fs.writeFile(auditPath, auditReport, "utf8");

  console.log(`Snapshot complete: ${runDir}`);
}

main().catch((err) => {
  console.error("Snapshot failed:");
  console.error(String(err?.message || err));
  process.exit(1);
});
