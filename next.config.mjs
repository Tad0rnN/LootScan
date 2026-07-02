import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Steam CDNs (all subdomains)
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "**.steampowered.com" },
      // Epic Games
      { protocol: "https", hostname: "**.epicgames.com" },
      // GOG
      { protocol: "https", hostname: "images.gog.com" },
      { protocol: "https", hostname: "images.gog-statics.com" },
      { protocol: "https", hostname: "**.gog-statics.com" },
      { protocol: "https", hostname: "**.gog.com" },
      // Humble Bundle
      { protocol: "https", hostname: "**.imgix.net" },
      // Fanatical
      { protocol: "https", hostname: "cdn.fanatical.com" },
      { protocol: "https", hostname: "**.fanatical.com" },
      // Green Man Gaming
      { protocol: "https", hostname: "images.greenmangaming.com" },
      { protocol: "https", hostname: "**.greenmangaming.com" },
      // GamersGate
      { protocol: "https", hostname: "www.gamersgate.com" },
      { protocol: "https", hostname: "**.gamersgate.com" },
      // Nuuvem
      { protocol: "https", hostname: "**.nuuvem.com" },
      // WinGameStore / Gamebillet
      { protocol: "https", hostname: "**.wingamestore.com" },
      { protocol: "https", hostname: "**.gamebillet.com" },
      // CheapShark (fallback thumbnails)
      { protocol: "https", hostname: "www.cheapshark.com" },
      // Wraith Esports (Shopify CDN)
      { protocol: "https", hostname: "cdn.shopify.com" },
      // RAWG (FPS Scan game cover images)
      { protocol: "https", hostname: "media.rawg.io" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
