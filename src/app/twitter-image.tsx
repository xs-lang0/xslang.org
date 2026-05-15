import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "XS, a programming language";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 96px",
          background: "#1C1A17",
          color: "#D4CFC4",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 32, color: "#A8C99B", marginBottom: 24 }}>xs</div>
        <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.01em", maxWidth: 880 }}>
          XS is a programming language.
        </div>
        <div style={{ fontSize: 26, color: "#948D81", marginTop: 32, maxWidth: 880, lineHeight: 1.4 }}>
          Native, JavaScript, WebAssembly. Pattern matching, algebraic effects, gradual typing.
        </div>
      </div>
    ),
    { ...size }
  );
}
