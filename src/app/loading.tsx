export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f7]">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto" />
        <p className="text-slate-600">جاري التحميل...</p>
      </div>
    </main>
  )
}
