import { ActivityForm } from "@/components/activities/activity-form";
import { SectionHeader } from "@/components/ui/section-header";
import Link from "next/link";

export default function CreateActivityPage() {
  return (
    <main className="space-y-6">
      <header className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">إدارة الأنشطة</p>
            <h1 className="text-3xl font-bold text-slate-900">إنشاء نشاط جديد</h1>
            <p className="mt-2 text-slate-600">
              أنشئي أنشطة تفاعلية للطالبات لتعزيز فهمهن للمفاهيم العلمية.
            </p>
          </div>
          <Link
            href="/teacher/activities"
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            ← العودة للإدارة
          </Link>
        </div>
      </header>

      <section>
        <SectionHeader title="نموذج إنشاء النشاط" />
        <ActivityForm />
      </section>
    </main>
  );
}



