/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@askstudio/config",
    "@askstudio/web3",
    "@askstudio/tokens",
    "@askstudio/dex",
    "@askstudio/ui",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.jup.ag" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "**.solana.com" },
      { protocol: "https", hostname: "**.raydium.io" },
      { protocol: "https", hostname: "**.orca.so" },
      { protocol: "https", hostname: "arweave.net" },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
