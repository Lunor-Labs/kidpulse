export function TrustRow() {
    const items = [
      'Child-safe materials',
      '4.9 average rating',
      '5,000+ happy families',
    ];
  
    return (
      <div className="bg-white px-8 pb-3 pt-6">
        <div className="mx-auto max-w-7xl rounded-[18px] bg-brand-indigo-deep px-6 py-4 flex justify-center items-center gap-12 flex-wrap">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-2 text-[0.84rem] font-bold text-white/90">
              <svg
                className="h-4 w-4 shrink-0 text-brand-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }