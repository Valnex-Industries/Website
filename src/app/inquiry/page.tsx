import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { InquiryForm } from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Inquiry | Valnex Industries",
  description:
    "Send Valnex Industries a drawing, a duty cycle, or just the problem. An engineer reads every inquiry that arrives.",
};

const STEPS = [
  {
    index: "01",
    title: "An engineer reads it",
    body: "Your inquiry goes to the division lead, not a queue. No qualification call before anyone looks at the technical detail.",
  },
  {
    index: "02",
    title: "One working day",
    body: "You get a named contact and a first read on feasibility, including when the honest answer is that we are not the right partner.",
  },
  {
    index: "03",
    title: "Bench, then line",
    body: "If it goes ahead, every program runs the same gate: prove it on the bench, prove it on the line, hold it for the life of the asset.",
  },
];

const DIRECT = [
  { label: "Email", value: "contact@valnexindustries.com" },
  { label: "Phone", value: "+91 7574848748, +91 94294 81086" },
  { label: "Address", value: "3, Maruti Industrial Park-2, Dhamatvan Bakrol Road, Dhamatvan, Ahmedabad-382435, Gujarat, INDIA." },
];

export default function InquiryPage() {
  return (
    <div className="relative w-full bg-[color:var(--brand-ink)]">
      <Navbar />

      <main className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
        />

        {/* Intro */}
        <section className="relative mx-auto w-full max-w-[1280px] px-5 pt-28 pb-12 sm:px-6 md:pt-36 md:pb-16 lg:px-10 lg:pt-44">
          <Reveal>
            <span className="eyebrow text-white/45">Inquiry</span>
            <h1 className="mt-4 max-w-3xl text-[clamp(1.9rem,7.5vw,4.25rem)] font-black leading-[1] tracking-tight text-white sm:leading-[0.95]">
              Bring us the part
              <br className="hidden sm:block" />{" "}
              that keeps failing.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] font-light leading-relaxed text-white/60 sm:mt-8 sm:text-base md:text-lg">
              Send a drawing, a duty cycle, or just the problem. The more you can
              tell us about where it runs and how it fails, the more useful the
              first reply will be.
            </p>
          </Reveal>
        </section>

        {/* Form + sidebar */}
        <section className="relative mx-auto w-full max-w-[1280px] px-5 pb-20 sm:px-6 md:pb-28 lg:px-10 lg:pb-32">
          <div className="grid gap-10 md:gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-7">
              <div className="rounded-none border border-[color:var(--brand-blue)]/10 bg-[#f8f9fa] p-5 shadow-2xl shadow-black/10 sm:p-6 md:p-10">
                <InquiryForm />
              </div>
            </Reveal>

            <div className="lg:col-span-5">
              <Reveal delay={0.1}>
                <span className="eyebrow text-white/45">What happens next</span>
                <ul className="mt-8 flex flex-col">
                  {STEPS.map((step) => (
                    <li
                      key={step.index}
                      className="flex gap-5 border-b border-white/10 py-6 first:pt-0 last:border-b-0"
                    >
                      <span className="font-orbitron shrink-0 text-xs font-bold tracking-[0.2em] text-white/35">
                        {step.index}
                      </span>
                      <div>
                        <h3 className="text-base font-extrabold tracking-tight text-white">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm font-light leading-relaxed text-white/55">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-10 rounded-none border border-[color:var(--brand-blue)]/10 bg-[#f8f9fa] p-5 shadow-xl shadow-black/5 sm:p-6 md:mt-12 md:p-8">
                  <span className="eyebrow text-[color:var(--brand-blue)]/70">
                    Or reach us directly
                  </span>
                  <dl className="mt-6 flex flex-col gap-4">
                    {DIRECT.map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col gap-1 border-b border-[color:var(--brand-blue)]/10 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                      >
                        <dt className="text-xs font-light text-[color:var(--brand-ink)]/60">
                          {item.label}
                        </dt>
                        <dd className="text-sm font-medium leading-relaxed text-[color:var(--brand-blue)] sm:max-w-[240px] sm:text-right">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
