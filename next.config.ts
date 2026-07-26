import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Image optimization — AVIF/WebP auto-format per PRD §3 LCP budget.
   * next/image will serve AVIF → WebP → original based on browser Accept header.
   * The hero image at /hero-bg.jpg is explicitly sized here for preload hints.
   */
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // Device sizes driving the breakpoint-tuned srcset for the hero
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
  },

  /**
   * Experimental: partial prerendering and React compiler off
   * (keep defaults — do not enable PPR until tested against CLS budget)
   */

  /**
   * Headers — cache hero assets aggressively at the edge.
   * next/image already adds immutable cache on /_next/image URLs;
   * this adds cache-control for /hero-bg.jpg when fetched directly.
   */
  async headers() {
    return [
      {
        source: "/hero-bg.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
