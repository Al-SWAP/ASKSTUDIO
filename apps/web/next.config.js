/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@askstudio/config",
    "@askstudio/dex",
    "@askstudio/tokens",
    "@askstudio/ui",
    "@askstudio/web3",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "arweave.net" },
      { protocol: "https", hostname: "**.ipfs.io" },
      { protocol: "https", hostname: "shdw-drive.genesysgo.net" },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
