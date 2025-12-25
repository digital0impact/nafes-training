type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        {subtitle ? (
          <p className="text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

