// Run from the repo root: node scripts/screenshots.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("docs", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
});

await page.goto("https://blockprint.terzidest.com", { waitUntil: "networkidle" });

// Split view with hover-sync active: hover the hero's config entry so the
// panel entry rings and the rendered hero gets its outline + chip.
await page.locator("pre").first().hover();
await page.waitForTimeout(600);
await page.screenshot({ path: "docs/split-view.png" });

// Broken config tab, framed on the unknown-type fallback card.
await page.getByRole("tab", { name: "Broken config" }).click();
await page.waitForTimeout(400);
await page
  .getByText('Unknown block type: "categoryGrd"')
  .scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: "docs/broken-config.png" });

await browser.close();
console.log("done");
