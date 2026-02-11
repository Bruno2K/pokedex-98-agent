/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: "pokeapi.co" },
      { hostname: "raw.githubusercontent.com" },
    ],
  },
};

export default nextConfig;

