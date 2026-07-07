const items = [
    { icon: '🚚', label: 'Islandwide Delivery', color: 'bg-brand-gold' },
    { icon: '🔒', label: 'Secure Bank & Card Payments', color: 'bg-brand-berry' },
    { icon: '↩️', label: '7-Day Easy Returns', color: 'bg-brand-sky' },
    { icon: '💬', label: 'WhatsApp Order Support', color: 'bg-brand-olive' },
  ];
  
  export function DeliveryStrip() {
    return (
      <div className="bg-white px-8 pb-6 pt-2">
        <div className="mx-auto max-w-7xl rounded-[18px] bg-brand-indigo p-6 grid grid-cols-4 gap-3">
          {items.map(({ icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.08] px-[18px] py-4 text-[0.86rem] font-semibold text-white"
            >
              <span className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] text-xl ${color}`}>
                {icon}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }