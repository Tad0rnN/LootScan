import { addAffiliateParam } from "@/lib/affiliate";

export function generateGamebilletSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function buildGamebilletUrl(title: string): string {
  return `https://www.gamebillet.com/${generateGamebilletSlug(title)}`;
}

export function buildGamebilletAffiliateUrl(title: string): string {
  return addAffiliateParam(buildGamebilletUrl(title));
}
