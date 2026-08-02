import { ImageResponse } from "next/og";
import { PRODUCTS, getProduct } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";

const size = { width: 1200, height: 630 };

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

/* Rather than a static `alt` export, so each card is described as the machine
   it shows — which is what a screen reader announces when the link is shared,
   and what an image-indexing crawler reads. */
export function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = getProduct(params.slug);
  return [
    {
      id: "og",
      alt: product
        ? `${product.title} — ${SITE_NAME}`
        : `${SITE_NAME} product`,
      size,
      contentType: "image/png",
    },
  ];
}

/** A card per product, so a shared product link previews as that product
 *  rather than as the generic site image. */
export default async function ProductOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #02102e 0%, #0a2472 60%, #0047e1 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "96px 96px",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {SITE_NAME}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
            }}
          >
            {product?.title ?? "Industrial equipment"}
          </div>
          {product?.summary && (
            <div
              style={{
                display: "flex",
                marginTop: 28,
                fontSize: 28,
                fontWeight: 300,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.62)",
              }}
            >
              {product.summary}
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
