import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // La portada de la NBA estaba en /nba cuando había más ligas.
  async redirects() {
    return [{ source: "/nba", destination: "/", permanent: true }];
  },
  images: {
    remotePatterns: [
      // Fotos de las noticias
      { protocol: "https", hostname: "a.espncdn.com", pathname: "/photo/**", search: "" },
      // Logos de los equipos
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        pathname: "/i/teamlogos/**",
        search: "",
      },
      // Fotos de los jugadores
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        pathname: "/i/headshots/nba/**",
        search: "",
      },
      // Imágenes generadas de las previas (llevan `?templateId=...`)
      {
        protocol: "https",
        hostname: "s.espncdn.com",
        pathname: "/stitcher/sports/**",
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
