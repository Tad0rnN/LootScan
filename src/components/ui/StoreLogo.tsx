"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "src"> & {
  storeID: string;
  getStoreLogoUrl: (storeID: string) => string;
};

/**
 * Store icon that silently disappears on load failure instead of showing
 * a broken-image glyph — logos are decorative, the store name text carries the info.
 */
export default function StoreLogo({ storeID, getStoreLogoUrl, alt, ...props }: Props) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <Image
      src={getStoreLogoUrl(storeID)}
      alt={alt}
      onError={() => setHidden(true)}
      {...props}
    />
  );
}
