import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated rather than shipped as a file, so the card never drifts from the
 *  wordmark and never has to be re-exported by hand. */
export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #0047e1 0%, #0a2472 55%, #02102e 100%)",
        }}
      >
        {/* Blueprint rule, echoing the grid the site is drawn on */}
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
              fontSize: 92,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              fontWeight: 300,
              color: "rgba(255,255,255,0.62)",
            }}
          >
            Chillers · Flake cutters · Hopper loaders · Laser marking · Feeders
          </div>
        </div>
      </div>
    ),
    size,
  );
}
