interface InfoPageHeroProps {
  title: string;
  subtitle?: string;
}

export function InfoPageHero({ title, subtitle }: InfoPageHeroProps) {
  return (
    <div className="bg-brand-indigo-deep px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-chewy text-[2rem] text-white sm:text-[2.5rem]">{title}</h1>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-[0.95rem] text-white/70">{subtitle}</p>}
      </div>
    </div>
  );
}
