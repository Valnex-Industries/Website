import { Navbar } from "@/components/Navbar";
import { HeroScroll } from "@/components/HeroScroll";
import { Manifesto } from "@/components/Manifesto";
import { Divisions } from "@/components/Divisions";
import { Strengths } from "@/components/Strengths";
import { CtaBand } from "@/components/CtaBand";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { productListSchema } from "@/lib/schema";
import { getProducts } from "@/services/content";

/* The catalogue is edited in the Analytics Portal, which purges this page's
   cache on save. Between saves the page is served from cache, so an editor sees
   their change within a second and a visitor never waits on a database read. */
export const revalidate = 300;

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="relative w-full bg-[color:var(--brand-blue)]">
      {/* Enumerates the range, so an answer engine asked "what does Valnex
          make?" can list it without parsing the animated grid. */}
      <JsonLd data={productListSchema(products)} />
      <Navbar />
      <main>
        <HeroScroll />
        {/* Passed down rather than imported by each component: these are client
            components, so the database read has to happen here and travel as
            props. Each keeps the static catalogue as its default, so none of
            them can render empty. */}
        <Divisions products={products} />
        <Strengths productCount={products.length} />
        <Manifesto productCount={products.length} />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
