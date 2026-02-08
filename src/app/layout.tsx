import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "تدريب نافس | منصة علوم ثالث متوسط",
  description:
    "منصة تدريب تفاعلية للطالبة والمعلمة لرفع جاهزية اختبار نافس في مادة العلوم.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} text-slate-900`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

