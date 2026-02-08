"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-client";
import { KpiCard } from "@/components/ui/kpi-card";
import { SectionHeader } from "@/components/ui/section-header";
import { type SubscriptionPlan } from "@/lib/subscription";


type TabType = "overview" | "outcomes" | "tests" | "games" | "classes";

type DashboardStats = {
  classesCount: number;
  studentsCount: number;
  weeklyAttempts: number;
  averageScore?: number;
  advancedStudents?: number;
  needSupportStudents?: number;
  weeklyActivities?: number;
  recentStudents?: Array<{
    id: string;
    nickname: string;
    latestScore?: number;
    trend?: number;
  }>;
};

export default function TeacherDashboard() {
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [classesSubTab, setClassesSubTab] = useState<"classes" | "students">("classes");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const subscriptionPlan = (user?.subscriptionPlan || "free") as SubscriptionPlan;

  // تفعيل mounted بعد التحميل
  useEffect(() => {
    setMounted(true);
  }, []);

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

    if (mounted && activeTab === "overview") {
      fetchStats();
    }
  }, [activeTab, mounted]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  // عرض شاشة تحميل أثناء التهيئة
  if (!mounted) {
    return (
      <main className="space-y-10">
        <div className="card bg-white p-8 text-center">
          <p className="text-slate-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-6 p-3 sm:p-4 md:space-y-10">
      <header className="card bg-white p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">لوحة المعلمة</p>
            {user && (
              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl truncate">
                مرحباً، {user.name}
              </h1>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/teacher/subscription"
              className={`min-h-[44px] inline-flex items-center text-sm font-semibold px-3 py-2 rounded-lg touch-manipulation ${
                subscriptionPlan === "premium"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {subscriptionPlan === "premium" ? "مميز" : "مجاني"}
            </Link>
            <Link
              href="/teacher/subscription"
              className="min-h-[44px] inline-flex items-center rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition touch-manipulation"
            >
              إدارة الاشتراك
            </Link>
            <Link
              href="/teacher/visitors"
              className="min-h-[44px] inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition touch-manipulation"
            >
              إدارة الزوار
            </Link>
            <Link
              href="/teacher/audit-log"
              className="min-h-[44px] hidden sm:inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition touch-manipulation"
            >
              سجل التدقيق
            </Link>
            <button
              onClick={handleSignOut}
              className="min-h-[44px] inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition touch-manipulation"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
        
        {/* Tabs - scroll on mobile */}
        <div className="flex gap-1 border-b border-primary-200 overflow-x-auto pb-px -mx-1 px-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <button
            onClick={() => setActiveTab("overview")}
            className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
              activeTab === "overview"
                ? "text-primary-700 border-primary-600"
                : "text-slate-500 border-transparent hover:text-primary-600"
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab("outcomes")}
            className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
              activeTab === "outcomes"
                ? "text-primary-700 border-primary-600"
                : "text-slate-500 border-transparent hover:text-primary-600"
            }`}
          >
            خطة نافس
          </button>
          <button
            onClick={() => setActiveTab("tests")}
            className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
              activeTab === "tests"
                ? "text-primary-700 border-primary-600"
                : "text-slate-500 border-transparent hover:text-primary-600"
            }`}
          >
            إدارة الاختبارات
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
              activeTab === "games"
                ? "text-purple-700 border-purple-600"
                : "text-slate-500 border-transparent hover:text-purple-600"
            }`}
          >
            الألعاب التعليمية
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
              activeTab === "classes"
                ? "text-emerald-700 border-emerald-600"
                : "text-slate-500 border-transparent hover:text-emerald-600"
            }`}
          >
            إدارة الفصول والطلاب
          </button>
        </div>
      </header>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Stats Cards - المطلوبة من المتطلبات */}
          <section className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
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
          <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <KpiCard
              label="متوسط الصف"
              value={loadingStats ? "..." : stats?.averageScore ? `${stats.averageScore}%` : "0%"}
              hint="متوسط درجات الطالبات في الاختبارات"
            />
            <KpiCard 
              label="طالبات متقدمة" 
              value={loadingStats ? "..." : stats?.advancedStudents?.toString() || "0"} 
              hint={`من أصل ${stats?.studentsCount || 0} طالبة`}
            />
            <KpiCard
              label="بحاجة لدعم"
              value={loadingStats ? "..." : stats?.needSupportStudents?.toString() || "0"}
              hint="طالبات بحاجة لمتابعة إضافية"
            />
            <KpiCard 
              label="ألعاب منجزة هذا الأسبوع" 
              value={loadingStats ? "..." : stats?.weeklyActivities?.toString() || "0"}
            />
          </section>

          {/* جدول الطالبات */}
          {stats?.recentStudents && stats.recentStudents.length > 0 && (
            <section>
              <SectionHeader
                title="ملخص الطالبات"
                subtitle="تابعي أداء كل طالبة ومقدار التحسن"
                action={
                  <Link
                    href="/teacher/reports"
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    عرض جميع التقارير
                  </Link>
                }
              />
              <div className="mt-4 overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-100 bg-white">
                <table className="w-full min-w-[480px] text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold sm:px-6 sm:py-3">الطالبة</th>
                      <th className="px-3 py-2.5 font-semibold sm:px-6 sm:py-3">الدرجة</th>
                      <th className="px-3 py-2.5 font-semibold sm:px-6 sm:py-3">الحالة</th>
                      <th className="px-3 py-2.5 font-semibold sm:px-6 sm:py-3">التحسن</th>
                      <th className="px-3 py-2.5 font-semibold sm:px-6 sm:py-3">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentStudents.map((student) => {
                      const latestScore = student.latestScore ?? 0
                      const trend = student.trend ?? 0
                      const status =
                        latestScore >= 80
                          ? "متقدمة"
                          : latestScore >= 60
                            ? "جيدة"
                            : "بحاجة لدعم"
                      const statusColor =
                        latestScore >= 80
                          ? "bg-emerald-100 text-emerald-700"
                          : latestScore >= 60
                            ? "bg-blue-100 text-blue-700"
                            : "bg-rose-100 text-rose-700"
                      
                      return (
                        <tr key={student.id} className="border-t border-slate-100">
                          <td className="px-3 py-3 font-semibold text-slate-900 sm:px-6 sm:py-4">
                            {student.nickname}
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">{latestScore}%</td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            <span className={`badge ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                          <td className={`px-3 py-3 sm:px-6 sm:py-4 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trend >= 0 ? '+' : ''}{trend}%
                          </td>
                          <td className="px-3 py-3 sm:px-6 sm:py-4">
                            <Link
                              href={`/teacher/reports?student=${student.id}`}
                              className="text-primary-600 underline touch-manipulation"
                            >
                              عرض التقرير
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      {/* Other Tabs - Quick Links */}
      {activeTab === "outcomes" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/outcomes"
            className="w-full min-h-[70vh] sm:h-[800px] border-0"
            title="خطة نافس"
          />
        </div>
      )}

      {activeTab === "classes" && (
        <div className="space-y-6">
          {/* Sub Tabs */}
          <div className="card p-0 overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50">
              <button
                onClick={() => setClassesSubTab("classes")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors border-b-2 ${
                  classesSubTab === "classes"
                    ? "text-emerald-700 border-emerald-600 bg-white"
                    : "text-slate-500 border-transparent hover:text-emerald-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  إدارة الفصول
                </div>
              </button>
              <button
                onClick={() => setClassesSubTab("students")}
                className={`flex-1 px-6 py-4 font-semibold transition-colors border-b-2 ${
                  classesSubTab === "students"
                    ? "text-blue-700 border-blue-600 bg-white"
                    : "text-slate-500 border-transparent hover:text-blue-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  إدارة الطلاب
                </div>
              </button>
            </div>
          </div>

          {/* Sub Tab Content */}
          {classesSubTab === "classes" ? (
            <div className="card p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border-b border-emerald-200">
                <h2 className="text-xl font-bold text-slate-900">إدارة الفصول</h2>
                <p className="text-sm text-slate-600 mt-1">قومي بإنشاء الفصول ومشاركة رمز الانضمام</p>
              </div>
              <iframe
                src="/teacher/classes"
                className="w-full min-h-[60vh] sm:h-[600px] border-0"
                title="إدارة الفصول"
              />
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
                <h2 className="text-xl font-bold text-slate-900">إدارة الطالبات</h2>
                <p className="text-sm text-slate-600 mt-1">أضيفي طالبات وربطيهن بالفصول</p>
              </div>
              <iframe
                src="/teacher/students"
                className="w-full min-h-[60vh] sm:h-[600px] border-0"
                title="إدارة الطالبات"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "games" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/games"
            className="w-full min-h-[70vh] sm:h-[800px] border-0"
            title="الألعاب التعليمية"
          />
        </div>
      )}

      {activeTab === "tests" && (
        <div className="card p-0 overflow-hidden">
          <iframe
            src="/teacher/tests"
            className="w-full min-h-[70vh] sm:h-[800px] border-0"
            title="إدارة الاختبارات"
          />
        </div>
      )}

    </main>
  );
}

