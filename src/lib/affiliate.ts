/**
 * Store-based affiliate parameter mapping.
 * Add a new entry here to enable affiliate tracking for additional stores.
 */
const STORE_AFFILIATE_PARAMS: Record<string, string> = {
  "indiegala.com": "ref=nzyzndh",
  // "humblebundle.com": "partner=xxx",
  // "fanatical.com":    "ref=xxx",
  // "gog.com":          "pp=xxx",
};

/**
 * Appends the appropriate affiliate query parameter to a store URL.
 * Returns the URL unchanged if no affiliate mapping exists for that domain.
 */
export function getAffiliateLink(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    for (const [domain, param] of Object.entries(STORE_AFFILIATE_PARAMS)) {
      if (parsed.hostname.includes(domain)) {
        const separator = parsed.search ? "&" : "?";
        return `${parsed.origin}${parsed.pathname}${parsed.search}${separator}${param}${parsed.hash}`;
      }
    }
  } catch {
    // relative URL or invalid — return as-is
  }
  return url;
}
