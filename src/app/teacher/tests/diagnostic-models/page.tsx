"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPrebuiltDiagnosticTests, getQuestionsForModel, getRelatedOutcomes, type TestModel } from "@/lib/test-models";
import { PageBackground } from "@/components/layout/page-background";

const skillColors: Record<string, string> = {
  "علوم الحياة": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "العلوم الفيزيائية": "bg-blue-50 text-blue-700 border-blue-200",
  "علوم الأرض والفضاء": "bg-amber-50 text-amber-700 border-amber-200",
  "جميع المجالات": "bg-purple-50 text-purple-700 border-purple-200"
};

type Student = {
  id: string;
  name: string;
  classId: string;
  classCode?: string;
};

export default function DiagnosticModelsPage() {
  const [diagnosticModels, setDiagnosticModels] = useState<TestModel[]>([]);
  const [customModels, setCustomModels] = useState<TestModel[]>([]);
  const [activeTab, setActiveTab] = useState<"prebuilt" | "custom">("prebuilt");
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TestModel | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [sendToAll, setSendToAll] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // تحميل النماذج التشخيصية الجاهزة
    const diagnostic = getPrebuiltDiagnosticTests();
    setDiagnosticModels(diagnostic);
    
    // تحميل النماذج المخصصة من localStorage
    const saved = localStorage.getItem("customTestModels");
    if (saved) {
      try {
        const allCustom: TestModel[] = JSON.parse(saved);
        // تصفية النماذج التشخيصية فقط
        const diagnosticCustom = allCustom.filter(m => m.testType === "diagnostic");
        setCustomModels(diagnosticCustom);
      } catch (e) {
        console.error("Error loading custom models", e);
      }
    }
  }, []);

  // جلب قائمة الطلاب
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await fetch("/api/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      } else {
        setMessage({ type: "error", text: "فشل في تحميل قائمة الطالبات" });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setMessage({ type: "error", text: "حدث خطأ في تحميل قائمة الطالبات" });
    } finally {
      setLoadingStudents(false);
    }
  };

  // فتح نافذة المعاينة
  const openPreviewModal = (model: TestModel) => {
    setSelectedModel(model);
    const questions = getQuestionsForModel(model.id);
    setPreviewQuestions(questions);
    setShowPreviewModal(true);
  };

  // إغلاق نافذة المعاينة
  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedModel(null);
    setPreviewQuestions([]);
  };

  // فتح نافذة الإرسال
  const openSendModal = (model: TestModel) => {
    setSelectedModel(model);
    setShowSendModal(true);
    fetchStudents();
  };

  // إغلاق نافذة الإرسال
  const closeSendModal = () => {
    setShowSendModal(false);
    setSelectedModel(null);
    setSelectedStudents(new Set());
    setSendToAll(false);
  };

  // تحديد/إلغاء تحديد طالبة
  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  // تحديد/إلغاء تحديد الكل
  const toggleSelectAll = () => {
    if (sendToAll) {
      setSendToAll(false);
      setSelectedStudents(new Set());
    } else {
      setSendToAll(true);
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  // إرسال الاختبار للطالبات (عبر API ليصل فعلياً للطالبات)
  const handleSendTest = async () => {
    if (!selectedModel) return;

    if (selectedStudents.size === 0 && !sendToAll) {
      setMessage({ type: "error", text: "الرجاء اختيار طالبة واحدة على الأقل" });
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/test-shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModel.id,
          shareToAll: sendToAll,
          studentIds: sendToAll ? [] : Array.from(selectedStudents),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "حدث خطأ أثناء إرسال الاختبار" });
        setTimeout(() => setMessage(null), 4000);
        return;
      }

      setMessage({
        type: "success",
        text: `تم إرسال الاختبار إلى ${sendToAll ? "جميع الطالبات" : selectedStudents.size + " طالبة"}`,
      });
      closeSendModal();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error sending test:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء إرسال الاختبار" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setSending(false);
    }
  };

  // حذف نموذج مخصص
  const deleteCustomModel = (modelId: string) => {
    if (!confirm("هل أنت متأكدة من حذف هذا النموذج؟")) return;

    try {
      const saved = localStorage.getItem("customTestModels");
      if (saved) {
        const allCustom: TestModel[] = JSON.parse(saved);
        const filtered = allCustom.filter(m => m.id !== modelId);
        localStorage.setItem("customTestModels", JSON.stringify(filtered));
        
        // تحديث القائمة
        const diagnosticCustom = filtered.filter(m => m.testType === "diagnostic");
        setCustomModels(diagnosticCustom);
        
        setMessage({ type: "success", text: "تم حذف النموذج بنجاح" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء حذف النموذج" });
    }
  };

  if (!mounted) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 p-4 py-8">
          <div className="card text-center">
            <p className="text-slate-600">جاري التحميل...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        {/* Header */}
        <header className="card bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/teacher/tests"
              className="text-purple-600 hover:text-purple-700"
            >
              ← العودة للاختبارات
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">📋 نماذج اختبارات تشخيصية</h1>
          <p className="mt-2 text-slate-600">
            نماذج جاهزة للاختبارات التشخيصية. يمكنك معاينة النماذج وتعديلها وإرسالها للطالبات.
          </p>
        </header>

        {/* Message */}
        {message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="card p-0 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("prebuilt")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === "prebuilt"
                  ? "text-purple-700 border-purple-600 bg-purple-50"
                  : "text-slate-500 border-transparent hover:text-purple-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                النماذج الجاهزة
                <span className="rounded-full bg-purple-600 px-2 py-0.5 text-xs text-white">
                  {diagnosticModels.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === "custom"
                  ? "text-emerald-700 border-emerald-600 bg-emerald-50"
                  : "text-slate-500 border-transparent hover:text-emerald-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
                نماذجي
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                  {customModels.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Models Grid */}
        {activeTab === "prebuilt" ? (
          diagnosticModels.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {diagnosticModels.map((model) => {
              const skillColor = skillColors[model.skill] || "bg-slate-50 text-slate-700 border-slate-200";
              const questionsCount = getQuestionsForModel(model.id).length || model.questionIds.length;
              const relatedOutcomes = getRelatedOutcomes(model.id);

              return (
                <div
                  key={model.id}
                  className="card space-y-4 transition-all hover:shadow-lg"
                >
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="flex-1 text-lg font-bold text-slate-900">{model.title}</h3>
                      <span className={`badge border ${skillColor}`}>{model.skill}</span>
                    </div>
                    <p className="text-sm text-slate-600">{model.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700">
                        اختبار تشخيصي
                      </span>
                      {model.year && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                          {model.year} هـ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">المدة</p>
                      <p className="font-semibold text-slate-900">{model.duration} دقيقة</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">الأسئلة</p>
                      <p className="font-semibold text-slate-900">{questionsCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">الفترة</p>
                      <p className="font-semibold text-slate-900 text-xs">{model.period}</p>
                    </div>
                  </div>

                  {/* Related Outcomes */}
                  {relatedOutcomes.length > 0 && (
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <p className="text-xs font-semibold text-slate-600">نواتج التعلم المرتبطة:</p>
                      <div className="flex flex-wrap gap-1">
                        {relatedOutcomes.slice(0, 2).map((outcome) => (
                          <span
                            key={outcome.lesson}
                            className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          >
                            {outcome.lesson.length > 20
                              ? outcome.lesson.substring(0, 20) + "..."
                              : outcome.lesson}
                          </span>
                        ))}
                        {relatedOutcomes.length > 2 && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                            +{relatedOutcomes.length - 2} أكثر
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => openPreviewModal(model)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      معاينة
                    </button>
                    <Link
                      href={`/teacher/tests/edit-diagnostic?id=${model.id}`}
                      className="flex items-center justify-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      تعديل
                    </Link>
                    <button
                      onClick={() => openSendModal(model)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      إرسال
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">لا توجد نماذج جاهزة متاحة</h3>
              <p className="mt-2 text-slate-600">
                يمكنك إنشاء اختبار تشخيصي جديد أو تعديل أحد النماذج الموجودة.
              </p>
            </div>
          )
        ) : (
          customModels.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {customModels.map((model) => {
                const skillColor = skillColors[model.skill] || "bg-slate-50 text-slate-700 border-slate-200";
                const questionsCount = getQuestionsForModel(model.id).length || model.questionIds.length;
                const relatedOutcomes = getRelatedOutcomes(model.id);

                return (
                  <div
                    key={model.id}
                    className="card space-y-4 transition-all hover:shadow-lg border-2 border-emerald-200"
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="flex-1 text-lg font-bold text-slate-900">{model.title}</h3>
                        <span className={`badge border ${skillColor}`}>{model.skill}</span>
                      </div>
                      <p className="text-sm text-slate-600">{model.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                          نموذج مخصص
                        </span>
                        {model.year && (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                            {model.year} هـ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">المدة</p>
                        <p className="font-semibold text-slate-900">{model.duration} دقيقة</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">الأسئلة</p>
                        <p className="font-semibold text-slate-900">{questionsCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-500">الفترة</p>
                        <p className="font-semibold text-slate-900 text-xs">{model.period}</p>
                      </div>
                    </div>

                    {/* Related Outcomes */}
                    {relatedOutcomes.length > 0 && (
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <p className="text-xs font-semibold text-slate-600">نواتج التعلم المرتبطة:</p>
                        <div className="flex flex-wrap gap-1">
                          {relatedOutcomes.slice(0, 2).map((outcome) => (
                            <span
                              key={outcome.lesson}
                              className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                            >
                              {outcome.lesson.length > 20
                                ? outcome.lesson.substring(0, 20) + "..."
                                : outcome.lesson}
                            </span>
                          ))}
                          {relatedOutcomes.length > 2 && (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                              +{relatedOutcomes.length - 2} أكثر
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => openPreviewModal(model)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        معاينة
                      </button>
                      <Link
                        href={`/teacher/tests/edit-diagnostic?id=${model.id}`}
                        className="flex items-center justify-center gap-1 rounded-xl bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        تعديل
                      </Link>
                      <button
                        onClick={() => openSendModal(model)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        إرسال
                      </button>
                      <button
                        onClick={() => deleteCustomModel(model.id)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-rose-50 px-2 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">لا توجد نماذج مخصصة بعد</h3>
              <p className="mt-2 text-slate-600">
                يمكنك إنشاء نموذج جديد بتعديل أحد النماذج الجاهزة
              </p>
              <button
                onClick={() => setActiveTab("prebuilt")}
                className="mt-4 inline-block rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                تصفح النماذج الجاهزة
              </button>
            </div>
          )
        )}

        {/* Info Section */}
        <div className="card bg-purple-50 border-purple-200">
          <h3 className="mb-2 text-lg font-semibold text-purple-900">💡 معلومات مهمة</h3>
          <ul className="space-y-1 text-sm text-purple-800">
            <li>• الاختبارات التشخيصية تساعد في تقييم مستوى الطالبات قبل بدء الوحدة</li>
            <li>• يمكنك معاينة النموذج قبل إرساله للطالبات</li>
            <li>• يمكنك تعديل النموذج حسب احتياجات فصلك</li>
            <li>• يمكنك إرسال الاختبار لطالبة محددة أو لجميع الطالبات</li>
          </ul>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-slate-200 p-6 bg-gradient-to-br from-white to-blue-50">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">معاينة الاختبار</h2>
                  <p className="mt-1 text-sm text-slate-600">{selectedModel.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {previewQuestions.length} سؤال
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      {selectedModel.duration} دقيقة
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {selectedModel.skill}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closePreviewModal}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewQuestions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-600">لا توجد أسئلة في هذا النموذج</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {previewQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-6"
                    >
                      {/* Question Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {index + 1}
                          </span>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {question.skill || selectedModel.skill}
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {question.points || 1} نقطة
                        </span>
                      </div>

                      {/* Question Text */}
                      <p className="mb-4 text-lg font-semibold text-slate-900">
                        {question.text}
                      </p>

                      {/* Choices */}
                      <div className="space-y-2">
                        {question.choices && question.choices.map((choice: string, choiceIndex: number) => {
                          const isCorrect = choice === question.correctAnswer;
                          return (
                            <div
                              key={choiceIndex}
                              className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${
                                isCorrect
                                  ? 'border-emerald-400 bg-emerald-50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}>
                                {String.fromCharCode(65 + choiceIndex)}
                              </span>
                              <span className={`flex-1 ${isCorrect ? 'font-semibold text-emerald-900' : 'text-slate-700'}`}>
                                {choice}
                              </span>
                              {isCorrect && (
                                <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                  الإجابة الصحيحة
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-6 bg-slate-50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    closePreviewModal();
                    openSendModal(selectedModel);
                  }}
                  className="flex-1 rounded-2xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  إرسال هذا الاختبار للطالبات
                </button>
                <button
                  onClick={closePreviewModal}
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && selectedModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">إرسال الاختبار</h2>
                  <p className="mt-1 text-sm text-slate-600">{selectedModel.title}</p>
                </div>
                <button
                  onClick={closeSendModal}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              {loadingStudents ? (
                <div className="py-8 text-center">
                  <p className="text-slate-600">جاري تحميل قائمة الطالبات...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-600">لا توجد طالبات في الفصل</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select All */}
                  <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendToAll}
                        onChange={toggleSelectAll}
                        className="h-5 w-5 rounded text-purple-600"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">جميع الطالبات</p>
                        <p className="text-sm text-slate-600">
                          إرسال الاختبار لجميع طالبات الفصل ({students.length} طالبة)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Individual Students */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">أو اختاري طالبات محددات:</p>
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 cursor-pointer hover:bg-slate-100 transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.id)}
                            onChange={() => toggleStudent(student.id)}
                            disabled={sendToAll}
                            className="h-4 w-4 rounded text-purple-600 disabled:opacity-50"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{student.name}</p>
                            <p className="text-xs text-slate-500">رمز الفصل: {student.classCode}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Selected Count */}
                  {selectedStudents.size > 0 && (
                    <div className="rounded-xl bg-blue-50 p-3 text-center">
                      <p className="text-sm text-blue-700">
                        تم اختيار {selectedStudents.size} {selectedStudents.size === 1 ? 'طالبة' : 'طالبات'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 p-6">
              <div className="flex gap-3">
                <button
                  onClick={handleSendTest}
                  disabled={(selectedStudents.size === 0 && !sendToAll) || sending}
                  className="flex-1 rounded-2xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "جاري الإرسال..." : "إرسال الاختبار"}
                </button>
                <button
                  onClick={closeSendModal}
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
