export function MomentsGallery() {
  return (
    <section className="bg-white px-5 py-[60px] sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/*
          Mobile: simple 2-col flow with auto rows.
          md+: 6-col × 4-row bento grid (row heights 160px 80px 220px 120px).
        */}
        <div className="grid gap-[14px] grid-cols-2 auto-rows-[110px] md:auto-rows-auto md:[grid-template-columns:1fr_1.6fr_1.4fr_1.4fr_0.9fr_1.4fr] md:[grid-template-rows:160px_80px_220px_120px]">
          {/* ROW 1 */}
          {/* mb1 — Berry small square col1 row1 */}
          <div className="rounded-[20px] bg-brand-berry md:[grid-column:1] md:[grid-row:1]" />

          {/* mb2 — Sky wide col2-3 row1 */}
          <div className="rounded-[20px] bg-brand-sky md:[grid-column:2/4] md:[grid-row:1]" />

          {/* mb3 — Indigo wide col4-5 row1 */}
          <div className="rounded-[20px] bg-brand-indigo md:[grid-column:4/6] md:[grid-row:1]" />

          {/* mb4 — Gold col6 row1 */}
          <div className="rounded-[20px] bg-brand-gold md:[grid-column:6] md:[grid-row:1]" />

          {/* ROW 2 */}
          {/* mb5 — Olive small col5 row2 */}
          <div className="rounded-[20px] bg-brand-olive md:[grid-column:5] md:[grid-row:2]" />

          {/* mb6 — Indigo tall col6 rows2-3 */}
          <div className="rounded-[20px] bg-brand-indigo md:[grid-column:6] md:[grid-row:2/4]" />

          {/* mb7 — Gold tall portrait col1-2 rows2-4 */}
          <div className="rounded-[20px] bg-brand-gold md:[grid-column:1/3] md:[grid-row:2/5]" />

          {/* TITLE — centered col3-5 row2 */}
          <div className="col-span-2 flex items-center justify-center py-4 md:py-0 md:[grid-column:3/5] md:[grid-row:2]">
            <h2 className="text-center font-sans text-[1.25rem] font-bold uppercase tracking-[0.05em] text-brand-indigo sm:text-[1.45rem]">
              Shared Moments with KidPulse
            </h2>
          </div>

          {/* ROW 3 */}
          {/* mb8 — Sky tall col3 rows3-4 */}
          <div className="rounded-[20px] bg-brand-sky md:[grid-column:3] md:[grid-row:3/5]" />

          {/* mb9 — Berry landscape col4-5 row3 */}
          <div className="rounded-[20px] bg-brand-berry md:[grid-column:4/6] md:[grid-row:3]" />

          {/* ROW 4 */}
          {/* mb10 — Indigo deep small col4 row4 */}
          <div className="rounded-[20px] bg-brand-indigo-deep md:[grid-column:4] md:[grid-row:4]" />

          {/* mb11 — Peach wide col5-6 row4 */}
          <div className="rounded-[20px] bg-[#fce4d6] md:[grid-column:5/7] md:[grid-row:4]" />

        </div>
      </div>
    </section>
  );
}
