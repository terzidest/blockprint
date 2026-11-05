// tsc's rewriteRelativeImportExtensions rewrites JS emit but not declaration
// files, so dist *.d.ts would ship ./x.ts specifiers. Rewrite them to .js.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dir = new URL("../dist/", import.meta.url);
for (const file of readdirSync(dir)) {
  if (!file.endsWith(".d.ts")) continue;
  const path = new URL(file, dir);
  const source = readFileSync(path, "utf8");
  const fixed = source
    .replace(/(from\s+")(\.\.?\/[^"]+)\.tsx?(")/g, "$1$2.js$3")
    .replace(/(import\(")(\.\.?\/[^"]+)\.tsx?("\))/g, "$1$2.js$3");
  if (fixed !== source) writeFileSync(path, fixed);
}
