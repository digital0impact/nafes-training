type SkillBadgeProps = {
  label: string;
  level: "متقنة" | "متوسطة" | "ضعيفة";
  value: number;
};

const palette = {
  متقنة: "bg-emerald-50 text-emerald-600",
  متوسطة: "bg-amber-50 text-amber-600",
  ضعيفة: "bg-rose-50 text-rose-600"
} as const;

export function SkillBadge({ label, level, value }: SkillBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-soft/30">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}%</p>
      </div>
      <span className={`badge text-sm ${palette[level]}`}>{level}</span>
    </div>
  );
}

