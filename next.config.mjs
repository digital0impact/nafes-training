/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // إعدادات TypeScript
  typescript: {
    // تحذير بدلاً من خطأ عند وجود أخطاء TypeScript
    ignoreBuildErrors: false,
  },
  
  // إعدادات ESLint
  eslint: {
    // تجاهل ESLint أثناء البناء مؤقتاً (حتى يتم تحديث الإعدادات)
    ignoreDuringBuilds: true,
  },
  
  // إعدادات الصور
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;

