import { LearningOutcome } from "@/lib/data";

// مسارات انفوجرافيك ناتج «الخلايا ووحدة بناء المخلوقات الحية» (مجلد الناتج الأول)
const INFOGRAPHIC_CELL_THEORY = "/images/activities/الناتج الأول/نظرية الخلية.png";
const INFOGRAPHIC_CELL_TYPES = "/images/activities/الناتج الأول/انواع الخلايا.png";
const INFOGRAPHIC_CELL_ACTIVITIES = "/images/activities/الناتج الأول/انشطة الخلايا.png";
// انفوجرافيك ناتج «تكامل أجهزة جسم الإنسان» (مجلد الناتج الثاني)
const INFOGRAPHIC_BODY_1_2 = "/images/activities/الناتج الثاني/1-2.png";
const INFOGRAPHIC_BODY_2_2 = "/images/activities/الناتج الثاني/2-2.png";
const INFOGRAPHIC_BODY_2_3 = "/images/activities/الناتج الثاني/2-3.png";
// انفوجرافيك ناتج «تصنيف المخلوقات الحية بنظام لينيوس» (مجلد الناتج الثالث)
const INFOGRAPHIC_LINNAEUS_3_1 = "/images/activities/الناتج الثالث/3-1.png";
const INFOGRAPHIC_LINNAEUS_3_2 = "/images/activities/الناتج الثالث/3-2.png";
const INFOGRAPHIC_LINNAEUS_3_3 = "/images/activities/الناتج الثالث/3-3.png";
// انفوجرافيك ناتج «انقسام الخلية وتكاثرها» (مجلد الناتج الرابع)
const INFOGRAPHIC_CELL_DIVISION_4_1 = "/images/activities/الناتج الرابع/4-1.png";

type Props = {
  item: LearningOutcome;
};

export function LearningOutcomeCard({ item }: Props) {
  const getDomainColor = (domain: string) => {
    if (domain.includes("علوم الحياة")) return "bg-emerald-100 text-emerald-700";
    if (domain.includes("العلوم الفيزيائية")) return "bg-blue-100 text-blue-700";
    if (domain.includes("علوم الأرض")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
  };

  const isCellTheoryOutcome = item.lesson === "الخلايا ووحدة بناء المخلوقات الحية";
  const isBodyIntegrationOutcome = item.lesson === "تكامل أجهزة جسم الإنسان";
  const isLinnaeusOutcome = item.lesson === "تصنيف المخلوقات الحية بنظام لينيوس";
  const isCellDivisionOutcome = item.lesson === "انقسام الخلية وتكاثرها";
  const getInfographicForIndicator = (index: number): { url: string; title: string } | null => {
    if (isCellTheoryOutcome) {
      if (index === 0 || index === 1) return { url: INFOGRAPHIC_CELL_THEORY, title: "انفوجرافيك نظرية الخلية" };
      if (index === 2) return { url: INFOGRAPHIC_CELL_TYPES, title: "انفوجرافيك انواع الخلايا" };
      if (index === 3) return { url: INFOGRAPHIC_CELL_ACTIVITIES, title: "انفوجرافيك انشطة الخلايا" };
    }
    if (isBodyIntegrationOutcome) {
      if (index === 0) return { url: INFOGRAPHIC_BODY_1_2, title: "انفوجرافيك 1-2" };
      if (index === 1) return { url: INFOGRAPHIC_BODY_2_2, title: "انفوجرافيك 2-2" };
      if (index === 2) return { url: INFOGRAPHIC_BODY_2_3, title: "انفوجرافيك 2-3" };
    }
    if (isLinnaeusOutcome) {
      if (index === 0) return { url: INFOGRAPHIC_LINNAEUS_3_1, title: "انفوجرافيك 3-1" };
      if (index === 1) return { url: INFOGRAPHIC_LINNAEUS_3_2, title: "انفوجرافيك 3-2" };
      if (index === 2) return { url: INFOGRAPHIC_LINNAEUS_3_3, title: "انفوجرافيك 3-3" };
    }
    if (isCellDivisionOutcome && index === 0) return { url: INFOGRAPHIC_CELL_DIVISION_4_1, title: "انفوجرافيك 4-1" };
    return null;
  };

  return (
    <div className="card space-y-4 border border-slate-50 hover:border-primary-200 transition">
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${getDomainColor(item.domain)}`}>
          {item.domain}
        </span>
        {item.week && (
          <span className="text-xs font-medium text-slate-400">{item.week}</span>
        )}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-slate-900">{item.lesson}</h4>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.outcome}</p>
      </div>
      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-primary-600">مؤشرات الأداء</p>
          <span className="text-xs text-slate-500">{item.indicators.length} مؤشر</span>
        </div>
        <ul className="space-y-2 pr-5 text-sm leading-6 text-slate-700">
          {item.indicators.map((indicator, index) => {
            const infographic = getInfographicForIndicator(index);
            return (
              <li key={index} className="flex gap-2 items-start">
                <span className="flex items-center gap-1.5 mt-1.5 flex-shrink-0">
                  {infographic ? (
                    <a
                      href={infographic.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
                      title={infographic.title}
                      aria-label={`عرض ${infographic.title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </a>
                  ) : null}
                  <span className="text-primary-500 text-xs">•</span>
                </span>
                <span>{indicator}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

