import type { NextConfig } from "next";

const config: NextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/builds/wasm/xs.js", destination: "/xs.js" },
      { source: "/builds/wasm/xs.wasm", destination: "/xs.wasm" },
      { source: "/builds/wasm/runtime.js", destination: "/xs.js" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/xs.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/builds/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      // Cross-origin isolation for /playground and /embed so
      // SharedArrayBuffer is available. The SAB is what backs the worker
      // -> main-thread stdin channel; without it, input() returns
      // immediately with an empty string.
      {
        source: "/playground",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      {
        source: "/embed",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          // The whole point of /embed is to be iframed from anywhere.
          // No frame-ancestor restriction; the host page bears the COEP
          // requirement via `allow="cross-origin-isolated"` on the iframe.
        ],
      },
    ];
  },
};

export default config;
