/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify は Next.js 15 で廃止されたため削除
  
  // Vercelでのデプロイ用設定
  async rewrites() {
    // 開発環境のみローカルリライト
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/legacy/:path*',
          destination: 'http://localhost:8001/api/:path*'
        }
      ];
    }
    return [];
  },
  // 本番環境最適化
  output: 'standalone',
  // Next.js 15 の新しい設定形式
  serverExternalPackages: ['@prisma/client']
};

module.exports = nextConfig;