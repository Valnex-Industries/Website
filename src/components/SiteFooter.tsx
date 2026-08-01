import { MapPin, Phone, Mail } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Products",
    links: [
      "Chillers",
      "Flake Cutter",
      "Hopper Loader",
      "Laser Marking",
      "Volumetric Feeder",
      "Mould Temp",
      "Dehumidifier",
    ],
  },
  {
    title: "Company",
    links: [
      "Company profile",
      "Leadership",
      "Plants & facilities",
      "Sustainability",
    ],
  },
  {
    title: "Careers",
    links: [
      "Open roles",
      "Graduate program",
      "Life at Valnex",
      "Recruitment entry",
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-white pt-20 pb-10 border-t border-[color:var(--brand-blue)]/10"
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.03] filter invert"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
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
            <div key={column.title} className="lg:col-span-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-blue)]/80">
                {column.title}
              </span>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-medium text-[color:var(--brand-ink)]/70 transition-colors hover:text-[#f97316]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="lg:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--brand-blue)]/80">
              Contact Us
            </span>
            <ul className="mt-5 flex flex-col gap-5 text-sm font-medium text-[color:var(--brand-ink)]/70">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="shrink-0 text-[#f97316] mt-0.5" />
                <span className="leading-relaxed">
                  3, Maruti Industrial Park-2, Dhamatvan Bakrol Road, Dhamatvan, Ahmedabad-382435, Gujarat, INDIA.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-[#f97316]" />
                <span>+91 7574848748</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-[#f97316]" />
                <span>contact@valnexindustries.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col gap-4 border-t border-[color:var(--brand-blue)]/10 pt-8 text-[11px] font-medium tracking-wide text-[color:var(--brand-ink)]/50 md:flex-row md:items-center md:justify-between">
          <span className="text-[#0055ff]">
            © {new Date().getFullYear()} Valnex Industries. All rights reserved.
          </span>
          <div className="flex gap-6">
            <a
              href="#"
              className="transition-colors hover:text-[#f97316]"
            >
              Privacy policy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-[#f97316]"
            >
              Terms of use
            </a>
            <a
              href="#"
              className="transition-colors hover:text-[#f97316]"
            >
              Site map
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
