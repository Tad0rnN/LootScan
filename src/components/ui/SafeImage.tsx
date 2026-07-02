"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import clsx from "clsx";

type Props = ImageProps & {
  fallbackLabel?: string;
};

/**
 * Drop-in replacement for next/image that swaps to a text fallback
 * instead of a broken-image icon when the source 404s or the CDN is down.
 */
export default function SafeImage({ fallbackLabel, alt, className, fill, width, height, ...props }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={clsx(
          "flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950",
          fill ? "absolute inset-0" : "w-full h-full"
        )}
      >
        <span className="text-slate-700 text-xs font-medium px-3 text-center leading-relaxed line-clamp-3">
          {fallbackLabel ?? alt}
        </span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      onError={() => setError(true)}
      {...props}
    />
  );
}
