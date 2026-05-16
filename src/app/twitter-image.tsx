import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "XS, a programming language";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#1C1A17",
          color: "#D4CFC4",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#26221E",
              border: "1px solid #2E2A25",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#A8C99B",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            xs
          </div>
          <div style={{ fontSize: 24, color: "#948D81" }}>xslang.org</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "#D4CFC4",
            }}
          >
            XS
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#A8C99B",
              maxWidth: 980,
              lineHeight: 1.3,
              letterSpacing: "-0.005em",
            }}
          >
            A programming language.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#948D81",
              maxWidth: 980,
              lineHeight: 1.4,
            }}
          >
            Anywhere, anytime, by anyone.
          </div>
        </div>

        <div style={{ display: "flex", gap: 22, fontSize: 18, color: "#6A6459" }}>
          <span>v1.0 stable</span>
          <span style={{ color: "#3A352F" }}>·</span>
          <span>one binary</span>
          <span style={{ color: "#3A352F" }}>·</span>
          <span>apache 2.0</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
