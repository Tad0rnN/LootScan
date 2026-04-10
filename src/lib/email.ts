import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const gameUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/en/game/${gameID}`;

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
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/en/wishlist" style="color:#475569;">İstek listeni yönet</a>
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
