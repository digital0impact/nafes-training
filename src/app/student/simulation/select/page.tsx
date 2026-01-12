"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { testModels, getAllTestModels, getRelatedOutcomes, getQuestionsForModel } from "@/lib/test-models";
import { LearningOutcomeCard } from "@/components/ui/learning-outcome-card";

const skillColors: Record<string, string> = {
  "علوم الحياة": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "العلوم الفيزيائية": "bg-blue-50 text-blue-700 border-blue-200",
  "علوم الأرض والفضاء": "bg-amber-50 text-amber-700 border-amber-200",
  "جميع المجالات": "bg-purple-50 text-purple-700 border-purple-200"
};

export default function SelectTestModelPage() {
  const [sharedModels, setSharedModels] = useState<Set<string>>(new Set());
  const [availableModels, setAvailableModels] = useState(testModels);

  // Load shared models from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sharedTestModels");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        const sharedSet = new Set(parsed);
        setSharedModels(sharedSet);
        // Filter to show only shared models (from all models including custom)
        const allModels = getAllTestModels();
        setAvailableModels(allModels.filter((model) => sharedSet.has(model.id)));
      } catch (e) {
        console.error("Error loading shared models", e);
      }
    }
  }, []);

  return (
    <main className="space-y-6">
      <header className="card bg-gradient-to-br from-white to-primary-50">
        <h1 className="text-3xl font-bold text-slate-900">محاكاة اختبار نافس</h1>
        <p className="mt-2 text-slate-600">
          اختر نموذج الاختبار المناسب لك. كل نموذج يحتوي على 20 سؤالاً مرتبطاً بنواتج التعلم المحددة.
        </p>
      </header>

      {availableModels.length === 0 ? (
        <div className="card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">لا توجد نماذج متاحة حالياً</h3>
          <p className="mt-2 text-slate-600">
            لم تقم معلمتك بمشاركة أي نماذج اختبارات بعد. تواصلي معها للحصول على النماذج.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableModels.map((model) => {
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
              {relatedOutcomes.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-600">نواتج التعلم المرتبطة:</p>
                  <div className="flex flex-wrap gap-1">
                    {relatedOutcomes.slice(0, 3).map((outcome) => (
                      <span
                        key={outcome.lesson}
                        className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                      >
                        {outcome.lesson.length > 25
                          ? outcome.lesson.substring(0, 25) + "..."
                          : outcome.lesson}
                      </span>
                    ))}
                    {relatedOutcomes.length > 3 && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        +{relatedOutcomes.length - 3} أكثر
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
      )}

      {/* Info Section */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="mb-2 text-lg font-semibold text-blue-900">معلومات مهمة</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• كل نموذج يحتوي على 20 سؤالاً مختارة بعناية</li>
          <li>• الأسئلة مرتبطة بنواتج التعلم المحددة في خطة الصف</li>
          <li>• مدة كل اختبار 20 دقيقة</li>
          <li>• يمكنك مراجعة الأسئلة لاحقاً قبل إنهاء الاختبار</li>
          <li>• سيتم عرض النتائج التفصيلية بعد إنهاء الاختبار</li>
        </ul>
      </div>
    </main>
  );
}

