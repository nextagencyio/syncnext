/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp'],
  },
  publicRuntimeConfig: {
    SITE_NAME: 'SyncNext',
    SHOW_LOGO: '1',
    SHOW_SITE_NAME: '0',
    CTA_LINK_COUNT: '2',
  },
};

export default nextConfig;
