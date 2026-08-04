"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export function CtaBand() {
  return (
    <section id="contact" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/assets/hero_bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[rgba(0,71,225,0.78)] mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-r from-[#02102e] via-[rgba(2,16,46,0.6)] to-transparent" />
        <div
          aria-hidden="true"
          className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.07]"
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 py-20 sm:px-6 md:py-28 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-32">
        <Reveal className="max-w-2xl">
          <span className="eyebrow text-white/50">Inquiry</span>
          <h2 className="mt-4 text-[clamp(2rem,4.8vw,3.75rem)] font-black leading-[0.98] tracking-tight text-white">
            Bring us the part
            <br />
            that keeps failing.
          </h2>
          <p className="mt-6 max-w-lg text-sm font-light leading-relaxed text-white/65 md:text-base">
            Send a drawing, a duty cycle, or just the problem. An engineer, not
            a form, reads every inquiry that arrives.
          </p>
        </Reveal>

        <Reveal delay={0.12} className="shrink-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-col lg:flex-nowrap">
            <Link
              href="/inquiry"
              className="group flex items-center justify-between gap-6 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[color:var(--brand-blue)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              Start an inquiry
              <ArrowRight
                size={16}
                strokeWidth={2.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            {/* Was a "Recruitment entry" link pointing at this very section,
                so it went nowhere even before Careers was removed. */}
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-6 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#25D366] transition-transform duration-300 hover:-translate-y-0.5"
            >
              WhatsApp inquiry
              <WhatsAppIcon
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
