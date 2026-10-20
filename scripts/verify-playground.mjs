// Run from the repo root: node scripts/verify-playground.mjs <url>
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://localhost:3199";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto(url, { waitUntil: "networkidle" });

const results = [];
const check = (name, ok) => results.push(`${ok ? "✅" : "❌"} ${name}`);

// 0. "What is this?" overlay: opens, dispatches to Broken config, closes
await page.getByRole("button", { name: "What is this?" }).click();
check(
  "overlay opens with plain-words explainer",
  await page.getByText("rearrange those blocks").isVisible(),
);
await page.getByRole("button", { name: /safety net/ }).click();
check(
  "safety-net link switches to Broken config tab",
  await page.getByText("Two entries are corrupt").isVisible(),
);
check(
  "overlay closed after dispatch",
  !(await page.getByText("rearrange those blocks").isVisible()),
);
await page.getByRole("tab", { name: "Commerce" }).click();

// 1. Enter edit mode
await page.getByRole("button", { name: "Edit" }).click();
const textarea = page.getByLabel("Editable page config JSON");
check("edit mode shows textarea", await textarea.isVisible());

// 2. Typo a block type → live re-render routes it to the fallback
const original = await textarea.inputValue();
await textarea.fill(original.replace('"type": "hero"', '"type": "herro"'));
await page.waitForTimeout(700);
check(
  "typo'd type renders fallback card",
  await page.getByText('Unknown block type: "herro"').isVisible(),
);

// 3. Invalid JSON → error bar, last valid config keeps rendering
await textarea.fill(original.slice(0, -2));
await page.waitForTimeout(700);
check(
  "invalid JSON shows error bar",
  await page.getByText("showing the last valid config").isVisible(),
);
check(
  "last valid config still rendered (herro fallback persists)",
  await page.getByText('Unknown block type: "herro"').isVisible(),
);

// 4. Reset returns to the pristine preset
await page.getByRole("button", { name: "Reset" }).click();
await page.waitForTimeout(700);
check(
  "reset restores hero block",
  await page.getByRole("heading", { name: "Gear that carries its weight" }).isVisible(),
);
check(
  "reset clears fallback",
  !(await page.getByText('Unknown block type: "herro"').isVisible()),
);

// 5. Done returns to read-only panel with hover-sync entries
await page.getByRole("button", { name: "Done" }).click();
check(
  "view mode restores entry list",
  (await page.locator("pre").count()) > 0,
);

// 6. Reorder arrows in view mode: move the hero down, preview follows
const firstBlockBefore = await page
  .locator(".preview-surface > div")
  .first()
  .textContent();
await page.getByLabel("Move block down").first().click();
await page.waitForTimeout(300);
const firstBlockAfter = await page
  .locator(".preview-surface > div")
  .first()
  .textContent();
check(
  "arrow reorders the rendered page (categoryGrid now first)",
  firstBlockBefore !== firstBlockAfter && firstBlockAfter.includes("Packs"),
);
check(
  "config panel order follows",
  (await page.locator("pre").first().textContent()).includes("categoryGrid"),
);
await page.getByRole("button", { name: "Reset" }).click();
await page.waitForTimeout(300);
check(
  "reset restores original order",
  (
    await page.locator(".preview-surface > div").first().textContent()
  ).includes("Gear that carries its weight"),
);

await browser.close();
console.log(results.join("\n"));
if (results.some((line) => line.startsWith("❌"))) process.exit(1);
