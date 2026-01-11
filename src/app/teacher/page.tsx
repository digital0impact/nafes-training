"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { students } from "@/lib/data";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionHeader } from "@/components/ui/section-header";
import { type SubscriptionPlan } from "@/lib/subscription";

const weakSkills = [
  { skill: "قوانين نيوتن", students: 5 },
  { skill: "التفاعلات الكيميائية", students: 4 },
  { skill: "تحولات المادة", students: 3 }
];

type TabType = "overview" | "outcomes" | "tests" | "activities" | "students";

type DashboardStats = {
  classesCount: number;
  studentsCount: number;
  weeklyAttempts: number;
};

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const subscriptionPlan = (user?.subscriptionPlan || "free") as SubscriptionPlan;

  // جلب الإحصائيات
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (activeTab === "overview") {
      fetchStats();
    }
  }, [activeTab]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <main className="space-y-10">
      <header className="card bg-white">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">لوحة المعلمة</p>
            {user && (
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                مرحباً، {user.name}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/subscription"
              className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${
                subscriptionPlan === "premium"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {subscriptionPlan === "premium" ? "مميز" : "مجاني"}
            </Link>
            <Link
              href="/teacher/subscription"
              className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition"
            >
              إدارة الاشتراك
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-primary-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "text-primary-700 border-primary-600"
                : "text-slate-500 border-transparent hover:text-primary-600"
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab("outcomes")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "outcomes"
                ? "text-primary-700 border-primary-600"
                : "text-slate-500 border-transparent hover:text-primary-600"
            }`}
          >
            خطة نافس
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "tests"
                ? "text-primary-700 border-primary-600"
                : "text-slate-500 border-transparent hover:text-primary-600"
            }`}
          >
            إدارة الاختبارات
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "activities"
                ? "text-amber-700 border-amber-600"
                : "text-slate-500 border-transparent hover:text-amber-600"
            }`}
          >
            إدارة الأنشطة
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === "students"
                ? "text-emerald-700 border-emerald-600"
                : "text-slate-500 border-transparent hover:text-emerald-600"
            }`}
          >
            إدارة الطالبات
          </button>
        </div>
      </header>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/teacher/classes"
          className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">إدارة الفصول</h3>
              <p className="text-sm text-slate-600">أنشئي فصولاً وشاركي رمز الفصل</p>
            </div>
          </div>
        </Link>
        <Link
          href="/teacher/students"
          className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">إدارة الطالبات</h3>
              <p className="text-sm text-slate-600">أضيفي طالبات وربطيهن بالفصول</p>
            </div>
          </div>
        </Link>
        <Link
          href="/teacher/tests"
          className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-purple-500 p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">إدارة الاختبارات</h3>
              <p className="text-sm text-slate-600">أنشئي اختبارات واختاري الأسئلة</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Stats Cards - المطلوبة من المتطلبات */}
          <section className="grid gap-4 md:grid-cols-3">
            <KpiCard
              label="عدد الفصول"
              value={loadingStats ? "..." : stats?.classesCount?.toString() || "0"}
              hint="إجمالي الفصول المسجلة"
            />
            <KpiCard
              label="عدد الطالبات"
              value={loadingStats ? "..." : stats?.studentsCount?.toString() || "0"}
              hint="إجمالي الطالبات المسجلات"
            />
            <KpiCard
              label="المحاولات الأسبوعية"
              value={loadingStats ? "..." : stats?.weeklyAttempts?.toString() || "0"}
              hint="عدد المحاولات هذا الأسبوع"
            />
          </section>

          {/* Additional Stats Cards */}
          <section className="grid gap-4 md:grid-cols-4">
            <KpiCard
              label="متوسط الصف"
              value="74%"
              trend={{ value: "+6%", positive: true }}
              hint="أعلى بنسبة 8% من الفترة السابقة"
            />
            <KpiCard label="طالبات متقدمة" value="12" hint="من أصل 28 طالبة" />
            <KpiCard
              label="بحاجة لدعم"
              value="5"
              trend={{ value: "−2", positive: true }}
              hint="تم إغلاق 3 خطط علاجية"
            />
            <KpiCard label="أنشطة منجزة هذا الأسبوع" value="46" />
          </section>

          <section>
            <SectionHeader title="نقاط الضعف حسب المهارة" />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {weakSkills.map((item) => (
                <div key={item.skill} className="card space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.skill}
                    </h3>
                    <span className="badge bg-rose-50 text-rose-600">
                      {item.students} طالبات
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    تم اقتراح 3 أنشطة علاجية و5 أسئلة مستهدفة
                  </p>
                  <div className="flex gap-3">
                    <button className="flex-1 rounded-2xl border border-slate-200 py-2 text-sm font-semibold">
                      إرسال نشاط
                    </button>
                    <button className="flex-1 rounded-2xl bg-primary-600 py-2 text-sm font-semibold text-white">
                      خطة علاجية
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              title="ملخص الطالبات"
              subtitle="تابعي أداء كل طالبة ومقدار التحسن الأسبوعي"
              action={
                <button className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold">
                  تصدير XLSX
                </button>
              }
            />
            <div className="mt-4 overflow-hidden rounded-3xl border border-slate-100 bg-white">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">الطالبة</th>
                    <th className="px-6 py-3 font-semibold">الدرجة</th>
                    <th className="px-6 py-3 font-semibold">الحالة</th>
                    <th className="px-6 py-3 font-semibold">التحسن</th>
                    <th className="px-6 py-3 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.name} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4">{student.score}%</td>
                      <td className="px-6 py-4">
                        <span className="badge bg-slate-100 text-slate-600">
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-emerald-600">+{student.progress}%</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setActiveTab("students")}
                          className="text-primary-600 underline"
                        >
                          عرض التقرير
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Other Tabs - Quick Links */}
      {activeTab === "outcomes" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/outcomes"
            className="w-full h-[800px] border-0"
            title="خطة نافس"
          />
        </div>
      )}

      {activeTab === "students" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/students"
            className="w-full h-[800px] border-0"
            title="إدارة الطالبات"
          />
        </div>
      )}

      {activeTab === "activities" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/activities"
            className="w-full h-[800px] border-0"
            title="إدارة الأنشطة"
          />
        </div>
      )}

      {activeTab === "tests" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/tests"
            className="w-full h-[800px] border-0"
            title="إدارة الاختبارات"
          />
        </div>
      )}

    </main>
  );
}

