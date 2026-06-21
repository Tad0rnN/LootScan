/**
 * Gamebillet URL Validation Script
 * Usage: node scripts/validate-gamebillet.mjs
 *
 * Fetches active Gamebillet deals from CheapShark, generates slugs,
 * validates each URL via HEAD request, and writes results to
 * data/gamebillet-url-cache.json.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE_PATH = join(ROOT, "data", "gamebillet-url-cache.json");
const CHEAPSHARK_API = "https://www.cheapshark.com/api/1.0";
const GAMEBILLET_STORE_ID = "23";
const AFFILIATE_PARAM = "affiliate=c5712e54-9925-4300-bc22-e3c1a586c9ee";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function validateUrl(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: BROWSER_HEADERS,
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    if (res.status === 200) return "valid";
    if (res.status === 404) return "invalid";
    if (res.status === 301 || res.status === 302) return "redirect";
    return `blocked_${res.status}`;
  } catch (e) {
    return `error_${e.message?.slice(0, 30)}`;
  }
}

async function fetchWithRetry(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 LootScan/1.0" } });
    if (res.status === 429) {
      const wait = 10000 * (i + 1);
      console.log(`  Rate limited, waiting ${wait/1000}s...`);
      await sleep(wait);
      continue;
    }
    return res;
  }
  throw new Error("Max retries exceeded");
}

async function fetchAllGamebilletDeals() {
  const titles = new Set();
  let page = 0;
  while (true) {
    const url = `${CHEAPSHARK_API}/deals?storeID=${GAMEBILLET_STORE_ID}&pageSize=60&pageNumber=${page}`;
    const res = await fetchWithRetry(url);
    const text = await res.text();
    let deals;
    try { deals = JSON.parse(text); } catch { console.error("Parse error:", text.slice(0, 100)); break; }
    if (!Array.isArray(deals) || deals.length === 0) break;
    for (const d of deals) titles.add(d.title);
    if (deals.length < 60) break;
    page++;
    await sleep(1000);
  }
  return [...titles];
}

function loadCache() {
  if (existsSync(CACHE_PATH)) {
    try { return JSON.parse(readFileSync(CACHE_PATH, "utf8")); } catch {}
  }
  return { lastUpdated: null, results: {}, unmatched: [] };
}

function saveCache(cache) {
  mkdirSync(join(ROOT, "data"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

async function main() {
  console.log("Fetching Gamebillet deals from CheapShark...");
  const titles = await fetchAllGamebilletDeals();
  console.log(`Found ${titles.length} unique game titles.\n`);

  const cache = loadCache();
  const results = cache.results ?? {};
  const unmatched = [];

  let valid = 0, invalid = 0, blocked = 0, skipped = 0;

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const slug = generateSlug(title);
    const url = `https://www.gamebillet.com/${slug}`;
    const affiliateUrl = `${url}?${AFFILIATE_PARAM}`;

    // Skip if already cached
    if (results[title]?.status === "valid" || results[title]?.status === "invalid") {
      skipped++;
      if (results[title].status === "valid") valid++;
      else invalid++;
      process.stdout.write(`[${i + 1}/${titles.length}] SKIP  ${title}\n`);
      continue;
    }

    process.stdout.write(`[${i + 1}/${titles.length}] CHK   ${url} ... `);
    const status = await validateUrl(url);
    console.log(status);

    results[title] = {
      slug,
      url: affiliateUrl,
      status,
      checkedAt: new Date().toISOString(),
    };

    if (status === "valid") valid++;
    else if (status === "invalid") { invalid++; unmatched.push(title); }
    else blocked++;

    // Rate limiting: 200-500ms between requests
    await sleep(200 + Math.random() * 300);
  }

  cache.lastUpdated = new Date().toISOString();
  cache.results = results;
  cache.unmatched = [
    ...(cache.unmatched ?? []),
    ...unmatched.filter((t) => !cache.unmatched?.includes(t)),
  ];
  saveCache(cache);

  console.log("\n=== RESULTS ===");
  console.log(`Total:    ${titles.length}`);
  console.log(`Valid:    ${valid}   ✅`);
  console.log(`Invalid:  ${invalid}  ❌`);
  console.log(`Blocked:  ${blocked}  ⚠️ (Cloudflare — treat as unknown)`);
  console.log(`Skipped:  ${skipped}  (already cached)`);
  console.log(`\nCache written to: data/gamebillet-url-cache.json`);

  if (unmatched.length > 0) {
    console.log("\n=== UNMATCHED GAMES ===");
    unmatched.forEach((t) => console.log("  -", t));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
