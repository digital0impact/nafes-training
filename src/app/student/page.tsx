"use client"

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { quickSkills } from "@/lib/data";
import { SectionHeader } from "@/components/ui/section-header";
import { SkillBadge } from "@/components/ui/skill-badge";
import { ProgressCard } from "@/components/ui/progress-card";
import { StudentAuthGuard, useStudentAuth } from "@/components/student";

const quickActions = [
  { label: "محاكاة اختبار نافس", href: "/student/simulation/select", accent: "bg-primary-600" },
  { label: "التدريب السريع", href: "/student/skills", accent: "bg-accent-500" },
  { label: "مهاراتي", href: "/student/skills", accent: "bg-emerald-500" },
  { label: "الألعاب التعليمية", href: "/student/games", accent: "bg-purple-500" }
];

function StudentHomeContent() {
  const { student } = useStudentAuth()

  return (
    <main className="space-y-10">
      <header className="card bg-primary-600 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm opacity-80">مرحبا {student?.name || "طالبة"}</p>
            <h1 className="text-3xl font-bold">جاهزتك الحالية: متوسطة</h1>
            <p className="mt-2 text-white/80">
              استمري في التدريب عبر الألعاب التعليمية لتحسين مهاراتك.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 px-6 py-4 text-center">
            <p className="text-sm">درجة المحاكاة الأخيرة</p>
            <p className="text-4xl font-bold">68%</p>
            <p className="text-emerald-200">+12% خلال أسبوع</p>
          </div>
        </div>
      </header>

      <section>
        <SectionHeader title="إجراءات سريعة" subtitle="اختاري ما يناسبك لبدء التدريب الآن" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-3xl border border-slate-100 bg-white p-6 text-center font-semibold text-slate-900 shadow-soft transition hover:-translate-y-1"
              style={{ boxShadow: "0 12px 20px rgba(15, 23, 42, 0.05)" }}
            >
              <span className={`badge mb-3 text-white ${action.accent}`}>جاهزة</span>
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="ملف مهاراتي"
          subtitle="تابعي مستوى كل مهارة ومعرفة الأنشطة المقترحة"
          action={
            <Link href="/student/skills" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold">
              عرض جميع المهارات
            </Link>
          }
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {quickSkills.map((skill) => (
            <SkillBadge
              key={skill.name}
              label={skill.name}
              value={skill.score}
              level={skill.level}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <SectionHeader
            title="الألعاب التعليمية"
            subtitle="ابدئي من هنا واستمتعي بالتعلم"
            action={
              <Link href="/student/games" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold">
                عرض جميع الألعاب
              </Link>
            }
          />
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🎮</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">جاهزة للبدء</h3>
                <p className="mt-1 text-sm text-slate-700">
                  اختاري فصلًا ثم ابدئي اللعب. كل لعبة قصيرة وتساعدك على فهم الدرس بسرعة.
                </p>
                <Link
                  href="/student/games"
                  className="mt-4 inline-block rounded-2xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  ابدئي اللعب الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <SectionHeader title="تقدم الأسبوع" />
          <ProgressCard label="إنجاز الألعاب" value={76} />
          <ProgressCard label="تغطية المهارات" value={62} accent="bg-accent-500" />
          <ProgressCard label="الأسئلة المجابة" value={88} accent="bg-emerald-500" />
        </div>
      </section>
    </main>
  );
}

export default function StudentHome() {
  return (
    <StudentAuthGuard>
      <StudentHomeContent />
    </StudentAuthGuard>
  );
}
