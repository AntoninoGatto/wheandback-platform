import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "../..");
const needles = ["105%", "gratis", "costo zero", "cashback sui tuoi acquisti"];

function filesIn(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      found.push(...filesIn(full));
    } else if (/\.(tsx|ts|json)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      found.push(full);
    }
  }
  return found;
}

test("public copy does not promise the removed benefit", () => {
  const roots = [path.join(appRoot, "src"), path.join(appRoot, "messages")];
  const hits: string[] = [];
  for (const file of roots.flatMap(filesIn)) {
    const text = fs.readFileSync(file, "utf8").toLowerCase();
    for (const needle of needles) {
      if (text.includes(needle)) hits.push(`${path.relative(appRoot, file)} → ${needle}`);
    }
  }
  assert.deepEqual(hits, []);
});
