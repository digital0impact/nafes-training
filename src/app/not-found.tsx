import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700">الصفحة غير موجودة</h2>
        <p className="text-slate-600 max-w-md">
          عذراً، الصفحة التي تبحثين عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex gap-4 justify-center">
          <Button href="/">العودة للصفحة الرئيسية</Button>
          <Button variant="outline" href="/auth/signin">تسجيل الدخول</Button>
        </div>
      </div>
    </main>
  )
}
