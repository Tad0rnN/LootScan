import { ImageResponse } from "next/og";

// Default social-share image for every localized route. Per-page
// generateMetadata (e.g. game pages) can still override with a
// title-specific image; this is the fallback.
export const alt = "LootScan — Game Price Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at top, #0b1220 0%, #05050d 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 128,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #86efac 100%)",
            backgroundClip: "text",
            color: "transparent",
            display: "flex",
          }}
        >
          LootScan
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 40,
            color: "#94a3b8",
            display: "flex",
          }}
        >
          Best PC game deals across 40+ stores
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 26,
            color: "#22c55e",
            border: "2px solid rgba(34,197,94,0.4)",
            borderRadius: 999,
            padding: "12px 32px",
            display: "flex",
          }}
        >
          lootscan.co
        </div>
      </div>
    ),
    { ...size }
  );
}
