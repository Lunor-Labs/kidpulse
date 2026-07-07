const TESTIMONIALS = [
  {
    quote: "My daughter spent hours painting instead of watching cartoons. The quality is amazing and she's so proud of what she made!",
    name: 'Nadeesha',
    city: 'Colombo',
    avatarBg: 'bg-brand-berry',
  },
  {
    quote: 'The perfect birthday return gift. All the other parents asked where I got them — ordered another batch the next week!',
    name: 'Tharindu',
    city: 'Kandy',
    avatarBg: 'bg-brand-sky-deep',
  },
  {
    quote: 'Excellent quality and so easy to use. My 5-year-old finished it almost on his own. Educational and fun.',
    name: 'Dilushi',
    city: 'Galle',
    avatarBg: 'bg-brand-olive',
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-8 pb-[60px]">

      {/* Section header — centered */}
      <div className="mb-[30px] flex flex-col items-center text-center">
        <span className="mb-[6px] block font-display text-[0.95rem] font-normal tracking-[0.04em] text-brand-berry">
          5,000+ happy parents
        </span>
        <h2 className="font-display text-[2.1rem] font-normal text-brand-indigo">
          What Parents Say
        </h2>
      </div>

      {/* 3-col grid */}
      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className="relative rounded-[18px] border border-brand-line bg-white p-6"
          >
            {/* Decorative opening quote */}
            <span
              aria-hidden
              className="absolute right-5 top-3 font-serif text-[3.5rem] leading-none text-brand-gold opacity-40"
            >
              &ldquo;
            </span>

            {/* Stars */}
            <div className="mb-[10px] text-[0.85rem] text-brand-gold-deep">
              ★★★★★
            </div>

            {/* Quote */}
            <blockquote className="mb-4 text-[0.92rem] italic leading-relaxed text-brand-ink-soft">
              {t.quote}
            </blockquote>

            {/* Author */}
            <figcaption className="flex items-center gap-[10px]">
              <span
                aria-hidden
                className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full ${t.avatarBg} text-[0.85rem] font-bold text-white`}
              >
                {t.name[0]}
              </span>
              <span>
                <span className="block text-[0.85rem] font-bold text-brand-ink">
                  {t.name}
                </span>
                <span className="block text-[0.74rem] text-brand-ink-soft">
                  {t.city}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}