/**
 * Emits a JSON-LD block.
 *
 * Answer engines, generative search and LLM crawlers read structured data far
 * more reliably than they infer meaning from markup, so every route carries
 * one. Rendered from a server component into the static HTML rather than
 * injected on the client — a crawler that does not execute JavaScript still
 * has to see it.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own constants, never user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
