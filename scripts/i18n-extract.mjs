/**
 * scripts/i18n-extract.mjs
 *
 * PHASE 5 — inventories hardcoded UI strings across the client (or admin) src
 * tree and emits a report + a candidate key map to drive the extraction work.
 *
 * It flags user-visible string literals in JSX:
 *   - text between tags:            <button>Add to Cart</button>
 *   - common string-valued props:   placeholder="Search", title="Close", alt=…
 *   - aria-label, label
 *
 * It deliberately ignores: className, style, keys, imports, URLs, single words
 * that are likely identifiers, and files already fully migrated.
 *
 * Usage:
 *   node scripts/i18n-extract.mjs [srcDir=src] [--json out.json]
 *
 * Output: a summary table (file → count) and, with --json, a machine-readable
 * inventory { file, line, text, suggestedKey } for bulk processing.
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const srcDir = args.find((a) => !a.startsWith("--")) || "src";
const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;

const TEXT_PROPS = ["placeholder", "title", "alt", "aria-label", "label"];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", "dist", ".git", "i18n"].includes(entry.name)) continue;
      walk(full, acc);
    } else if (/\.(jsx|tsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

// Heuristic: is this a user-visible phrase (vs an identifier/class/url)?
function isUserVisible(text) {
  const s = text.trim();
  if (s.length < 2) return false;
  if (/^[a-z0-9_-]+$/.test(s)) return false;         // single token / identifier
  if (/^https?:\/\//.test(s)) return false;          // URL
  if (/^[#./]/.test(s)) return false;                // path/anchor/selector
  if (/^\d+$/.test(s)) return false;                 // number
  if (!/[a-zA-Z]/.test(s)) return false;             // no letters
  if (/^[A-Z_]+$/.test(s) && s.length < 4) return false; // short CONST
  if (/[{}<>]/.test(s)) return false;                // contains markup/expr
  // must contain a letter and either a space or be a real word ≥3 chars
  return /\s/.test(s) || s.length >= 3;
}

function suggestKey(file, text) {
  const base = path
    .basename(file)
    .replace(/\.(jsx|tsx)$/, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .split("_")
    .slice(0, 5)
    .join("_");
  return `${base}.${slug}`;
}

const files = walk(srcDir);
const inventory = [];
const perFile = {};

for (const file of files) {
  const lines = fs.readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    // Skip obvious non-UI lines.
    if (/className|import |require\(|console\.|\/\//.test(line)) return;

    // 1. Text between JSX tags: >Some Text<
    const tagText = [...line.matchAll(/>\s*([A-Za-z][^<>{}]{1,80}?)\s*</g)];
    for (const m of tagText) {
      const text = m[1];
      if (isUserVisible(text)) {
        inventory.push({ file, line: i + 1, text: text.trim(), suggestedKey: suggestKey(file, text) });
        perFile[file] = (perFile[file] || 0) + 1;
      }
    }

    // 2. Text-valued props.
    for (const prop of TEXT_PROPS) {
      const re = new RegExp(`${prop}\\s*=\\s*["']([^"'{}]{2,80})["']`, "g");
      for (const m of [...line.matchAll(re)]) {
        const text = m[1];
        if (isUserVisible(text)) {
          inventory.push({ file, line: i + 1, text: text.trim(), suggestedKey: suggestKey(file, text) });
          perFile[file] = (perFile[file] || 0) + 1;
        }
      }
    }
  });
}

// Report
const sorted = Object.entries(perFile).sort((a, b) => b[1] - a[1]);
console.log(`\ni18n EXTRACTION INVENTORY — ${srcDir}\n${"─".repeat(60)}`);
console.log(`Files scanned: ${files.length}`);
console.log(`Files with hardcoded strings: ${sorted.length}`);
console.log(`Total hardcoded strings: ${inventory.length}\n`);
console.log("Top files:");
for (const [file, n] of sorted.slice(0, 25)) {
  console.log(`  ${String(n).padStart(4)}  ${path.relative(srcDir, file)}`);
}

if (jsonOut) {
  fs.writeFileSync(jsonOut, JSON.stringify(inventory, null, 2));
  console.log(`\nFull inventory written to ${jsonOut}`);
}

// Exit non-zero if used as a CI guard with a threshold.
const threshold = args.includes("--max") ? Number(args[args.indexOf("--max") + 1]) : null;
if (threshold != null && inventory.length > threshold) {
  console.error(`\n✗ ${inventory.length} hardcoded strings exceed threshold ${threshold}`);
  process.exit(1);
}
