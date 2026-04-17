import { Resend } from "resend";
import type { Deal } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const NEWSLETTER_FROM = process.env.NEWSLETTER_FROM_EMAIL ?? "LootScan <newsletter@lootscan.app>";

interface SaleAlertParams {
  to: string;
  locale?: string;
  gameTitle: string;
  gameThumb: string;
  gameID: string;
  normalPrice: string;
  salePrice: string;
  savings: number;
  dealID: string;
}

interface NewsletterEmailParams {
  to: string;
  locale?: string;
  unsubscribeToken: string;
}

interface TopDealsNewsletterParams extends NewsletterEmailParams {
  deals: Deal[];
}

function normalizeLocale(locale?: string): "tr" | "en" {
  return locale?.toLowerCase().startsWith("tr") ? "tr" : "en";
}

function getEmailCopy(locale?: string) {
  const normalized = normalizeLocale(locale);

  if (normalized === "tr") {
    return {
      saleAlertBadge: "Indirime Girdi!",
      saleAlertSubject: (gameTitle: string, savings: number) => `🔥 ${gameTitle} indirime girdi! -%${savings}`,
      saleAlertPrimaryCta: "Firsata Git →",
      saleAlertSecondaryCta: "Tum Magazalari Karsilastir",
      saleAlertFooter: "Bu maili LootScan istek listene ekledigin icin aldin.",
      saleAlertManageWishlist: "Istek listeni yonet",
      welcomeEyebrow: "Haftalik bulten",
      welcomeTitle: "Haftanin En Iyi 10 Firsati listesine katildin.",
      welcomeIntro: "Her hafta sana en degerli PC oyun firsatlarini kisa ve temiz bir ozetle gonderecegiz. Gereksiz mail yok, gunluk spam yok.",
      welcomeBody: "Buyuk indirimleri, dikkat ceken AAA secimleri, indie cevherlerini ve gercekten tiklamaya degen firsatlari bekle.",
      welcomeCta: "LootScan'i Ac",
      welcomeFooter: "LootScan bultenine abone oldun.",
      unsubscribe: "Istegin zaman ayril",
      welcomeSubject: "Haftanin En Iyi 10 Firsati bultenine hos geldin",
      weeklyEyebrow: "LootScan haftalik",
      weeklyTitle: "Haftanin En Iyi 10 Firsati",
      weeklyIntro: "Bu hafta buldugumuz en guclu oyun firsatlari, tek mailde.",
      weeklyRankLabel: (index: number) => `#${index + 1} bu hafta`,
      weeklyCta: "Firsati Ac",
      weeklyMore: "LootScan'de daha fazla firsat gor",
      weeklyFooter: "Bu maili LootScan bultenine abone oldugun icin aldin.",
      weeklySubject: "Haftanin En Iyi 10 Firsati",
    };
  }

  return {
    saleAlertBadge: "On Sale Now!",
    saleAlertSubject: (gameTitle: string, savings: number) => `🔥 ${gameTitle} is on sale! -${savings}%`,
    saleAlertPrimaryCta: "Open Deal →",
    saleAlertSecondaryCta: "Compare All Stores",
    saleAlertFooter: "You received this email because this game is in your LootScan wishlist.",
    saleAlertManageWishlist: "Manage your wishlist",
    welcomeEyebrow: "Weekly newsletter",
    welcomeTitle: "You are in for the Top 10 Best Deals of the Week.",
    welcomeIntro: "Every week we will send a short roundup with the most worthwhile PC game deals we can find. No noise, no daily spam.",
    welcomeBody: "Expect the biggest discounts, standout AAA picks, indie gems, and the strongest value deals worth clicking.",
    welcomeCta: "Open LootScan",
    welcomeFooter: "You subscribed on LootScan.",
    unsubscribe: "Unsubscribe anytime",
    welcomeSubject: "Welcome to Top 10 Best Deals of the Week",
    weeklyEyebrow: "LootScan weekly",
    weeklyTitle: "Top 10 Best Deals of the Week",
    weeklyIntro: "The strongest game deals we found this week, ready to click.",
    weeklyRankLabel: (index: number) => `#${index + 1} this week`,
    weeklyCta: "Open deal",
    weeklyMore: "Browse more deals on LootScan",
    weeklyFooter: "You received this email because you subscribed to the LootScan newsletter.",
    weeklySubject: "Top 10 Best Deals of the Week",
  };
}

function getUnsubscribeUrl(token: string, locale = "en") {
  return `${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}&locale=${encodeURIComponent(locale)}`;
}

function getNewsletterLink(locale = "en") {
  return `${SITE_URL}/${locale}`;
}

export async function sendSaleAlert({
  to,
  locale = "en",
  gameTitle,
  gameThumb,
  gameID,
  normalPrice,
  salePrice,
  savings,
  dealID,
}: SaleAlertParams) {
  const copy = getEmailCopy(locale);
  const dealUrl = `https://www.cheapshark.com/redirect?dealID=${dealID}`;
  const normalizedLocale = normalizeLocale(locale);
  const gameUrl = `${SITE_URL}/${normalizedLocale}/game/${gameID}`;
  const wishlistUrl = `${SITE_URL}/${normalizedLocale}/wishlist`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <div style="width:32px;height:32px;background:#22c55e;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:16px;">⊕</span>
        </div>
        <span style="font-size:20px;font-weight:700;color:white;">Loot<span style="color:#4ade80;">Scan</span></span>
      </div>
    </div>

    <!-- Card -->
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.06);border-radius:20px;overflow:hidden;">

      <!-- Game thumbnail -->
      <img src="${gameThumb}" alt="${gameTitle}" style="width:100%;height:180px;object-fit:cover;display:block;" />

      <div style="padding:24px;">
        <!-- Badge -->
        <div style="display:inline-block;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#4ade80;font-size:11px;font-weight:700;padding:4px 10px;border-radius:8px;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;">
          🔥 ${copy.saleAlertBadge}
        </div>

        <h2 style="color:white;font-size:20px;font-weight:700;margin:0 0 16px;line-height:1.3;">
          ${gameTitle}
        </h2>

        <!-- Price -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
          <span style="color:#4ade80;font-size:28px;font-weight:800;">${salePrice === "0.00" ? "FREE" : `$${parseFloat(salePrice).toFixed(2)}`}</span>
          <span style="color:#475569;font-size:16px;text-decoration:line-through;">$${parseFloat(normalPrice).toFixed(2)}</span>
          <span style="background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3);font-size:13px;font-weight:700;padding:3px 8px;border-radius:6px;">
            -%${savings}
          </span>
        </div>

        <!-- CTA -->
        <a href="${dealUrl}" style="display:block;background:#22c55e;color:white;text-align:center;padding:14px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;margin-bottom:12px;">
          ${copy.saleAlertPrimaryCta}
        </a>
        <a href="${gameUrl}" style="display:block;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;text-align:center;padding:12px;border-radius:12px;font-weight:600;font-size:13px;text-decoration:none;">
          ${copy.saleAlertSecondaryCta}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#334155;font-size:12px;margin-top:24px;">
      ${copy.saleAlertFooter}<br/>
      <a href="${wishlistUrl}" style="color:#475569;">${copy.saleAlertManageWishlist}</a>
    </p>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: NEWSLETTER_FROM,
    to,
    subject: copy.saleAlertSubject(gameTitle, savings),
    html,
  });
}

export async function sendNewsletterWelcome({
  to,
  locale = "en",
  unsubscribeToken,
}: NewsletterEmailParams) {
  const copy = getEmailCopy(locale);
  const unsubscribeUrl = getUnsubscribeUrl(unsubscribeToken, locale);
  const homeUrl = getNewsletterLink(locale);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:linear-gradient(180deg,#121826 0%,#0b0f18 100%);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
      <div style="display:inline-block;background:rgba(34,197,94,0.14);color:#86efac;border:1px solid rgba(34,197,94,0.22);padding:6px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
        ${copy.welcomeEyebrow}
      </div>
      <h1 style="font-size:28px;line-height:1.2;margin:18px 0 12px;color:white;">${copy.welcomeTitle}</h1>
      <p style="margin:0 0 18px;color:#94a3b8;font-size:15px;line-height:1.7;">
        ${copy.welcomeIntro}
      </p>
      <p style="margin:0 0 24px;color:#cbd5e1;font-size:14px;line-height:1.7;">
        ${copy.welcomeBody}
      </p>
      <a href="${homeUrl}" style="display:inline-block;background:#22c55e;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:12px;">
        ${copy.welcomeCta}
      </a>
    </div>
    <p style="margin:18px 0 0;color:#64748b;font-size:12px;line-height:1.7;text-align:center;">
      ${copy.welcomeFooter}<br />
      <a href="${unsubscribeUrl}" style="color:#94a3b8;">${copy.unsubscribe}</a>
    </p>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: NEWSLETTER_FROM,
    to,
    subject: copy.welcomeSubject,
    html,
  });
}

export async function sendTopDealsNewsletter({
  to,
  locale = "en",
  unsubscribeToken,
  deals,
}: TopDealsNewsletterParams) {
  const copy = getEmailCopy(locale);
  const unsubscribeUrl = getUnsubscribeUrl(unsubscribeToken, locale);
  const homeUrl = getNewsletterLink(locale);

  const itemsHtml = deals
    .map((deal, index) => {
      const price = parseFloat(deal.salePrice) === 0 ? "FREE" : `$${parseFloat(deal.salePrice).toFixed(2)}`;
      const normal = `$${parseFloat(deal.normalPrice).toFixed(2)}`;
      const savings = Math.round(parseFloat(deal.savings));
      const dealUrl = `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`;
      return `
        <tr>
          <td style="padding:0 0 18px;">
            <div style="border:1px solid rgba(255,255,255,0.08);border-radius:18px;background:#0f172a;overflow:hidden;">
              <img src="${deal.thumb}" alt="${deal.title}" style="display:block;width:100%;height:170px;object-fit:cover;background:#020617;" />
              <div style="padding:18px;">
                <div style="color:#64748b;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${copy.weeklyRankLabel(index)}</div>
                <h2 style="margin:8px 0 10px;font-size:20px;line-height:1.35;color:white;">${deal.title}</h2>
                <div style="margin-bottom:14px;">
                  <span style="font-size:24px;font-weight:800;color:#4ade80;">${price}</span>
                  <span style="margin-left:10px;color:#64748b;font-size:14px;text-decoration:line-through;">${normal}</span>
                  <span style="margin-left:10px;display:inline-block;background:rgba(34,197,94,0.14);color:#86efac;border:1px solid rgba(34,197,94,0.22);padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;">-${savings}%</span>
                </div>
                <a href="${dealUrl}" style="display:inline-block;background:#22c55e;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:11px 16px;border-radius:12px;">
                  ${copy.weeklyCta}
                </a>
              </div>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:'Segoe UI',Arial,sans-serif;color:#e2e8f0;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">
    <div style="padding:0 8px 24px;text-align:center;">
      <div style="display:inline-block;background:rgba(34,197,94,0.14);color:#86efac;border:1px solid rgba(34,197,94,0.22);padding:6px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
        ${copy.weeklyEyebrow}
      </div>
      <h1 style="font-size:30px;line-height:1.2;margin:18px 0 10px;color:white;">${copy.weeklyTitle}</h1>
      <p style="margin:0;color:#94a3b8;font-size:15px;line-height:1.7;">
        ${copy.weeklyIntro}
      </p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${itemsHtml}
      </table>

    <div style="text-align:center;padding:8px 0 0;">
      <a href="${homeUrl}" style="display:inline-block;background:#111827;color:#e2e8f0;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);">
        ${copy.weeklyMore}
      </a>
      <p style="margin:18px 0 0;color:#64748b;font-size:12px;line-height:1.7;">
        ${copy.weeklyFooter}<br />
        <a href="${unsubscribeUrl}" style="color:#94a3b8;">${copy.unsubscribe}</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: NEWSLETTER_FROM,
    to,
    subject: copy.weeklySubject,
    html,
  });
}
