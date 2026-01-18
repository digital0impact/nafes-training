"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageBackground } from "@/components/layout/page-background";
import type { Activity } from "@/lib/activities";

export default function EditActivityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skill: "علوم الحياة",
    duration: "",
    outcomeLesson: "",
    targetLevel: "",
  });

  useEffect(() => {
    setMounted(true);
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setActivity(data.activity);
        setFormData({
          title: data.activity.title || "",
          description: data.activity.description || "",
          skill: data.activity.skill || "علوم الحياة",
          duration: data.activity.duration || "",
          outcomeLesson: data.activity.outcomeLesson || "",
          targetLevel: data.activity.targetLevel || "",
        });
      } else {
        setMessage({ type: "error", text: "لم يتم العثور على النشاط" });
      }
    } catch (error) {
      console.error("Error loading activity:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء تحميل النشاط" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/activities/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "تم حفظ التعديلات بنجاح!" });
        setTimeout(() => {
          router.push("/teacher/activities");
        }, 2000);
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "حدث خطأ أثناء الحفظ" });
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      setMessage({ type: "error", text: "حدث خطأ أثناء حفظ التعديلات" });
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) {
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

  if (!activity) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 p-4 py-8">
          <div className="card text-center">
            <p className="text-rose-600">لم يتم العثور على النشاط</p>
            <Link
              href="/teacher/activities"
              className="mt-4 inline-block rounded-2xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
            >
              العودة للأنشطة
            </Link>
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
        <header className="card bg-gradient-to-br from-white to-primary-50">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/teacher/activities"
              className="text-primary-600 hover:text-primary-700"
            >
              ← العودة للأنشطة
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">✏️ تعديل النشاط</h1>
          <p className="mt-2 text-slate-600">
            قومي بتعديل معلومات النشاط الأساسية
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

        {/* Form */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-slate-900">معلومات النشاط</h2>

          <div>
            <label className="text-sm font-semibold text-slate-600">عنوان النشاط</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">وصف النشاط</label>
            <textarea
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-slate-600">المجال</label>
              <select
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
                value={formData.skill}
                onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              >
                <option value="علوم الحياة">علوم الحياة</option>
                <option value="العلوم الفيزيائية">العلوم الفيزيائية</option>
                <option value="علوم الأرض والفضاء">علوم الأرض والفضاء</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">المدة المقدرة</label>
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="مثال: 15 دقيقة"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">ناتج التعلم المرتبط (اختياري)</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={formData.outcomeLesson}
              onChange={(e) => setFormData({ ...formData, outcomeLesson: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600">المستوى المستهدف (اختياري)</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
              value={formData.targetLevel}
              onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value })}
            >
              <option value="">اختر المستوى</option>
              <option value="متقدمة">متقدمة</option>
              <option value="متوسطة">متوسطة</option>
              <option value="تحتاج دعم">تحتاج دعم</option>
            </select>
          </div>
        </div>

        {/* Info */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">💡 ملاحظة</h3>
          <p className="text-sm text-blue-800">
            • لا يمكن تعديل الأسئلة أو أزواج المطابقة من هنا
            <br />
            • يمكنك فقط تعديل المعلومات الأساسية للنشاط
            <br />
            • لإنشاء نشاط جديد بأسئلة مختلفة، قومي بإنشاء نشاط جديد
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-2xl bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <Link
            href="/teacher/activities"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            إلغاء
          </Link>
        </div>
      </div>
    </main>
  );
}
