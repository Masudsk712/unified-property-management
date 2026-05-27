import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Image Optimization ──────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // ── Compression ─────────────────────────────────────────────────────────
  compress: true,

  // ── Caching & Stale-Revalidation Headers ────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },

  // ── Bundle / Build Optimizations ────────────────────────────────────────
  poweredByHeader: false,
  reactStrictMode: true,

  // ── Experimental ────────────────────────────────────────────────────────
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // ── Webpack ─────────────────────────────────────────────────────────────
  webpack: (config, { dev, isServer }) => {
    // Tree-shake and minimize in production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Separate heavy chart library
            charts: {
              test: /[\\/]node_modules[\\/](recharts)[\\/]/,
              name: "charts",
              priority: 10,
              reuseExistingChunk: true,
            },
            // Separate framer-motion
            animations: {
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              name: "animations",
              priority: 10,
              reuseExistingChunk: true,
            },
            // Vendor commons
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Exclude mongodb driver from client bundle (used only in server-side Prisma)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
      };
    }

    return config;
  },

  // ── Transpile Packed Packages (for monorepo / ESM compat) ───────────────
  transpilePackages: [
    "@tanstack/react-query",
    "next-auth",
    "lucide-react",
  ],

  // ── Logging ─────────────────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // ── Output ──────────────────────────────────────────────────────────────
  output: "standalone",

  // ── Production Source Maps ──────────────────────────────────────────────
  productionBrowserSourceMaps: false,
};


export default nextConfig;