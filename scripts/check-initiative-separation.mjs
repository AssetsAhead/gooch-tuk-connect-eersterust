#!/usr/bin/env node
/**
 * Scans src/ for files that mix Taxi-app branding with MTN-initiative
 * phrasing. Exits non-zero on violation so it can run in CI.
 *
 *   node scripts/check-initiative-separation.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const TAXI = [
  "MojaRide", "Moja Ride", "PoortLink", "Poort Link",
  "TukConnect", "Tuk Connect", "MobilityOne", "Mobility One",
];
const MTN = [
  "MTN initiative", "MTN partnership", "MTN deal", "MTN due diligence",
  "MTN evaluation", "MTN pilot", "MTN engagement", "MTN proposal",
  "MTN sponsorship", "MTN consolidation", "MTN funding", "MTN investment",
  "MTN program", "MTN programme", "MTN project",
];

const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx", ".html"]);
const SKIP = new Set(["node_modules", "dist", "build", ".git", ".next", ".vite"]);
const SELF = "scripts/check-initiative-separation.mjs";
const GUARD = "src/lib/initiativeGuard.ts";
const GUARD_UI = "src/components/dev/InitiativeSeparationGuard.tsx";

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else if (EXTS.has(extname(p))) yield p;
  }
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hits = (text, list) =>
  list.filter((n) => new RegExp(`\\b${escape(n)}\\b`, "i").test(text));

const violations = [];
for (const root of ["src", "remotion/src"]) {
  try { statSync(root); } catch { continue; }
  for (const file of walk(root)) {
    if (file.endsWith(SELF) || file.endsWith(GUARD) || file.endsWith(GUARD_UI)) continue;
    const text = readFileSync(file, "utf8");
    const t = hits(text, TAXI);
    const m = hits(text, MTN);
    if (t.length && m.length) violations.push({ file, taxi: t, mtn: m });
  }
}

if (violations.length === 0) {
  console.log("✓ initiative-separation: clean");
  process.exit(0);
}

console.error("✗ initiative-separation: mixed branding in", violations.length, "file(s):\n");
for (const v of violations) {
  console.error(`  ${v.file}`);
  console.error(`    taxi: ${v.taxi.join(", ")}`);
  console.error(`    mtn : ${v.mtn.join(", ")}`);
}
console.error("\nSee mem://constraints/mtn-initiative-separation");
process.exit(1);
