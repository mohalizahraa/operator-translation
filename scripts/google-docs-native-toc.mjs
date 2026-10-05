#!/usr/bin/env node

import { chromium } from "playwright";

const docUrl = process.env.DOC_URL;
const contentsLabel = process.env.CONTENTS_LABEL || "Contents";
const tocVariant = process.env.TOC_VARIANT || "dots-page-numbers";
const tocAction = process.env.TOC_ACTION;

if (!docUrl) {
  console.error("DOC_URL is required");
  process.exit(2);
}
if (!/^https:\/\/docs\.google\.com\/document\/d\/[A-Za-z0-9_-]+\//.test(docUrl)) {
  console.error("DOC_URL must be a native Google Docs document URL");
  process.exit(2);
}
if (!["insert", "refresh"].includes(tocAction)) {
  console.error("TOC_ACTION must be insert or refresh");
  process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clickIfVisible(locator, timeout = 1200) {
  try {
    if (await locator.isVisible({ timeout })) {
      await locator.click();
      return true;
    }
  } catch {}
  return false;
}

async function textDump(page, label) {
  try {
    const items = await page.locator('[role="menuitem"], [role="option"], [aria-label]').evaluateAll((nodes) =>
      nodes.slice(0, 500).map((n) => ({
        role: n.getAttribute("role"),
        aria: n.getAttribute("aria-label"),
        title: n.getAttribute("title"),
        text: (n.textContent || "").trim().replace(/\s+/g, " ").slice(0, 180),
      })).filter((x) => x.text || x.aria || x.title)
    );
    console.log("UI_DUMP " + label + ": " + JSON.stringify(items));
  } catch (err) {
    console.log("UI_DUMP_FAILED " + label + ": " + (err?.message || err));
  }
}

async function focusEditor(page) {
  for (const label of ["Got it", "No thanks", "Dismiss", "Close"]) {
    await clickIfVisible(page.getByRole("button", { name: label, exact: true }));
  }

  const editorCandidates = [
    page.locator(".kix-appview-editor"),
    page.locator(".kix-page-paginated"),
    page.locator('[role="textbox"]'),
  ];
  for (const loc of editorCandidates) {
    try {
      if (await loc.first().isVisible({ timeout: 2500 })) {
        await loc.first().click({ position: { x: 160, y: 180 } });
        return;
      }
    } catch {}
  }

  const viewport = page.viewportSize() || { width: 1280, height: 900 };
  await page.mouse.click(Math.floor(viewport.width * 0.55), Math.floor(viewport.height * 0.45));
}

async function findInDocument(page, query) {
  await focusEditor(page);
  await page.keyboard.press("Meta+f");
  await sleep(300);
  await page.keyboard.type(query, { delay: 25 });
  await sleep(700);
  // Google Docs selects the first match immediately. Do not press Enter here: that
  // advances to the second match, which can move from the TOC entry to the body heading.
  const closeFind = page.getByLabel("Close", { exact: true }).first();
  if (await closeFind.isVisible({ timeout: 1200 }).catch(() => false)) {
    await closeFind.click();
  } else {
    await page.keyboard.press("Escape");
  }
  await sleep(500);
}

async function refreshNativeToc(page) {
  // The first Introduction match is inside the TOC because the TOC precedes body headings.
  await findInDocument(page, "Introduction");
  await page.keyboard.press("ArrowRight");
  await sleep(700);

  const selectors = [
    page.getByLabel(/(?:Refresh|Update) table of contents/i).last(),
    page.getByLabel(/^(?:Refresh|Update)$/i).last(),
    page.locator('[aria-label*="Refresh" i][aria-label*="table" i]').last(),
    page.locator('[aria-label*="Update" i][aria-label*="table" i]').last(),
    page.locator('[data-tooltip*="Refresh" i][data-tooltip*="table" i]').last(),
    page.locator('[data-tooltip*="Update" i][data-tooltip*="table" i]').last(),
    page.locator('[title*="Refresh" i][title*="table" i]').last(),
    page.locator('[title*="Update" i][title*="table" i]').last(),
  ];

  for (const loc of selectors) {
    if (await loc.isVisible({ timeout: 1400 }).catch(() => false)) {
      await loc.click();
      console.log("NATIVE_TOC_REFRESH_CLICKED");
      return;
    }
  }

  await textDump(page, "refresh-control-missing");
  throw new Error("Could not find the native Google Docs TOC refresh control");
}

async function insertNativeToc(page) {
  await findInDocument(page, contentsLabel);

  // Collapse at the end of the Contents label and create the insertion paragraph.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await sleep(500);

  const insertMenu = page.locator("#docs-insert-menu");
  if (await insertMenu.isVisible({ timeout: 4000 })) {
    await insertMenu.click();
  } else {
    const insertText = page.getByText("Insert", { exact: true }).first();
    if (!(await insertText.isVisible({ timeout: 3000 }))) {
      await textDump(page, "no-insert-menu");
      throw new Error("Could not find Google Docs Insert menu");
    }
    await insertText.click();
  }

  await sleep(500);

  const pageElements = page.getByText("Page elements", { exact: true }).last();
  if (await pageElements.isVisible({ timeout: 1200 }).catch(() => false)) {
    await pageElements.hover();
    await sleep(500);
  }

  let tocMenu = page.getByText("Table of contents", { exact: true }).last();
  if (!(await tocMenu.isVisible({ timeout: 2500 }).catch(() => false))) {
    tocMenu = page.getByText(/Table of contents/i).last();
  }
  if (!(await tocMenu.isVisible({ timeout: 2500 }).catch(() => false))) {
    await textDump(page, "toc-menu-missing");
    throw new Error("Could not find Table of contents menu item");
  }

  await tocMenu.hover();
  await sleep(700);

  const candidates = tocVariant === "page-numbers"
    ? [/page numbers/i, /numbers/i]
    : tocVariant === "links"
      ? [/links/i, /hyperlink/i]
      : [/dotted/i, /dots/i, /page numbers/i, /numbers/i];

  for (const pattern of candidates) {
    const labeled = page.getByLabel(pattern).last();
    if (await labeled.isVisible({ timeout: 900 }).catch(() => false)) {
      await labeled.click();
      return;
    }
    const txt = page.getByText(pattern).last();
    if (await txt.isVisible({ timeout: 900 }).catch(() => false)) {
      await txt.click();
      return;
    }
  }

  const visible = page.locator('[role="menuitem"]:visible, [role="option"]:visible');
  const count = await visible.count();
  const choices = [];
  for (let i = 0; i < count; i++) {
    const item = visible.nth(i);
    const aria = await item.getAttribute("aria-label");
    const txt = ((await item.textContent()) || "").trim().replace(/\s+/g, " ");
    if (/table of contents|page numer|dot|link/i.test((aria || "") + " " + txt)) {
      choices.push({ i, aria, txt });
    }
  }
  console.log("TOC_VISIBLE_CHOICES=" + JSON.stringify(choices));

  const buttons = page.locator('[role="menuitem"]:visible, [role="button"]:visible, [tabindex="0"]:visible');
  const bn = await buttons.count();
  const cardIndexes = [];
  for (let i = 0; i < bn; i++) {
    const node = buttons.nth(i);
    const aria = (await node.getAttribute("aria-label")) || "";
    const title = (await node.getAttribute("title")) || "";
    if (/table of contents|page number|dot|link/i.test(aria + " " + title)) cardIndexes.push(i);
  }
  if (cardIndexes.length) {
    const chosen = cardIndexes[Math.min(1, cardIndexes.length - 1)];
    await buttons.nth(chosen).click();
    return;
  }

  await textDump(page, "toc-format-missing");
  throw new Error("Table of contents submenu opened, but no native TOC format control was identifiable");
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: "en-US",
});
const page = await context.newPage();

try {
  console.log("Opening Google Doc");
  await page.goto(docUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(8000);
  console.log("PAGE_TITLE=" + await page.title());

  if (/sign in/i.test(await page.title()) && /accounts\.google\.com/.test(page.url())) {
    throw new Error("Document unexpectedly requires sign-in; anonymous editor access is not active");
  }

  if (tocAction === "refresh") {
    await refreshNativeToc(page);
  } else if (tocAction === "insert") {
    await insertNativeToc(page);
  } else {
    throw new Error("Unsupported TOC_ACTION: " + tocAction);
  }

  await page.waitForTimeout(7000);
  console.log("NATIVE_TOC_UI_" + tocAction.toUpperCase() + "_ATTEMPT_COMPLETED");
} catch (err) {
  console.error("NATIVE_TOC_UI_ACTION_FAILED", err?.stack || err);
  await textDump(page, "failure");
  process.exitCode = 1;
} finally {
  await browser.close();
}
