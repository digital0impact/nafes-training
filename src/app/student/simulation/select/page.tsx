"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getRelatedOutcomes,
  getQuestionsForModel,
  getPrebuiltTestModels,
  getPrebuiltDiagnosticTests,
  type TestModel,
} from "@/lib/test-models";
import { useStudentStore } from "@/store/student-store";
import { StudentAuthGuard } from "@/components/student";

type TestTab = "new" | "completed";

type CompletedAttempt = {
  id: string;
  testModelId: string | null;
  testModelTitle: string | null;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
};

const skillColors: Record<string, string> = {
  "علوم الحياة": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "العلوم الفيزيائية": "bg-blue-50 text-blue-700 border-blue-200",
  "علوم الأرض والفضاء": "bg-amber-50 text-amber-700 border-amber-200",
  "جميع المجالات": "bg-purple-50 text-purple-700 border-purple-200",
};

function toClientModel(raw: {
  id: string;
  title: string;
  description?: string;
  period: string;
  weeks: string[] | unknown;
  relatedOutcomes: string[] | unknown;
  questionIds: string[] | unknown;
  duration: number;
  skill: string;
  testType?: string;
  year?: string;
}): TestModel {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description ?? "",
    period: raw.period,
    weeks: Array.isArray(raw.weeks) ? raw.weeks : [],
    relatedOutcomes: Array.isArray(raw.relatedOutcomes) ? raw.relatedOutcomes : [],
    questionIds: Array.isArray(raw.questionIds) ? raw.questionIds : [],
    duration: raw.duration,
    skill: raw.skill,
    testType: (raw.testType === "diagnostic" ? "diagnostic" : "normal"),
    year: raw.year,
  };
}

function SelectTestModelContent() {
  const student = useStudentStore((s) => s.student);
  const [activeTab, setActiveTab] = useState<TestTab>("new");
  const [availableModels, setAvailableModels] = useState<TestModel[]>([]);
  const [completedAttempts, setCompletedAttempts] = useState<CompletedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [refreshKey] = useState(0);

  const loadAssignedTests = useCallback(async () => {
    if (!student?.id) {
      setAvailableModels([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/student/assigned-tests?studentId=${encodeURIComponent(student.id)}`,
        { cache: "no-store" }
      );
      const data = await res.json().catch(() => ({}));
      const modelIds: string[] = data.modelIds ?? [];

      const prebuilt = getPrebuiltTestModels();
      const diagnostic = getPrebuiltDiagnosticTests();
      const models: TestModel[] = [];

      for (const id of modelIds) {
        const fromPrebuilt = prebuilt.find((m) => m.id === id);
        const fromDiagnostic = diagnostic.find((m) => m.id === id);
        if (fromPrebuilt) {
          models.push(fromPrebuilt);
          continue;
        }
        if (fromDiagnostic) {
          models.push(fromDiagnostic);
          continue;
        }
        const modelRes = await fetch(
          `/api/student/test-model/${encodeURIComponent(id)}?studentId=${encodeURIComponent(student.id)}`,
          { cache: "no-store" }
        );
        if (modelRes.ok) {
          const raw = await modelRes.json();
          models.push(toClientModel(raw));
        }
      }

      setAvailableModels(models);
    } catch (e) {
      console.error("Error loading assigned tests", e);
      setAvailableModels([]);
    } finally {
      setLoading(false);
    }
  }, [student?.id]);

  // جلب النماذج المُرسلة من المعلمة (بدون كاش لضمان ظهور الاختبارات الجديدة)
  useEffect(() => {
    loadAssignedTests();
  }, [loadAssignedTests, refreshKey]);

  // جلب الاختبارات المنجزة (عند فتح الصفحة وعند تغيير التبويب) لاستخدامها في فلترة "الجديدة" وعرض "المنجزة"
  useEffect(() => {
    if (!student?.id) return;
    setLoadingCompleted(true);
    fetch(`/api/student/training-attempts?studentId=${encodeURIComponent(student.id)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setCompletedAttempts(data.attempts ?? []))
      .catch(() => setCompletedAttempts([]))
      .finally(() => setLoadingCompleted(false));
  }, [student?.id, activeTab, refreshKey]);

  // الاختبارات الجديدة فقط = المعينة من المعلمة والتي لم تُحل بعد (بعد الحل تنتقل إلى المنجزة)
  const newTestsOnly = availableModels.filter(
    (model) => !completedAttempts.some((a) => a.testModelId === model.id)
  );

  return (
    <main className="space-y-6">
      <header className="card bg-gradient-to-br from-white to-primary-50">
        <h1 className="text-3xl font-bold text-slate-900">اختباراتي</h1>
        <p className="mt-2 text-slate-600">
          الاختبارات الجديدة للبدء بها أو المنجزة لمتابعة نتائجك.
        </p>
        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-px sm:mt-6">
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`min-h-[44px] flex-shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition touch-manipulation ${
              activeTab === "new"
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            الاختبارات الجديدة
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`min-h-[44px] flex-shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition touch-manipulation ${
              activeTab === "completed"
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            الاختبارات المنجزة
          </button>
        </div>
      </header>

      {/* تبويب الاختبارات المنجزة */}
      {activeTab === "completed" && (
        <section className="card overflow-hidden p-0">
          {loadingCompleted ? (
            <div className="p-8 text-center text-slate-500">جاري تحميل الاختبارات المنجزة...</div>
          ) : completedAttempts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600">لا توجد اختبارات منجزة بعد.</p>
              <p className="mt-1 text-sm text-slate-500">
                ابدئي من تبويب &quot;الاختبارات الجديدة&quot; لأداء اختبار.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedAttempts.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <h3 className="font-bold text-slate-900">
                    {a.testModelTitle || "اختبار محاكاة"}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(a.completedAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-semibold text-slate-600">مدى الدرجة / النسبة</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold ${
                          a.percentage >= 80
                            ? "bg-emerald-100 text-emerald-700"
                            : a.percentage >= 60
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {a.percentage}%
                      </span>
                      <span className="text-sm text-slate-600">
                        ({a.score} / {a.totalQuestions} سؤال)
                      </span>
                    </div>
                  </div>
                  {a.testModelId && (
                    <Link
                      href={`/student/simulation?model=${a.testModelId}`}
                      className="mt-4 block w-full rounded-2xl bg-primary-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      إعادة الاختبار
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* تبويب الاختبارات الجديدة: فقط ما أرسلته المعلمة ولم تُحله الطالبة بعد */}
      {activeTab === "new" && (
      loading ? (
        <div className="card text-center py-12">
          <p className="text-slate-500">جاري تحميل الاختبارات المتاحة...</p>
        </div>
      ) : newTestsOnly.length === 0 ? (
        <div className="card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">لا توجد اختبارات جديدة حالياً</h3>
          {availableModels.length === 0 && (
            <p className="mt-2 text-slate-600">
              لم تقم معلمتك بمشاركة أي نماذج اختبارات بعد. تواصلي معها للتأكد.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newTestsOnly.map((model) => {
            const relatedOutcomes = getRelatedOutcomes(model.id);
            const skillColor = skillColors[model.skill] || "bg-slate-50 text-slate-700 border-slate-200";

            return (
              <div
                key={model.id}
                className="card group space-y-4 transition-all hover:shadow-lg"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="flex-1 text-lg font-bold text-slate-900">{model.title}</h3>
                    <span className={`badge border ${skillColor}`}>{model.skill}</span>
                  </div>
                  <p className="text-sm text-slate-600">{model.description}</p>
                  {model.year && (
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      {model.year} هـ
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>المدة: {model.duration} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>عدد الأسئلة: {getQuestionsForModel(model.id).length || model.questionIds.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{model.period}</span>
                  </div>
                </div>

                {/* Related Outcomes Preview */}
                {(relatedOutcomes.length > 0 || (model.relatedOutcomes && model.relatedOutcomes.length > 0)) && (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-600">نواتج التعلم المرتبطة:</p>
                    <div className="flex flex-wrap gap-1">
                      {(relatedOutcomes.length ? relatedOutcomes : model.relatedOutcomes!.map((lesson: string) => ({ lesson }))).slice(0, 3).map((outcome: { lesson: string }) => (
                        <span
                          key={outcome.lesson}
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                        >
                          {outcome.lesson.length > 25
                            ? outcome.lesson.substring(0, 25) + "..."
                            : outcome.lesson}
                        </span>
                      ))}
                      {(relatedOutcomes.length || model.relatedOutcomes?.length || 0) > 3 && (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          +{(relatedOutcomes.length || model.relatedOutcomes?.length || 0) - 3} أكثر
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link
                  href={`/student/simulation?model=${model.id}`}
                  className="block w-full rounded-2xl bg-primary-600 py-3 text-center font-semibold text-white transition hover:bg-primary-700"
                >
                  ابدئي الاختبار
                </Link>
              </div>
            );
          })}
        </div>
      )
      )}
    </main>
  );
}

export default function SelectTestModelPage() {
  return (
    <StudentAuthGuard>
      <SelectTestModelContent />
    </StudentAuthGuard>
  );
}

