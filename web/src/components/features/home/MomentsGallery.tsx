import Image from 'next/image';

interface MomentsItem {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

async function getMomentsItems(): Promise<MomentsItem[]> {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/v1/moments`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

// Fixed card layout — 11 slots matching the bento grid
const CARD_CLASSES = [
  'rounded-[20px] overflow-hidden md:[grid-column:1] md:[grid-row:1]',
  'rounded-[20px] overflow-hidden md:[grid-column:2/4] md:[grid-row:1]',
  'rounded-[20px] overflow-hidden md:[grid-column:4/6] md:[grid-row:1]',
  'rounded-[20px] overflow-hidden md:[grid-column:6] md:[grid-row:1]',
  'rounded-[20px] overflow-hidden md:[grid-column:5] md:[grid-row:2]',
  'rounded-[20px] overflow-hidden md:[grid-column:6] md:[grid-row:2/4]',
  'rounded-[20px] overflow-hidden md:[grid-column:1/3] md:[grid-row:2/5]',
  'rounded-[20px] overflow-hidden md:[grid-column:3] md:[grid-row:3/5]',
  'rounded-[20px] overflow-hidden md:[grid-column:4/6] md:[grid-row:3]',
  'rounded-[20px] overflow-hidden md:[grid-column:4] md:[grid-row:4]',
  'rounded-[20px] overflow-hidden md:[grid-column:5/7] md:[grid-row:4]',
];

// Fallback colours when no image is uploaded yet for a slot
const FALLBACK_COLORS = [
  'bg-brand-berry',
  'bg-brand-sky',
  'bg-brand-indigo',
  'bg-brand-gold',
  'bg-brand-olive',
  'bg-brand-indigo',
  'bg-brand-gold',
  'bg-brand-sky',
  'bg-brand-berry',
  'bg-brand-indigo-deep',
  'bg-[#fce4d6]',
];

export async function MomentsGallery() {
  const items = await getMomentsItems();

  return (
    <section className="bg-white px-5 py-[60px] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-[14px] grid-cols-2 auto-rows-[110px] md:auto-rows-auto md:[grid-template-columns:1fr_1.6fr_1.4fr_1.4fr_0.9fr_1.4fr] md:[grid-template-rows:160px_80px_220px_120px]">

          {CARD_CLASSES.map((cls, i) => {
            const item = items[i];
            return (
              <div key={i} className={`${cls} ${!item ? FALLBACK_COLORS[i] : ''}`}>
                {item && (
                  <div className="relative w-full h-full min-h-[110px]">
                    <Image
                      src={item.imageUrl}
                      alt={`Gallery image ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Title — always in position between slot 6 and 7 */}
          <div className="col-span-2 flex items-center justify-center py-4 md:py-0 md:[grid-column:3/5] md:[grid-row:2]">
            <h2 className="text-center font-sans text-[1.25rem] font-bold uppercase tracking-[0.05em] text-brand-indigo sm:text-[1.45rem]">
              Shared Moments with KidPulse
            </h2>
          </div>

        </div>
      </div>
    </section>
  );
}