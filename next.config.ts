import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    // Check if we're in a local development or build environment
    // process.env.NODE_ENV will be "development" when using npm run dev
    // and "production" when using npm run build/start
    const isLocalDevelopment = process.env.NODE_ENV === "development";

    // Check if we're on Vercel
    const isVercelProduction = process.env.VERCEL === "1";

    // Determine if we should proxy to local Flask server
    // We should proxy if we're in local development OR if we're testing locally in production
    const shouldProxyToLocalFlask =
      isLocalDevelopment ||
      (!isVercelProduction && process.env.NODE_ENV === "production");

    console.log("Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      isLocalDevelopment,
      isVercelProduction,
      shouldProxyToLocalFlask,
    });

    return [
      {
        source: "/api/:path*",
        destination: shouldProxyToLocalFlask
          ? "http://localhost:5000/api/:path*"
          : "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
