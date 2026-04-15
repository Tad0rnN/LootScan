import { track } from "@vercel/analytics";

type AnalyticsValue = string | number | boolean | null | undefined;

type EventProperties = Record<string, AnalyticsValue>;

function sendEvent(name: "deal_click" | "affiliate_click", properties: EventProperties) {
  try {
    track(name, properties);
  } catch {
    // Never block navigation because analytics failed.
  }
}

export function trackDealClick(properties: EventProperties) {
  sendEvent("deal_click", properties);
}

export function trackAffiliateClick(properties: EventProperties) {
  sendEvent("affiliate_click", properties);
}
