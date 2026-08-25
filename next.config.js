/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js', 'canvas', 'sharp'],
  },
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@resvg/resvg-js', 'canvas', 'sharp'];
    }
    return config;
  },
};
module.exports = nextConfig;
