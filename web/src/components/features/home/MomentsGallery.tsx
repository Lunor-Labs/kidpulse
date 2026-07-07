export function MomentsGallery() {
  return (
    <section className="bg-white px-8 py-[60px]">
      <div className="mx-auto max-w-7xl">

        {/*
          6-col × 4-row bento grid
          Row heights: 160px 80px 220px 120px
        */}
        <div
          className="grid gap-[14px]"
          style={{
            gridTemplateColumns: '1fr 1.6fr 1.4fr 1.4fr 0.9fr 1.4fr',
            gridTemplateRows: '160px 80px 220px 120px',
          }}
        >
          {/* ROW 1 */}
          {/* mb1 — Berry small square col1 row1 */}
          <div
            className="rounded-[20px] bg-brand-berry"
            style={{ gridColumn: '1', gridRow: '1' }}
          />

          {/* mb2 — Sky wide col2-3 row1 */}
          <div
            className="rounded-[20px] bg-brand-sky"
            style={{ gridColumn: '2/4', gridRow: '1' }}
          />

          {/* mb3 — Indigo wide col4-5 row1 */}
          <div
            className="rounded-[20px] bg-brand-indigo"
            style={{ gridColumn: '4/6', gridRow: '1' }}
          />

          {/* mb4 — Gold col6 row1 */}
          <div
            className="rounded-[20px] bg-brand-gold"
            style={{ gridColumn: '6', gridRow: '1' }}
          />

          {/* ROW 2 */}
          {/* mb5 — Olive small col5 row2 */}
          <div
            className="rounded-[20px] bg-brand-olive"
            style={{ gridColumn: '5', gridRow: '2' }}
          />

          {/* mb6 — Indigo tall col6 rows2-3 */}
          <div
            className="rounded-[20px] bg-brand-indigo"
            style={{ gridColumn: '6', gridRow: '2/4' }}
          />

          {/* mb7 — Gold tall portrait col1-2 rows2-4 */}
          <div
            className="rounded-[20px] bg-brand-gold"
            style={{ gridColumn: '1/3', gridRow: '2/5' }}
          />

          {/* TITLE — centered col3-5 row2 */}
          <div
            className="flex items-center justify-center"
            style={{ gridColumn: '3/5', gridRow: '2' }}
          >
            <h2
              className="text-center font-sans text-[1.45rem] font-bold uppercase tracking-[0.05em] text-brand-indigo"
            >
              Shared Moments with KidPulse
            </h2>
          </div>

          {/* ROW 3 */}
          {/* mb8 — Sky tall col3 rows3-4 */}
          <div
            className="rounded-[20px] bg-brand-sky"
            style={{ gridColumn: '3', gridRow: '3/5' }}
          />

          {/* mb9 — Berry landscape col4-5 row3 */}
          <div
            className="rounded-[20px] bg-brand-berry"
            style={{ gridColumn: '4/6', gridRow: '3' }}
          />

          {/* ROW 4 */}
          {/* mb10 — Indigo deep small col4 row4 */}
          <div
            className="rounded-[20px] bg-brand-indigo-deep"
            style={{ gridColumn: '4', gridRow: '4' }}
          />

          {/* mb11 — Peach wide col5-6 row4 */}
          <div
            className="rounded-[20px]"
            style={{ gridColumn: '5/7', gridRow: '4', background: '#fce4d6' }}
          />

        </div>
      </div>
    </section>
  );
}