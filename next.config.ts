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
    ];
  },
};

export default config;
