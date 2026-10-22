import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    remotePatterns: [
      // Fotos de las noticias
      { protocol: "https", hostname: "a.espncdn.com", pathname: "/photo/**", search: "" },
      // Logos de los equipos
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        pathname: "/i/teamlogos/nba/**",
        search: "",
      },
      // Imágenes generadas de las previas (llevan `?templateId=...`)
      {
        protocol: "https",
        hostname: "s.espncdn.com",
        pathname: "/stitcher/sports/basketball/nba/**",
      },
    ],
  },
  partialPrefetching: true,
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
