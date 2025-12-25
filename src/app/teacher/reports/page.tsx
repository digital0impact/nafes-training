"use client";

import { useState } from "react";
import { students } from "@/lib/data";
import { PageBackground } from "@/components/layout/page-background";

type TabType = "all" | "by-skill" | "by-student";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <header className="card bg-gradient-to-br from-white to-primary-50">
          <div className="mb-4">
            <p className="text-sm text-slate-500">تقارير مفصلة</p>
            <h1 className="text-3xl font-bold text-slate-900">
              تقرير الطالبة حسب المهارات
            </h1>
            <p className="mt-2 text-slate-600">
              اختاري طالبة لاستعراض نقاط القوة والضعف وإرسال خطة علاجية مستهدفة.
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-primary-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "text-primary-700 border-primary-600"
                  : "text-slate-500 border-transparent hover:text-primary-600"
              }`}
            >
              جميع التقارير
            </button>
            <button
              onClick={() => setActiveTab("by-skill")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "by-skill"
                  ? "text-blue-700 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-blue-600"
              }`}
            >
              حسب المهارة
            </button>
            <button
              onClick={() => setActiveTab("by-student")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "by-student"
                  ? "text-emerald-700 border-emerald-600"
                  : "text-slate-500 border-transparent hover:text-emerald-600"
              }`}
            >
              حسب الطالبة
            </button>
          </div>
        </header>

      {/* All Reports Tab */}
      {activeTab === "all" && (
        <div className="grid gap-4 md:grid-cols-2">
        {students.map((student) => (
          <div key={student.name} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">الطالبة</p>
                <h3 className="text-xl font-semibold text-slate-900">
                  {student.name}
                </h3>
              </div>
              <span className="badge bg-slate-100 text-slate-600">
                {student.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              الدرجة الحالية: {student.score}% / التحسن الأسبوعي:{" "}
              <span className="text-emerald-600 font-semibold">
                +{student.progress}%
              </span>
            </p>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">مهارات تحتاج دعم</p>
              <ul className="mt-2 list-disc pr-6">
                <li>قوانين نيوتن - مقترح نشاط محاكاة</li>
                <li>التفاعلات الكيميائية - أسئلة علاجية</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 rounded-2xl border border-slate-200 py-2 text-sm font-semibold">
                تنزيل PDF
              </button>
              <button className="flex-1 rounded-2xl bg-primary-600 py-2 text-sm font-semibold text-white">
                إرسال خطة علاجية
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* By Skill Tab */}
      {activeTab === "by-skill" && (
        <div className="space-y-6">
          <div className="card bg-blue-50 border-blue-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">التقارير حسب المهارة</h2>
            <p className="text-slate-600">
              عرض تقارير مفصلة لكل مهارة وأداء الطالبات فيها
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {students.map((student) => (
              <div key={student.name} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">الطالبة</p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {student.name}
                    </h3>
                  </div>
                  <span className="badge bg-slate-100 text-slate-600">
                    {student.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  الدرجة الحالية: {student.score}% / التحسن الأسبوعي:{" "}
                  <span className="text-emerald-600 font-semibold">
                    +{student.progress}%
                  </span>
                </p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">مهارات تحتاج دعم</p>
                  <ul className="mt-2 list-disc pr-6">
                    <li>قوانين نيوتن - مقترح نشاط محاكاة</li>
                    <li>التفاعلات الكيميائية - أسئلة علاجية</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 rounded-2xl border border-slate-200 py-2 text-sm font-semibold">
                    تنزيل PDF
                  </button>
                  <button className="flex-1 rounded-2xl bg-primary-600 py-2 text-sm font-semibold text-white">
                    إرسال خطة علاجية
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Student Tab */}
      {activeTab === "by-student" && (
        <div className="space-y-6">
          <div className="card bg-emerald-50 border-emerald-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">التقارير حسب الطالبة</h2>
            <p className="text-slate-600">
              عرض تقارير مفصلة لكل طالبة وأدائها في جميع المهارات
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {students.map((student) => (
              <div key={student.name} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">الطالبة</p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {student.name}
                    </h3>
                  </div>
                  <span className="badge bg-slate-100 text-slate-600">
                    {student.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  الدرجة الحالية: {student.score}% / التحسن الأسبوعي:{" "}
                  <span className="text-emerald-600 font-semibold">
                    +{student.progress}%
                  </span>
                </p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">مهارات تحتاج دعم</p>
                  <ul className="mt-2 list-disc pr-6">
                    <li>قوانين نيوتن - مقترح نشاط محاكاة</li>
                    <li>التفاعلات الكيميائية - أسئلة علاجية</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 rounded-2xl border border-slate-200 py-2 text-sm font-semibold">
                    تنزيل PDF
                  </button>
                  <button className="flex-1 rounded-2xl bg-primary-600 py-2 text-sm font-semibold text-white">
                    إرسال خطة علاجية
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

