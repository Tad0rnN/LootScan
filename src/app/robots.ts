import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/wishlist"],
      },
    ],
    sitemap: "https://lootscan.co/sitemap.xml",
    host: "https://lootscan.co",
  };
}
