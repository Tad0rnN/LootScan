/** Normalizes a game title for cross-source matching (lowercase, alnum only). */
export function normalizeGameTitle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}
