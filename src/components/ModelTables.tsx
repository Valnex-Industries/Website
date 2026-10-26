import type { ModelTable } from "@/lib/product-models";

/**
 * The per-model specification tables on a product page.
 *
 * One layout for every machine, whatever it is measured in: models across the
 * top, the machine's own metrics down the side. A series runs from two models
 * (laser marking) to fourteen (chillers), so the table scrolls sideways inside
 * its frame rather than squeezing, and the metric column stays pinned so a
 * figure is never read without its label. A value shared by every model is one
 * cell across the row, not the same text repeated fourteen times.
 *
 * Real table markup rather than an image of one, so the figures are text a
 * screen reader, a search engine or an answer engine can quote.
 */
export function ModelTables({ tables }: { tables: readonly ModelTable[] }) {
  return (
    <div className="mt-10 flex flex-col gap-12">
      {tables.map((table) => (
        <figure key={table.title} className="min-w-0">
          <figcaption className="flex items-baseline justify-between gap-4">
            <h3 className="text-base font-extrabold tracking-tight text-white md:text-lg">
              {table.title}
            </h3>
            <span className="eyebrow shrink-0 text-white/40">
              {table.models.length}{" "}
              {table.models.length === 1 ? "model" : "models"}
            </span>
          </figcaption>

          {/* An inquiry-page sheet: square, opaque, an orange rule on top. */}
          <div className="mt-4 border border-[color:var(--brand-blue)]/10 bg-white shadow-2xl shadow-black/10">
            <div aria-hidden="true" className="h-1 bg-[#f97316]" />
            <div className="overflow-x-auto overscroll-x-contain">
              {/* No min-w-max: the nowrap figure cells already hold the table
                open, and a long shared value (the hopper loader's options) is
                left free to wrap within that width instead of stretching it. */}
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--brand-blue)]/15">
                    <th
                      scope="col"
                      className="sticky left-0 z-10 bg-[#f8f9fa] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-blue)] md:px-5"
                    >
                      Model
                    </th>
                    {table.models.map((model) => (
                      <th
                        key={model}
                        scope="col"
                        className="whitespace-nowrap bg-[#f8f9fa] px-4 py-3 text-xs font-bold tracking-wide text-[color:var(--brand-blue)]"
                      >
                        {model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-[color:var(--brand-ink)]/8 last:border-b-0"
                    >
                      {/* Opaque, so the figures sliding under it while the table
                        scrolls do not show through the label. */}
                      <th
                        scope="row"
                        className="sticky left-0 z-10 w-[9.5rem] min-w-[9.5rem] bg-[#f8f9fa] px-4 py-3 text-xs font-light leading-snug text-[color:var(--brand-ink)]/60 sm:w-52 sm:min-w-52 md:px-5"
                      >
                        {row.label}
                      </th>
                      {row.values.length === 1 ? (
                        <td
                          colSpan={table.models.length}
                          className="px-4 py-3 font-medium text-[color:var(--brand-ink)]/85"
                        >
                          {/* Capped to roughly what is on screen beside the
                            pinned label, so a long shared value wraps where it
                            can be read instead of running off past the
                            scroll edge on a phone. */}
                          <span className="block max-w-[11rem] leading-snug sm:max-w-sm md:max-w-xl">
                            {row.values[0]}
                          </span>
                        </td>
                      ) : (
                        row.values.map((value, i) => (
                          <td
                            key={table.models[i]}
                            className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-[color:var(--brand-ink)]/85"
                          >
                            {value}
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {table.note && (
            <p className="mt-3 text-xs font-light leading-relaxed text-white/40">
              {table.note}
            </p>
          )}
          {/* A phone shows two or three models at a time; say there are more
              rather than relying on a scrollbar mobile browsers hide. */}
          {table.models.length > 2 && (
            <p className="mt-2 text-xs font-light text-white/35 md:hidden">
              Swipe the table sideways for every model.
            </p>
          )}
        </figure>
      ))}
    </div>
  );
}
