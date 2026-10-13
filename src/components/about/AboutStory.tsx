import { Reveal } from "@/components/Reveal";
import { ABOUT_STORY } from "@/lib/about";

/**
 * Where the company comes from, set as an editorial spread: the founding year
 * drawn large on the left with the plain facts under it, the story on the
 * right. Server-rendered; only the Reveal wrappers are client code.
 */
export function AboutStory({ productCount }: { productCount: number }) {
  const facts = [
    { term: "Founded", detail: "2021, Ahmedabad" },
    { term: "Plant", detail: "Dhamatvan, Gujarat" },
    { term: "Product lines", detail: String(productCount) },
    { term: "Manufacturing", detail: "Designed and built in-house" },
  ];

  return (
    <section
      id="story"
      className="relative overflow-hidden bg-linear-to-b from-[#02102e] to-[#071c52] py-20 md:py-28 lg:py-36"
    >
      <div className="relative mx-auto grid w-full max-w-[1280px] gap-12 px-5 sm:px-6 md:gap-16 lg:grid-cols-12 lg:px-10">
        <Reveal className="lg:col-span-5">
          {/* Outlined rather than filled, so a numeral this size reads as a
              mark on the drawing and not as a headline competing with h2. */}
          <span
            aria-hidden="true"
            className="font-orbitron block text-[clamp(5rem,18vw,11rem)] font-black leading-[0.85] tracking-tighter text-transparent [-webkit-text-stroke:1.5px_#f97316]"
          >
            2021
          </span>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 md:mt-14">
            {facts.map((fact) => (
              <div key={fact.term} className="min-w-0 border-t border-white/12 pt-4">
                <dt className="eyebrow text-white/45">{fact.term}</dt>
                <dd className="mt-2 text-sm font-semibold leading-snug text-white md:text-base">
                  {fact.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7 lg:pt-6">
          <h2 className="text-[clamp(1.9rem,4.2vw,3.25rem)] font-black leading-[1.02] tracking-tight text-white">
            {ABOUT_STORY.heading}
          </h2>
          <div className="mt-8 flex max-w-[60ch] flex-col gap-5">
            {ABOUT_STORY.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-base font-light leading-relaxed text-white/70 md:text-lg"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
