import Link from "next/link";

type ActivityCardProps = {
  id?: string;
  title: string;
  description: string;
  duration: string;
  skill: string;
  type?: string;
  image?: string;
  targetLevel?: "متقدمة" | "متوسطة" | "تحتاج دعم";
};

const skillColors: Record<string, string> = {
  "علوم الحياة": "bg-emerald-50 text-emerald-700",
  "العلوم الفيزيائية": "bg-blue-50 text-blue-700",
  "علوم الأرض والفضاء": "bg-amber-50 text-amber-700"
};

export function ActivityCard({
  id,
  title,
  description,
  duration,
  skill,
  type,
  image,
  targetLevel
}: ActivityCardProps) {
  const canLaunch = Boolean(type && id);
  const skillColor = skillColors[skill] || "bg-primary-50 text-primary-700";

  return (
    <div className="group card space-y-4 overflow-hidden transition-all hover:shadow-lg">
      {/* Header with badge */}
      <div className="flex items-start justify-between gap-2">
        <span className={`badge ${skillColor}`}>{skill}</span>
        {targetLevel && (
          <span className="text-xs font-medium text-slate-500">{targetLevel}</span>
        )}
      </div>

      {/* Image if available */}
      {image && (
        <div className="relative -mx-6 -mt-6 h-40 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="space-y-2">
        <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{duration}</span>
        </div>
        {type && (
          <span className="text-lg">
            {type === "quiz" ? "📝" : type === "drag-drop" ? "🖱️" : "📚"}
          </span>
        )}
      </div>

      {/* Action Button */}
      {canLaunch ? (
        <Link
          href={`/student/activities/${id}`}
          className="block w-full rounded-2xl bg-primary-600 py-3 text-center font-semibold text-white transition hover:bg-primary-700"
        >
          ابدئي النشاط
        </Link>
      ) : (
        <button
          className="w-full rounded-2xl bg-slate-100 py-3 font-semibold text-slate-400"
          disabled
        >
          قريباً
        </button>
      )}
    </div>
  );
}

