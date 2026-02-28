"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageBackground } from "@/components/layout/page-background";
import { getPrebuiltDiagnosticTests, getPrebuiltTestModels } from "@/lib/test-models";

type ShareRow = {
  id: string;
  modelId: string;
  shareToAll: boolean;
  studentIds: string;
  sharedAt: string;
};

type ShareWithTitle = ShareRow & {
  title: string;
};

type ResultRow = {
  id: string;
  studentName: string;
  nickname: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
};

export default function TeacherTestsSentPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") === "simulation" ? "simulation" : "diagnostic") as "diagnostic" | "simulation";
  const [shares, setShares] = useState<ShareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportFor, setReportFor] = useState<ShareWithTitle | null>(null);
  const [reportAttempts, setReportAttempts] = useState<ResultRow[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const diagnosticIds = useMemo(() => new Set(getPrebuiltDiagnosticTests().map((m) => m.id)), []);
  const simulationIds = useMemo(() => new Set(getPrebuiltTestModels().map((m) => m.id)), []);
  const diagnosticModels = useMemo(() => getPrebuiltDiagnosticTests(), []);
  const simulationModels = useMemo(() => getPrebuiltTestModels(), []);

  const filteredShares = useMemo(() => {
    const set = type === "diagnostic" ? diagnosticIds : simulationIds;
    return shares.filter((s) => set.has(s.modelId));
  }, [shares, type, diagnosticIds, simulationIds]);

  const sharesWithTitle: ShareWithTitle[] = useMemo(() => {
    const models = type === "diagnostic" ? diagnosticModels : simulationModels;
    const byId = Object.fromEntries(models.map((m) => [m.id, m]));
    return filteredShares.map((s) => ({
      ...s,
      title: byId[s.modelId]?.title || s.modelId,
    }));
  }, [filteredShares, type, diagnosticModels, simulationModels]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/test-shares");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "حدث خطأ أثناء جلب المشاركات");
          return;
        }
        if (!cancelled) setShares(data.shares || []);
      } catch (e) {
        if (!cancelled) setError("حدث خطأ في الاتصال");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const isDiagnostic = type === "diagnostic";
  const title = isDiagnostic ? "الاختبارات التشخيصية المرسلة" : "الاختبارات المحاكية المرسلة";
  const subtitle = isDiagnostic
    ? "الاختبارات التشخيصية التي تمت مشاركتها مع الطالبات"
    : "الاختبارات المحاكية التي تمت مشاركتها مع الطالبات";

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const studentCount = (s: ShareRow) => {
    if (s.shareToAll) return "جميع الطالبات";
    try {
      const ids = JSON.parse(s.studentIds || "[]") as string[];
      return ids.length ? `${ids.length} طالبة` : "—";
    } catch {
      return "—";
    }
  };

  const openReport = async (s: ShareWithTitle) => {
    setReportFor(s);
    setReportError(null);
    setReportAttempts([]);
    setReportLoading(true);
    try {
      const res = await fetch(`/api/teacher/test-results?modelId=${encodeURIComponent(s.modelId)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setReportError(data.error || "حدث خطأ أثناء جلب التقرير");
        return;
      }
      setReportAttempts(data.attempts || []);
    } catch (e) {
      setReportError("حدث خطأ في الاتصال");
    } finally {
      setReportLoading(false);
    }
  };

  const closeReport = () => {
    setReportFor(null);
    setReportAttempts([]);
    setReportError(null);
  };

  const formatReportDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat("ar-SA", { dateStyle: "short", timeStyle: "short" }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-4 p-3 py-6 sm:space-y-6 sm:p-4 sm:py-8">
        <header className="card bg-gradient-to-br from-white to-primary-50 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Link
              href="/teacher/tests"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع إلى إدارة الاختبارات
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">{subtitle}</p>
        </header>

        {loading && (
          <div className="card text-center py-12">
            <p className="text-slate-600">جاري تحميل الاختبارات المرسلة...</p>
          </div>
        )}

        {error && (
          <div className="card border-red-200 bg-red-50 text-red-800 p-4">
            {error}
          </div>
        )}

        {!loading && !error && sharesWithTitle.length === 0 && (
          <div className="card text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <p className="text-slate-600">لا توجد اختبارات مرسلة حتى الآن</p>
            <p className="mt-1 text-sm text-slate-500">
              عند مشاركة اختبار مع الطالبات سيظهر هنا
            </p>
            <Link
              href={isDiagnostic ? "/teacher/tests/diagnostic-models" : "/teacher/tests/share"}
              className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            >
              {isDiagnostic ? "تصفح النماذج التشخيصية" : "تصفح النماذج المحاكية"}
            </Link>
          </div>
        )}

        {!loading && !error && sharesWithTitle.length > 0 && (
          <div className="space-y-3">
            <ul className="grid gap-3 sm:grid-cols-1">
              {sharesWithTitle.map((s) => (
                <li key={s.id}>
                  <div
                    className={`card flex flex-wrap items-center justify-between gap-4 border-l-4 ${
                      isDiagnostic ? "border-l-purple-500" : "border-l-blue-500"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900">{s.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        تم الإرسال: {formatDate(s.sharedAt)} · {studentCount(s)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openReport(s)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          isDiagnostic
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m0 2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v2m2 4h10M9 5h2m-2 0v2M15 5h2m-2 0v2" />
                        </svg>
                        تقرير النتائج
                      </button>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                          isDiagnostic ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        مرسل
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* modal تقرير النتائج */}
        {reportFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeReport}>
            <div
              className="card max-h-[85vh] w-full max-w-2xl overflow-hidden flex flex-col bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900">تقرير النتائج — {reportFor.title}</h2>
                <button
                  type="button"
                  onClick={closeReport}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="إغلاق"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {reportLoading && (
                  <p className="text-center text-slate-600 py-8">جاري تحميل النتائج...</p>
                )}
                {reportError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 p-4">
                    {reportError}
                  </div>
                )}
                {!reportLoading && !reportError && reportAttempts.length === 0 && (
                  <p className="text-center text-slate-600 py-8">لا توجد نتائج مسجلة لهذا الاختبار حتى الآن.</p>
                )}
                {!reportLoading && !reportError && reportAttempts.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="p-2 font-semibold text-slate-700">#</th>
                          <th className="p-2 font-semibold text-slate-700">الطالبة</th>
                          <th className="p-2 font-semibold text-slate-700">الدرجة</th>
                          <th className="p-2 font-semibold text-slate-700">النسبة</th>
                          <th className="p-2 font-semibold text-slate-700">الوقت</th>
                          <th className="p-2 font-semibold text-slate-700">التاريخ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportAttempts.map((a, i) => (
                          <tr key={a.id} className="border-b border-slate-100">
                            <td className="p-2 text-slate-600">{i + 1}</td>
                            <td className="p-2 font-medium text-slate-900">{a.studentName || a.nickname}</td>
                            <td className="p-2">{a.score} / {a.totalQuestions}</td>
                            <td className="p-2">
                              <span className={a.percentage >= 80 ? "text-emerald-600" : a.percentage >= 60 ? "text-amber-600" : "text-red-600"}>
                                {a.percentage.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-2 text-slate-600">{Math.floor(a.timeSpent / 60)} د</td>
                            <td className="p-2 text-slate-600 text-sm">{formatReportDate(a.completedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
