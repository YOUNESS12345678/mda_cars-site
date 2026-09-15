import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 requires custom quality values used by <Image> to be
    // explicitly whitelisted. Keeping a small set avoids arbitrary
    // optimizer variants while preserving high-quality hero photography.
    qualities: [75, 80, 82, 85, 90],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
