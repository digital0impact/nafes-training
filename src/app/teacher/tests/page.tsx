"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { PageBackground } from "@/components/layout/page-background";

export default function TeacherTestsPage() {
  const [activeTab, setActiveTab] = useState<"diagnostic" | "simulation">("diagnostic");

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
      <header className="card bg-gradient-to-br from-white to-primary-50">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-900">إدارة نماذج الاختبارات</h1>
          <p className="mt-2 text-slate-600">
            قومي بإدارة النماذج المتاحة ومشاركتها مع الطالبات
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-primary-200">
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === "diagnostic"
                ? "text-purple-700 border-purple-600"
                : "text-slate-500 border-transparent hover:text-purple-600"
            }`}
          >
            اختبارات تشخيصية
          </button>
          <button
            onClick={() => setActiveTab("simulation")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === "simulation"
                ? "text-blue-700 border-blue-600"
                : "text-slate-500 border-transparent hover:text-blue-600"
            }`}
          >
            اختبارات محاكية
          </button>
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === "diagnostic" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* إنشاء اختبار جديد */}
          <div className="card group hover:shadow-lg transition-all cursor-pointer" onClick={() => window.location.href = '/teacher/tests/create-diagnostic'}>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition">
                <svg className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">إنشاء اختبار تشخيصي جديد</h3>
                <p className="mt-2 text-sm text-slate-600">
                  قومي بإنشاء اختبار تشخيصي مخصص لتقييم مستوى الطالبات
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-purple-600 font-semibold group-hover:text-purple-700">
                  ابدئي الآن ←
                </span>
              </div>
            </div>
          </div>

          {/* نماذج اختبارات تشخيصية */}
          <div className="card group hover:shadow-lg transition-all cursor-pointer" onClick={() => window.location.href = '/teacher/tests/diagnostic-models'}>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition">
                <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">نماذج اختبارات تشخيصية</h3>
                <p className="mt-2 text-sm text-slate-600">
                  تصفحي النماذج الجاهزة واختاري المناسب لفصلك
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-emerald-600 font-semibold group-hover:text-emerald-700">
                  تصفح النماذج ←
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "simulation" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* إنشاء اختبار جديد */}
          <div className="card group hover:shadow-lg transition-all cursor-pointer" onClick={() => window.location.href = '/teacher/tests/create'}>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition">
                <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">إنشاء اختبار محاكي جديد</h3>
                <p className="mt-2 text-sm text-slate-600">
                  قومي بإنشاء اختبار محاكي مخصص لتدريب الطالبات
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-blue-600 font-semibold group-hover:text-blue-700">
                  ابدئي الآن ←
                </span>
              </div>
            </div>
          </div>

          {/* نماذج اختبارات محاكية */}
          <div className="card group hover:shadow-lg transition-all cursor-pointer" onClick={() => window.location.href = '/teacher/tests/share'}>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 transition">
                <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">نماذج اختبارات محاكية</h3>
                <p className="mt-2 text-sm text-slate-600">
                  تصفحي النماذج الجاهزة واختاري المناسب لفصلك
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className="text-emerald-600 font-semibold group-hover:text-emerald-700">
                  تصفح النماذج ←
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </main>
  );
}

