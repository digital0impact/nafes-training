"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type AuditLogItem = {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  action: string
  details: Record<string, unknown> | string | null
  createdAt: string
}

const ACTION_LABELS: Record<string, string> = {
  visitor_login: "دخول زائر",
  visitor_comment: "تعليق زائر",
  visitor_disabled: "تعطيل زائر",
  visitor_enabled: "تفعيل زائر",
  visitor_removed: "إزالة صلاحية زائر",
}

export default function TeacherAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch("/api/teacher/audit-log?limit=100")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.auditLogs ?? [])
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString("ar-SA", {
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
    <main className="space-y-6 p-6">
      <header>
        <Link
          href="/teacher"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← العودة للوحة التحكم
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">سجل التدقيق (Audit Log)</h1>
        <p className="mt-1 text-sm text-slate-600">
          تسجيل دخول الزوار وتعليقاتهم وإجراءات التعطيل/التفعيل.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">آخر الأنشطة</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">لا توجد سجلات.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">التاريخ والوقت</th>
                  <th className="px-6 py-3 font-semibold">المستخدم</th>
                  <th className="px-6 py-3 font-semibold">الإجراء</th>
                  <th className="px-6 py-3 font-semibold">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 text-slate-600">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">{log.userName}</span>
                      {log.userRole === "visitor_reviewer" && (
                        <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">زائر</span>
                      )}
                      <br />
                      <span className="text-xs text-slate-500">{log.userEmail}</span>
                    </td>
                    <td className="px-6 py-4">
                      {ACTION_LABELS[log.action] || log.action}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {log.details && typeof log.details === "object"
                        ? JSON.stringify(log.details)
                        : log.details != null
                          ? String(log.details)
                          : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
