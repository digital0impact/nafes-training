import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "تدريب نافس | منصة علوم ثالث متوسط",
  description:
    "منصة تدريب تفاعلية للطالبة والمعلمة لرفع جاهزية اختبار نافس في مادة العلوم."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} text-slate-900`} suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

