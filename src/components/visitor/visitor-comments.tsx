"use client"

import { useState, useEffect } from "react"

type Comment = {
  id: string
  visitorName: string
  body: string
  createdAt: string
}

type VisitorCommentsProps = {
  targetType: "activity" | "test" | "indicator"
  targetId: string
  targetLabel?: string
}

export function VisitorComments({ targetType, targetId, targetLabel }: VisitorCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newBody, setNewBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadComments = () => {
    setLoading(true)
    fetch(`/api/visitor/comments?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments ?? [])
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadComments()
  }, [targetType, targetId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBody.trim() || submitting) return
    setSubmitting(true)
    setError(null)
    fetch("/api/visitor/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType,
        targetId,
        body: newBody.trim().slice(0, 2000),
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d?.error || "فشل الإرسال") })
        return r.json()
      })
      .then((data) => {
        setComments((prev) => [data.comment, ...prev])
        setNewBody("")
      })
      .catch((err) => setError(err.message || "حدث خطأ"))
      .finally(() => setSubmitting(false))
  }

  const formatDate = (s: string) => {
    try {
      const d = new Date(s)
      return d.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return s
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-700">
        التعليقات {targetLabel ? `على: ${targetLabel}` : ""}
      </h4>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="اكتب تعليقك (لا يمكن تعديله أو حذفه بعد الإرسال)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          rows={2}
          maxLength={2000}
          disabled={submitting}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !newBody.trim()}
          className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? "جاري الإرسال..." : "إرسال التعليق"}
        </button>
      </form>
      {loading ? (
        <p className="text-sm text-slate-500">جاري تحميل التعليقات...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500">لا توجد تعليقات بعد.</p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="rounded border border-slate-200 bg-white p-3 text-sm">
              <p className="font-medium text-slate-800">{c.visitorName}</p>
              <p className="mt-1 text-slate-700">{c.body}</p>
              <p className="mt-1 text-xs text-slate-500">{formatDate(c.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
