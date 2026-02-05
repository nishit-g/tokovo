/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Skip ESLint during production builds
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
