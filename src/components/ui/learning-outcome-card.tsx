import { LearningOutcome } from "@/lib/data";

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
          {item.indicators.map((indicator, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-primary-500 mt-1.5 text-xs">•</span>
              <span>{indicator}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

