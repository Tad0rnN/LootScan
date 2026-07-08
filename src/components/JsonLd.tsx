/**
 * Renders one or more JSON-LD structured-data blocks as
 * <script type="application/ld+json"> tags. Server-safe.
 *
 * The payload is our own serialised object (never user HTML), so
 * dangerouslySetInnerHTML here is the standard, safe way to emit
 * JSON-LD in the Next.js App Router.
 */
interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function JsonLd({ data }: JsonLdProps) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
