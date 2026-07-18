interface AccountCardProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AccountCard({ title, subtitle, actions, children }: AccountCardProps) {
  return (
    <section className="rounded-[16px] border border-brand-line bg-white p-6 max-[980px]:p-4">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-chewy text-[1.4rem] text-brand-indigo">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-[0.88rem] text-brand-ink-soft">{subtitle}</p>
          )}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}
