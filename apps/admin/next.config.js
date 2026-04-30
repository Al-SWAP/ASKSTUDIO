/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@askstudio/config",
    "@askstudio/web3",
    "@askstudio/tokens",
    "@askstudio/dex",
  ],
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false };
    return config;
  },
};
module.exports = nextConfig;
