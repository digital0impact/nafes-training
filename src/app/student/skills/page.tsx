import { SkillBadge } from "@/components/ui/skill-badge";

const skillGroups = [
  {
    title: "علوم الحياة",
    items: [
      { name: "الخلية", score: 85, level: "متقنة" as const },
      { name: "التكاثر", score: 61, level: "متوسطة" as const }
    ]
  },
  {
    title: "العلوم الفيزيائية",
    items: [
      { name: "قوانين نيوتن", score: 40, level: "ضعيفة" as const },
      { name: "الطاقة", score: 72, level: "متوسطة" as const }
    ]
  },
  {
    title: "علوم الأرض والفضاء",
    items: [
      { name: "دورة الصخور", score: 78, level: "متقنة" as const },
      { name: "النظام الشمسي", score: 66, level: "متوسطة" as const }
    ]
  }
];

export default function SkillsPage() {
  return (
    <main className="space-y-8">
      <header className="card bg-white">
        <p className="text-sm text-slate-500">مهاراتي</p>
        <h1 className="text-3xl font-bold text-slate-900">نظرة تفصيلية</h1>
        <p className="mt-2 text-slate-600">
          تم تجميع المهارات حسب وحدات العلوم. الإشارات الحمراء توضح الحاجة
          للأنشطة العلاجية.
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        {skillGroups.map((group) => (
          <div key={group.title} className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {group.title}
              </h3>
              <span className="text-sm text-slate-500">
                {group.items.reduce((sum, item) => sum + item.score, 0) /
                  group.items.length}
                %
              </span>
            </div>
            <div className="space-y-3">
              {group.items.map((skill) => (
                <SkillBadge
                  key={skill.name}
                  label={skill.name}
                  value={skill.score}
                  level={skill.level}
                />
              ))}
            </div>
            <button className="w-full rounded-2xl border border-slate-200 py-2 text-sm font-semibold">
              أنشطة مقترحة
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}

