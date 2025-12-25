type ProgressCardProps = {
  label: string;
  value: number;
  accent?: string;
};

export function ProgressCard({ label, value, accent = "bg-primary-500" }: ProgressCardProps) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="text-lg font-semibold text-slate-900">{value}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-100">
        <div
          className={`h-3 rounded-full ${accent}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

