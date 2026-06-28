import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Steam CDNs
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "cdn.akamai.steamstatic.com" },
      { protocol: "https", hostname: "shared.fastly.steamstatic.com" },
      { protocol: "https", hostname: "store.akamai.steamstatic.com" },
      // Epic Games
      { protocol: "https", hostname: "cdn1.epicgames.com" },
      { protocol: "https", hostname: "cdn2.epicgames.com" },
      // GOG
      { protocol: "https", hostname: "images.gog.com" },
      { protocol: "https", hostname: "images.gog-statics.com" },
      { protocol: "https", hostname: "**.gog-statics.com" },
      // Humble Bundle
      { protocol: "https", hostname: "hb.imgix.net" },
      { protocol: "https", hostname: "**.imgix.net" },
      // Fanatical
      { protocol: "https", hostname: "cdn.fanatical.com" },
      { protocol: "https", hostname: "**.fanatical.com" },
      // Green Man Gaming
      { protocol: "https", hostname: "www.greenmangaming.com" },
      { protocol: "https", hostname: "**.greenmangaming.com" },
      // GamersGate
      { protocol: "https", hostname: "www.gamersgate.com" },
      // Nuuvem
      { protocol: "https", hostname: "**.nuuvem.com" },
      // Amazon
      { protocol: "https", hostname: "m.media-amazon.com" },
      // CheapShark (fallback thumbnails)
      { protocol: "https", hostname: "www.cheapshark.com" },
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
