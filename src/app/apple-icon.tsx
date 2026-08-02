import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Safari's home-screen icon. Without one, iOS screenshots the page instead. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0047e1 0%, #02102e 100%)",
          color: "#ffffff",
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: -4,
        }}
      >
        V
      </div>
    ),
    size,
  );
}
