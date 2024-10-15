/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  generateEtags: false,
  webpack: config => {
    // eslint-disable-next-line no-param-reassign
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

// () => {
//   // Proxy to the deployed API backend when running locally

//     return {
//       ...nextConfig,
//       // eslint-disable-next-line require-await
//     //   async rewrites() {
//     //     return [
//     //       {
//     //         source: '/api/:path*',
//     //         destination: '', // Proxy to API backend
//     //       },
//     //     ]
//     //   },
//     }

//   return nextConfig
// }
