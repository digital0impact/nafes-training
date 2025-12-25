type KpiCardProps = {
  label: string;
  value: string;
  trend?: {
    value: string;
    positive?: boolean;
  };
  hint?: string;
};

export function KpiCard({ label, value, trend, hint }: KpiCardProps) {
  return (
    <div className="card space-y-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {trend ? (
        <p
          className={`text-sm font-medium ${
            trend.positive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {trend.positive ? "▲" : "▼"} {trend.value}
        </p>
      ) : null}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

