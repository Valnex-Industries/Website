import { Navbar } from "@/components/Navbar";
import { HeroScroll } from "@/components/HeroScroll";
import { Manifesto } from "@/components/Manifesto";
import { Divisions } from "@/components/Divisions";
import { CtaBand } from "@/components/CtaBand";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="relative w-full bg-[color:var(--brand-blue)]">
      <Navbar />
      <main>
        <HeroScroll />
        <Divisions />
        <Manifesto />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
