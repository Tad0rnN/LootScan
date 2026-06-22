/**
 * Gamesplanet URL Cache Builder
 * Usage: node scripts/build-gamesplanet-cache.mjs
 *
 * Fetches the Gamesplanet product feed and writes a lookup cache to
 * data/gamesplanet-url-cache.json, indexed by steamAppId and normalized name.
 * Run this periodically (e.g. weekly) to keep the cache fresh.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE_PATH = join(ROOT, "data", "gamesplanet-url-cache.json");
const FEED_URL = "https://us.gamesplanet.com/api/v1/products/feed.xml?ref=lootscan";

function normalize(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "s"));
  return m ? m[1].trim() : "";
}

async function main() {
  console.log("Fetching Gamesplanet product feed...");
  const res = await fetch(FEED_URL, {
    headers: { "User-Agent": "LootScan/1.0" },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
  const xml = await res.text();

  const products = [...xml.matchAll(/<product>([\s\S]*?)<\/product>/g)];
  console.log(`Parsing ${products.length} products...`);

  const bySteamAppId = {};
  const byName = {};
  let steamCount = 0;

  for (const [, block] of products) {
    const name  = extractTag(block, "name");
    const link  = extractTag(block, "link").split("?")[0]; // store base URL, ref added at runtime
    const steam = extractTag(block, "steam_id").replace("app/", "");

    if (!link) continue;

    if (steam) {
      bySteamAppId[steam] = link;
      steamCount++;
    }
    byName[normalize(name)] = link;
  }

  const cache = {
    lastUpdated: new Date().toISOString(),
    totalProducts: products.length,
    withSteamId: steamCount,
    bySteamAppId,
    byName,
  };

  mkdirSync(join(ROOT, "data"), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");

  console.log(`\n✅ Cache written to data/gamesplanet-url-cache.json`);
  console.log(`   Total: ${products.length} products`);
  console.log(`   By steamAppId: ${steamCount}`);
  console.log(`   By name: ${Object.keys(byName).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
