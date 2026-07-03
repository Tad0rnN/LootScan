interface FlagIconProps {
  code: string;
  className?: string;
}

/**
 * Renders a country/region flag as an image instead of a Unicode emoji.
 * Windows browsers lack native glyphs for regional-indicator emoji flags and
 * fall back to showing the raw two-letter code, so emoji flags are unreliable
 * cross-platform — an image renders identically everywhere.
 */
export default function FlagIcon({ code, className }: FlagIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
      alt=""
      width={20}
      height={15}
      className={className ?? "inline-block w-5 h-[15px] rounded-[2px] object-cover"}
    />
  );
}
