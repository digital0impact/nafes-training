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
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/tests/create-diagnostic"
            className="w-full h-[800px] border-0"
            title="اختبارات تشخيصية"
          />
        </div>
      )}

      {activeTab === "simulation" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/tests/create"
            className="w-full h-[800px] border-0"
            title="اختبارات محاكية"
          />
        </div>
      )}

      </div>
    </main>
  );
}

