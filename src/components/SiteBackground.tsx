"use client";

import { usePathname } from "next/navigation";
import { DitheringShader } from "@/components/ui/dithering-shader";

const EXCLUDED_PATH_PREFIXES = ["/gear", "/auth/login"];

function stripLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  segments.shift();
  return `/${segments.join("/")}`;
}

export default function SiteBackground() {
  const pathname = usePathname();
  const path = stripLocale(pathname ?? "/");

  const isExcluded = EXCLUDED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (isExcluded) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.07]">
        <DitheringShader
          shape="wave"
          type="8x8"
          colorBack="#05050d"
          colorFront="#22c55e"
          pxSize={4}
          speed={0.35}
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 30%, #05050d 65%)",
        }}
      />
    </div>
  );
}
