/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  poweredByHeader: false,
  reactStrictMode: true
};

module.exports = nextConfig;
