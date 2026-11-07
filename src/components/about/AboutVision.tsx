import { Reveal } from "@/components/Reveal";
import { ABOUT_VISION } from "@/lib/about";

/**
 * The vision, on the same white band the homepage uses for its company
 * figures, so the one light section on the page is a known part of the site
 * rather than a theme switch. The principles run as a stacked index (title
 * left, explanation right) instead of three equal cards.
 */
export function AboutVision() {
  return (
    <section
      id="vision"
      aria-labelledby="vision-heading"
      className="relative bg-white py-20 text-[color:var(--brand-ink)] md:py-28 lg:py-32"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <Reveal>
          <h2 id="vision-heading" className="eyebrow text-[color:var(--brand-ink)]/50">
            Our vision
          </h2>
          <p className="font-orbitron mt-6 max-w-5xl text-[clamp(1.7rem,4.4vw,3.6rem)] font-black leading-[1.08] tracking-tight">
            {ABOUT_VISION.statement}
          </p>
        </Reveal>

        {/* One Reveal around the list: a <ul> may only hold <li>s, so the
            motion wrapper cannot sit between them. */}
        <Reveal delay={0.08}>
          <ul className="mt-16 md:mt-24">
            {ABOUT_VISION.principles.map((principle) => (
              <li
                key={principle.title}
                className="grid gap-3 border-t border-[color:var(--brand-ink)]/12 py-7 md:grid-cols-12 md:gap-10 md:py-9"
              >
                <h3 className="text-lg font-black leading-tight tracking-tight text-[color:var(--brand-blue)] md:col-span-5 md:text-2xl">
                  {principle.title}
                </h3>
                <p className="max-w-[55ch] text-[15px] font-light leading-relaxed text-[color:var(--brand-ink)]/70 md:col-span-7 md:text-lg">
                  {principle.body}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
