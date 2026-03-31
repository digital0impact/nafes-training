import { LearningOutcome } from "@/lib/data";
import {
  getInfographicForLessonIndicator,
  getInfographicsForLesson,
} from "@/lib/learning-outcome-infographics";

type Props = {
  item: LearningOutcome;
};

export function LearningOutcomeCard({ item }: Props) {
  const infographics = getInfographicsForLesson(item.lesson);

  const getDomainColor = (domain: string) => {
    if (domain.includes("علوم الحياة")) return "bg-emerald-100 text-emerald-700";
    if (domain.includes("العلوم الفيزيائية")) return "bg-blue-100 text-blue-700";
    if (domain.includes("علوم الأرض")) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-700";
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
            const infographic = getInfographicForLessonIndicator(item.lesson, index);
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

        {infographics.length > 0 && (
          <div className="mt-4 border-t border-slate-200 pt-3">
            <p className="mb-2 text-xs font-semibold text-slate-500">الإنفوجرافيك (مصغرات)</p>
            <div className="grid grid-cols-2 gap-2">
              {infographics.map((infographic, index) => (
                <a
                  key={`${item.lesson}-${infographic.url}-${index}`}
                  href={infographic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white"
                  title={infographic.title}
                  aria-label={`عرض ${infographic.title}`}
                >
                  <img
                    src={infographic.url}
                    alt={infographic.title}
                    className="h-20 w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="border-t border-slate-200 px-2 py-1 text-center text-[11px] text-slate-600">
                    {infographic.title}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

