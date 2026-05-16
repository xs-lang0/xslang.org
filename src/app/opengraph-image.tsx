import { ImageResponse } from "next/og";

export const runtime = "nodejs";
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

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.015em",
              maxWidth: 1000,
              color: "#D4CFC4",
            }}
          >
            One language for everything.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#948D81",
              maxWidth: 980,
              lineHeight: 1.4,
            }}
          >
            Pattern matching, algebraic effects, gradual typing, real concurrency.
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, fontSize: 22, color: "#6A6459" }}>
          <span>native</span>
          <span style={{ color: "#3A352F" }}>·</span>
          <span>javascript</span>
          <span style={{ color: "#3A352F" }}>·</span>
          <span>webassembly</span>
          <span style={{ color: "#3A352F" }}>·</span>
          <span>zero deps</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
