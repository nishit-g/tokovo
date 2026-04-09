/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during production builds
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@tokovo/creator', '@tokovo/packs', '@tokovo/episodes'],
}

module.exports = nextConfig
