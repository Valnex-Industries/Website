import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { productHref, type Product } from "@/lib/products";

/** The processes worth a row, in the order a plastics plant would name them.
 *  A process shows only if at least one product lists it. */
const PROCESSES = [
  {
    name: "Injection moulding",
    body: "Cooling the mould and the oil, holding mould temperature and drying resin before it reaches the barrel.",
  },
  {
    name: "Blow moulding",
    body: "Chilled water for the moulds and dry material for every shot.",
  },
  {
    name: "Extrusion",
    body: "Process cooling, temperature control on the line and pre-dried granules at the hopper.",
  },
  {
    name: "Die casting",
    body: "Oil-circulating temperature control to hold the die at working temperature.",
  },
];

/**
 * Which Valnex machines serve which process, derived from each product's
 * `applications` in the catalogue rather than written out by hand, so a
 * product only appears against a process the company has confirmed it is
 * built for.
 */
export function AboutProcesses({ products }: { products: Product[] }) {
  const rows = PROCESSES.map((process) => ({
    ...process,
    products: products.filter((product) =>
      product.applications.includes(process.name),
    ),
  })).filter((row) => row.products.length > 0);

  if (rows.length === 0) return null;

  return (
    <section
      aria-labelledby="processes-heading"
      className="relative bg-[color:var(--brand-blue-deep)] py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.06]"
      />
      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <Reveal>
          <h2
            id="processes-heading"
            className="max-w-3xl text-[clamp(1.9rem,4.2vw,3.25rem)] font-black leading-[1.02] tracking-tight text-white"
          >
            Built for moulding and extrusion lines.
          </h2>
          <p className="mt-6 max-w-[60ch] text-base font-light leading-relaxed text-white/70 md:text-lg">
            Valnex equipment works beside the press and the extruder. These are
            the processes each machine is built for, as listed on its own
            product page.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-white/10 md:mt-16 md:grid-cols-2">
          {rows.map((row, i) => (
            <Reveal
              key={row.name}
              delay={i * 0.06}
              className="bg-[color:var(--brand-blue-deep)]"
            >
              <div className="flex h-full flex-col gap-5 p-6 md:p-8">
                <h3 className="text-xl font-black tracking-tight text-white md:text-2xl">
                  {row.name}
                </h3>
                <p className="max-w-[46ch] text-[15px] font-light leading-relaxed text-white/65">
                  {row.body}
                </p>
                <ul className="mt-auto flex flex-wrap gap-2">
                  {row.products.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={productHref(product.slug)}
                        className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white/85 transition-colors duration-300 hover:border-[#f97316] hover:text-white"
                      >
                        {product.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
