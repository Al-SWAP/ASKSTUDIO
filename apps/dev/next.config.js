/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@askstudio/config",
    "@askstudio/dex",
    "@askstudio/tokens",
    "@askstudio/web3",
  ],
};

module.exports = nextConfig;
