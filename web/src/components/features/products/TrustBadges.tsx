const BADGES = [
    { icon: '🚚', label: 'Free delivery over Rs. 5,000', bg: 'bg-[#fff4e0]' },
    { icon: '↩️', label: '7-day easy returns',           bg: 'bg-[#fde9f0]' },
    { icon: '🔒', label: 'Secure checkout',              bg: 'bg-[#e7f6ff]' },
    { icon: '💬', label: 'WhatsApp support',             bg: 'bg-[#eef8e1]' },
  ];
  
  export function TrustBadges() {
    return (
      <div className="rounded-[18px] border border-brand-line bg-white p-4">
        <div className="flex flex-col gap-3">
          {BADGES.map(({ icon, label, bg }) => (
            <div key={label} className="flex items-center gap-3 text-[0.82rem] text-brand-ink-soft">
              <span
                className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] text-base ${bg}`}
              >
                {icon}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }