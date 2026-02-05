"use client"

import { useEffect } from "react"

const isChunkLoadError = (e: Error) =>
  e?.name === "ChunkLoadError" || /loading chunk|chunk.*failed/i.test(e?.message ?? "")

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

  const chunkError = isChunkLoadError(error)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#faf9f7] p-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-4xl font-bold text-slate-900">حدث خطأ</h1>
        <p className="text-slate-600">
          {chunkError
            ? "فشل تحميل جزء من الصفحة (انتهاء الوقت). حدّثي الصفحة أو جرّبي مرة أخرى."
            : "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."}
        </p>
        {!chunkError && error.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-right">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center flex-wrap">
          {chunkError ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
            >
              حدّثي الصفحة
            </button>
          ) : (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
            >
              إعادة المحاولة
            </button>
          )}
          <a
            href="/"
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </main>
  )
}
