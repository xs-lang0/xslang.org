import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XS, a programming language",
    short_name: "XS",
    description: "One language for everything: scripts, services, the browser. Pattern matching, algebraic effects, gradual typing, real concurrency.",
    start_url: "/",
    display: "minimal-ui",
    background_color: "#1C1A17",
    theme_color: "#1C1A17",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
