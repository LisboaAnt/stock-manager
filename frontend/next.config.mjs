/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Em desenvolvimento, proxy das rotas /api para o backend em 3001
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
