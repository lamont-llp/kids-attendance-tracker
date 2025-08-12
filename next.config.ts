import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL(
        'https://gravatar.com/avatar/fb5a10d59a303e33946d8c12997845d1ed02fc661c524ad702370f0af1bf388f?d=blank&size=200',
      ),
    ],
  },
};

export default nextConfig;
