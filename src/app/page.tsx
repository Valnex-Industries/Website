import { Navbar } from "@/components/Navbar";
import { HeroScroll } from "@/components/HeroScroll";
import { Manifesto } from "@/components/Manifesto";
import { Divisions } from "@/components/Divisions";
import { Strengths } from "@/components/Strengths";
import { CtaBand } from "@/components/CtaBand";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { productListSchema } from "@/lib/schema";
import { PRODUCTS } from "@/lib/products";

export default function Home() {
  return (
    <div className="relative w-full bg-[color:var(--brand-blue)]">
      {/* Enumerates the range, so an answer engine asked "what does Valnex
          make?" can list it without parsing the animated grid. */}
      <JsonLd data={productListSchema(PRODUCTS)} />
      <Navbar />
      <main>
        <HeroScroll />
        <Divisions />
        <Strengths />
        <Manifesto />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
