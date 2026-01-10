"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-slate-900">حدث خطأ</h1>
        <p className="text-slate-600">
          عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
        </p>
        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-right">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>إعادة المحاولة</Button>
          <Button variant="outline" href="/">العودة للصفحة الرئيسية</Button>
        </div>
      </div>
    </main>
  )
}
