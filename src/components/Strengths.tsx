import Image from "next/image";
import { Reveal } from "@/components/Reveal";

/**
 * The one white section on a site that is otherwise blue, placed straight after
 * the product grid: the range, then what sits behind it.
 *
 * The sketches are deliberately cropped by the section edges. They are evidence
 * that the equipment is drawn before it is built, not illustrations to be read —
 * so the middle is kept clear by a white radial and the drawings run off the
 * edges. Their own backgrounds are white, which is why they dissolve into the
 * section instead of sitting on it as rectangles.
 */
export function Strengths() {
  return (
    <section id="strengths" className="relative overflow-hidden bg-white">
      {/* Two different treatments, because a corner needs width to read as a
          corner. Below md the sheets are full-bleed bands across the top and
          bottom with the type in the clear middle; from md up they retreat into
          opposite corners.
          Four size bands, because a tablet is two different shapes. md (768–1023)
          is a tablet held upright and runs the sheets at 2x; lg (1024–1279) is
          the same tablet turned on its side and runs 1.5x; xl is the desktop
          size. Width alone separates them — a landscape tablet is never below
          1024 and a desktop is rarely below 1280 — so this needs no orientation
          or pointer query, which would also catch every desktop monitor.
          Size is one `vw` clamp rather than a percentage of the section: a
          percentage collapsed them on a phone (narrow section) and ballooned
          them on a monitor. The crop is a percentage translate of the image's
          own box, not the container's, so exactly the same slice of the drawing
          is cut off at 375px as at 1920px instead of the crop wandering with the
          section's aspect ratio. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Landscape sheet: a natural band on a phone, the wide corner above it.
            Bleeding right sacrifices the top view and keeps the main drawing. */}
        <Image
          src="/assets/sketch-hopper-loader.webp"
          alt=""
          width={1536}
          height={1024}
          sizes="(max-width: 767px) 115vw, (max-width: 1023px) 200vw, (max-width: 1279px) 93vw, (max-width: 1440px) 62vw, 900px"
          className="absolute top-0 left-1/2 h-auto w-[115vw] max-w-none -translate-x-1/2 -translate-y-[8%] opacity-40 md:opacity-50 md:left-auto md:right-0 md:w-[200vw] md:translate-x-[16%] md:-translate-y-[4%] lg:w-[93vw] lg:translate-x-[20%] lg:-translate-y-[7%] lg:opacity-55 xl:w-[clamp(320px,62vw,900px)]"
        />
        {/* Portrait sheet, so it is the one that can hold the tall left flank on
            a wide screen — at 34vw it stands roughly 80–90% of the section's
            height, which is what fills the dead space beside the type. Its 2:3
            ratio is why the tablet band has to be a much larger fraction of the
            viewport (62vw) to reach anything like the same height. */}
        <Image
          src="/assets/sketch-chiller.webp"
          alt=""
          width={1024}
          height={1536}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 124vw, (max-width: 1279px) 51vw, (max-width: 1440px) 34vw, 700px"
          className="absolute bottom-0 left-1/2 h-auto w-[100vw] max-w-none -translate-x-1/2 translate-y-[54%] opacity-40 md:opacity-50 md:left-0 md:w-[124vw] md:-translate-x-[6%] md:translate-y-[16%] lg:w-[51vw] lg:-translate-x-[8%] lg:translate-y-[20%] lg:opacity-55 xl:w-[clamp(300px,34vw,700px)]"
        />
        {/* Clears the centre without a hard edge, so the drawings fade under
            the type rather than being masked by a visible shape. Kept just wide
            enough to cover the type block — at 60%/52% it was still washing out
            the inner corners of the sheets, which is most of what made them look
            small on a tablet. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(52% 40% at 50% 50%, #ffffff 0%, rgba(255,255,255,0.9) 45%, rgba(255,255,255,0) 80%)",
          }}
        />
      </div>

      {/* Taller than it needs to be for the type alone — the empty space below
          is deliberate headroom for the scroll-driven cards that go here next.
          The tablet band is the shortest of the three: a portrait tablet is
          already ~1024px tall, so a full 118vh there is more dead white than the
          sketches can reach across. */}
      <div className="relative mx-auto flex min-h-[110vh] w-full max-w-[1280px] flex-col items-center justify-center px-5 py-24 text-center sm:px-6 md:min-h-[104vh] md:py-28 lg:min-h-[118vh] lg:px-10 lg:py-32">
        <Reveal>
          {/* Exactly φ against the statement below: every term of this clamp is
              1.6x the matching term of the one on the <p>, so the ratio holds at
              every width instead of only at the design size. The break is forced
              rather than left to wrapping — with "Strengths" alone as the widest
              line the type can run to 8rem, where one line would have capped it
              at 7.6rem to fit a 1280px container. */}
          <h2 className="font-orbitron text-[clamp(2.88rem,12.8vw,8rem)] font-bold leading-[1.05] tracking-tight text-[color:var(--brand-blue)]">
            Our
            <br />
            Strengths
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          {/* Same dotted face as the hero corner statements, so the two read as
              one voice. `.font-bitcount` is unlayered CSS and pins the weight at
              300, which beats any Tailwind font-weight utility outright — the
              cascade puts unlayered rules above @layer utilities regardless of
              source order. So there is no weight class here: it would be dead. */}
          <p className="mt-[clamp(2rem,5vw,4rem)] font-bitcount text-[clamp(1.8rem,8vw,5rem)] leading-[1.25] text-[#f97316]">
            <span className="block">Innovate</span>
            <span className="block">Transform</span>
            <span className="block">Impact</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
