/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  generateEtags: false,
  webpack: config => {
    config.resolve.alias['superagent-proxy'] = false
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}