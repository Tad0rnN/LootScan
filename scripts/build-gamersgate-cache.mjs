/**
 * GamersGate URL Cache Builder
 * Usage: node scripts/build-gamersgate-cache.mjs
 *
 * Fetches the GamersGate product sitemap and writes a lookup cache to
 * data/gamersgate-url-cache.json, indexed by normalized game name.
 * Run periodically (e.g. weekly) to keep the cache fresh.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE_PATH = join(ROOT, "data", "gamersgate-url-cache.json");
const SITEMAP_URL = "https://www.gamersgate.com/sitemap/products-en.xml";

// Normalize a slug or title to a common key for lookup
function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Extract the slug from a GamersGate product URL
// e.g. "https://www.gamersgate.com/product/silent-hill-homecoming/" → "silent-hill-homecoming"
function extractSlug(url) {
  const m = url.match(/\/product\/([^/]+)\//);
  return m ? m[1] : null;
}

async function main() {
  console.log("Fetching GamersGate product sitemap...");
  const res = await fetch(SITEMAP_URL, {
    headers: { "User-Agent": "LootScan/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();

  const urls = [...xml.matchAll(/<loc>(https:\/\/www\.gamersgate\.com\/product\/[^<]+)<\/loc>/g)];
  console.log(`Found ${urls.length} product URLs.`);

  const byName = {};

  for (const [, url] of urls) {
    const slug = extractSlug(url);
    if (!slug) continue;
    // Store base URL without trailing slash variant issues
    const baseUrl = `https://www.gamersgate.com/product/${slug}/`;
    // Index by normalized slug (which is roughly the normalized title)
    byName[normalize(slug)] = baseUrl;
  }

  const cache = {
    lastUpdated: new Date().toISOString(),
    totalProducts: urls.length,
    byName,
  };

  mkdirSync(join(ROOT, "data"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");

  console.log(`\n✅ Cache written to data/gamersgate-url-cache.json`);
  console.log(`   Total products: ${urls.length}`);
  console.log(`   By name: ${Object.keys(byName).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
