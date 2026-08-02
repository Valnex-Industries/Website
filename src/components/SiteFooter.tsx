"use client";

import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { CAREER_LINKS, COMPANY_LINKS, PRODUCT_LINKS } from "@/lib/nav";
import { useHashNav } from "@/lib/use-hash-nav";
import { BUSINESS, CONTACT, SITE_NAME } from "@/lib/site";
import { cn } from "@/utils/cn";

/** The verified listing once it exists; a name+address search until then, which
 *  resolves to the same place without hardcoding a guessed pin. */
const MAPS_SEARCH_URL =
  BUSINESS.mapUrl ??
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SITE_NAME}, ${CONTACT.address.full}`,
  )}`;

/* Products takes the full width on phones and splits its own list into two
   balanced columns, so the right half is used rather than left empty. The two
   short lists pair up beside each other. Every cell is filled, so no group is
   left sitting next to a hole. */
const FOOTER_COLUMNS = [
  {
    title: "Products",
    links: PRODUCT_LINKS,
    span: "col-span-2 md:col-span-1 lg:col-span-2",
    /* columns-2 rather than a 2-up grid: it balances the seven items by
       height on its own, so the split survives a link being added. */
    list: "columns-2 gap-x-5 md:columns-1",
  },
  { title: "Company", links: COMPANY_LINKS, span: "lg:col-span-2", list: "" },
  { title: "Careers", links: CAREER_LINKS, span: "lg:col-span-2", list: "" },
];

/* One hairline rhythm down the page on phones; the dividers disappear once the
   groups sit side by side and columns do the separating. */
const BLOCK =
  "border-t border-[color:var(--brand-blue)]/10 py-7 md:border-t-0 md:py-0";

export function SiteFooter() {
  const navigate = useHashNav();

  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-white pt-16 pb-10 border-t border-[color:var(--brand-blue)]/10 md:pt-20"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.03] filter invert"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        {/* Two columns on phones, three on tablets, the full twelve on desktop:
            stacking every list made the footer taller than the page itself. */}
        <div className="grid grid-cols-2 gap-x-5 sm:gap-x-8 md:grid-cols-3 md:gap-y-12 lg:grid-cols-12 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 pb-7 md:col-span-3 md:pb-0 lg:col-span-4">
            <span className="text-sm font-extrabold uppercase tracking-[0.22em] text-[color:var(--brand-blue)]">
              Valnex Industries
            </span>
            <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-[color:var(--brand-ink)]/70">
              Precision that powers progress. Engineering partner to the
              production lines that cannot stop.
            </p>
          </div>

          {/* Links Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className={cn(BLOCK, column.span)}>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-blue)]/80">
                {column.title}
              </span>
              {/* Margin, not gap: gap does nothing across CSS columns. */}
              <ul className={cn("mt-5", column.list)}>
                {column.links.map((link) => (
                  <li key={link.label} className="mb-3 break-inside-avoid last:mb-0">
                    <Link
                      href={link.href}
                      onClick={(e) => navigate(e, link.href)}
                      className="inline-block py-0.5 text-sm font-medium leading-snug text-[color:var(--brand-ink)]/70 transition-colors hover:text-[#f97316]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className={cn(BLOCK, "col-span-2 md:col-span-3 lg:col-span-2")}>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-blue)]/80">
              Contact Us
            </span>
            <ul className="mt-5 flex flex-col gap-5 text-sm font-medium text-[color:var(--brand-ink)]/70">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="shrink-0 text-[#f97316] mt-0.5" />
                {/* Marked up as a postal address and linked to Maps: it is the
                    same NAP string as the Business Profile, which is what lets
                    Google treat the listing and this site as one business. */}
                <address className="not-italic leading-relaxed">
                  <a
                    href={MAPS_SEARCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#f97316]"
                  >
                    {CONTACT.address.full}
                  </a>
                </address>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="shrink-0 text-[#f97316] mt-0.5" />
                <div className="flex flex-col gap-1">
                  <a
                    href="tel:+917574848748"
                    className="transition-colors hover:text-[#f97316]"
                  >
                    +91 7574848748
                  </a>
                  <a
                    href="tel:+919429481086"
                    className="transition-colors hover:text-[#f97316]"
                  >
                    +91 94294 81086
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-[#f97316]" />
                <a
                  href="mailto:contact@valnexindustries.com"
                  className="break-words transition-colors hover:text-[#f97316]"
                >
                  contact@valnexindustries.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar. Legal links lead on phones and the copyright closes the
            page, which is the order they are read in; desktop puts them back on
            one line. */}
        <div className="mt-10 flex flex-col-reverse gap-5 border-t border-[color:var(--brand-blue)]/10 pt-7 text-[11px] font-medium tracking-wide text-[color:var(--brand-ink)]/50 md:mt-16 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-8">
          <span className="text-[#0055ff]">
            © {new Date().getFullYear()} Valnex Industries. All rights reserved.
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6">
            <a href="#" className="py-1 transition-colors hover:text-[#f97316]">
              Privacy policy
            </a>
            <a href="#" className="py-1 transition-colors hover:text-[#f97316]">
              Terms of use
            </a>
            <a href="#" className="py-1 transition-colors hover:text-[#f97316]">
              Site map
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
