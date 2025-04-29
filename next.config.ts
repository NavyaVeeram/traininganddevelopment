import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
module.exports = {
  async rewrites() {
    return [
      {
        source: '/Files/:path*',
        destination: '/public/Files/:path*',
      },
    ];
  },
};


export default nextConfig;