import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Document uploads and badge certificates go through server actions (default limit 1 MB).
    // Vercel caps request bodies at 4.5 MB, so stay just under it.
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
