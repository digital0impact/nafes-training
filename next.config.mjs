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
    // تشغيل ESLint أثناء البناء
    ignoreDuringBuilds: false,
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

