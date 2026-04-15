import { Resend } from "resend";
import type { Deal } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const NEWSLETTER_FROM = process.env.NEWSLETTER_FROM_EMAIL ?? "LootScan <newsletter@lootscan.app>";

interface SaleAlertParams {
  to: string;
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

function getUnsubscribeUrl(token: string, locale = "en") {
  return `${SITE_URL}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}&locale=${encodeURIComponent(locale)}`;
}

function getNewsletterLink(locale = "en") {
  return `${SITE_URL}/${locale}`;
}

export async function sendSaleAlert({
  to,
  gameTitle,
  gameThumb,
  gameID,
  normalPrice,
  salePrice,
  savings,
  dealID,
}: SaleAlertParams) {
  const dealUrl = `https://www.cheapshark.com/redirect?dealID=${dealID}`;
  const gameUrl = `${SITE_URL}/en/game/${gameID}`;

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
          🔥 İndirime Girdi!
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
          Fırsata Git →
        </a>
        <a href="${gameUrl}" style="display:block;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#94a3b8;text-align:center;padding:12px;border-radius:12px;font-weight:600;font-size:13px;text-decoration:none;">
          Tüm Mağazaları Karşılaştır
        </a>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#334155;font-size:12px;margin-top:24px;">
      Bu maili LootScan istek listene eklediğin için aldın.<br/>
      <a href="${SITE_URL}/en/wishlist" style="color:#475569;">İstek listeni yönet</a>
    </p>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: "LootScan <noreply@lootscan.app>",
    to,
    subject: `🔥 ${gameTitle} indirime girdi! -%${savings}`,
    html,
  });
}

export async function sendNewsletterWelcome({
  to,
  locale = "en",
  unsubscribeToken,
}: NewsletterEmailParams) {
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
        Weekly newsletter
      </div>
      <h1 style="font-size:28px;line-height:1.2;margin:18px 0 12px;color:white;">You are in for the Top 10 Best Deals of the Week.</h1>
      <p style="margin:0 0 18px;color:#94a3b8;font-size:15px;line-height:1.7;">
        Every week we will send a short roundup with the most worthwhile PC game deals we can find. No noise, no daily spam.
      </p>
      <p style="margin:0 0 24px;color:#cbd5e1;font-size:14px;line-height:1.7;">
        Expect the biggest discounts, standout AAA picks, indie gems, and the strongest value deals worth clicking.
      </p>
      <a href="${homeUrl}" style="display:inline-block;background:#22c55e;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:12px;">
        Open LootScan
      </a>
    </div>
    <p style="margin:18px 0 0;color:#64748b;font-size:12px;line-height:1.7;text-align:center;">
      You subscribed on LootScan.<br />
      <a href="${unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe anytime</a>
    </p>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: NEWSLETTER_FROM,
    to,
    subject: "Welcome to Top 10 Best Deals of the Week",
    html,
  });
}

export async function sendTopDealsNewsletter({
  to,
  locale = "en",
  unsubscribeToken,
  deals,
}: TopDealsNewsletterParams) {
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
                <div style="color:#64748b;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">#${index + 1} this week</div>
                <h2 style="margin:8px 0 10px;font-size:20px;line-height:1.35;color:white;">${deal.title}</h2>
                <div style="margin-bottom:14px;">
                  <span style="font-size:24px;font-weight:800;color:#4ade80;">${price}</span>
                  <span style="margin-left:10px;color:#64748b;font-size:14px;text-decoration:line-through;">${normal}</span>
                  <span style="margin-left:10px;display:inline-block;background:rgba(34,197,94,0.14);color:#86efac;border:1px solid rgba(34,197,94,0.22);padding:4px 8px;border-radius:999px;font-size:12px;font-weight:700;">-${savings}%</span>
                </div>
                <a href="${dealUrl}" style="display:inline-block;background:#22c55e;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:11px 16px;border-radius:12px;">
                  Open deal
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
        LootScan weekly
      </div>
      <h1 style="font-size:30px;line-height:1.2;margin:18px 0 10px;color:white;">Top 10 Best Deals of the Week</h1>
      <p style="margin:0;color:#94a3b8;font-size:15px;line-height:1.7;">
        The strongest game deals we found this week, ready to click.
      </p>
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${itemsHtml}
    </table>

    <div style="text-align:center;padding:8px 0 0;">
      <a href="${homeUrl}" style="display:inline-block;background:#111827;color:#e2e8f0;text-decoration:none;font-weight:700;font-size:14px;padding:12px 18px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);">
        Browse more deals on LootScan
      </a>
      <p style="margin:18px 0 0;color:#64748b;font-size:12px;line-height:1.7;">
        You received this email because you subscribed to the LootScan newsletter.<br />
        <a href="${unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe anytime</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return resend.emails.send({
    from: NEWSLETTER_FROM,
    to,
    subject: "Top 10 Best Deals of the Week",
    html,
  });
}
