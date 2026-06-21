/**
 * Affiliate configuration per store domain.
 * Add a new entry here to enable affiliate tracking for any additional store.
 *
 * "param" = query parameter name expected by that store's affiliate program
 * "id"    = your affiliate / referral ID for that store
 */
export const AFFILIATE_CONFIG: Record<string, { param: string; id: string }> = {
  "indiegala.com":  { param: "ref",       id: "nzyzndh" },
  "gamebillet.com": { param: "affiliate", id: "c5712e54-9925-4300-bc22-e3c1a586c9ee" },
  // "humblebundle.com": { param: "partner", id: "xxx" },
  // "fanatical.com":    { param: "ref",     id: "xxx" },
  // "gog.com":          { param: "pp",      id: "xxx" },
};

/**
 * Given a real store URL, strips any existing query parameters and appends
 * the correct affiliate param+id for that store.
 * Returns the URL unchanged if no affiliate config exists for that domain.
 */
export function addAffiliateParam(url: string): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    for (const [domain, { param, id }] of Object.entries(AFFILIATE_CONFIG)) {
      if (parsed.hostname.includes(domain)) {
        // Strip all existing query params (may include CheapShark tracking),
        // then add only our affiliate param.
        return `${parsed.origin}${parsed.pathname}?${param}=${id}${parsed.hash}`;
      }
    }
  } catch {
    // relative or malformed URL — return as-is
  }
  return url;
}

/**
 * @deprecated Use addAffiliateParam() instead.
 * Kept for backward-compatibility with callers that pass URLs without
 * stripping existing params first.
 */
export function getAffiliateLink(url: string): string {
  return addAffiliateParam(url);
}
