import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBand } from "@/components/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";
import { PeopleCollage } from "@/components/about/PeopleCollage";
import { AboutVision } from "@/components/about/AboutVision";
import { AboutLines } from "@/components/about/AboutLines";
import { aboutPageSchema, breadcrumbSchema } from "@/lib/schema";
import { getProducts } from "@/services/content";

/* Same cadence as the product pages: the line-up below comes from the
   portal, so a product published there appears here within five minutes. */
export const revalidate = 300;

const TITLE = "About Valnex Industries | Manufacturer in Ahmedabad Since 2021";

const DESCRIPTION =
  "Valnex Industries has designed and manufactured process equipment for plastics plants in Ahmedabad, Gujarat since 2021. Meet the founders and crew.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function AboutPage() {
  const products = await getProducts();

  return (
    <div className="relative w-full bg-[color:var(--brand-ink)]">
      <JsonLd data={aboutPageSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <Navbar />

      {/* No overflow clipping here: the two pinned sections are fixed while
          they pin, and the page body already clips sideways overflow. */}
      <main>
        <AboutHero />
        <AboutStory productCount={products.length} />
        <PeopleCollage />
        <AboutVision />
        <AboutLines products={products} />
        <CtaBand />
      </main>

      <SiteFooter />
    </div>
  );
}
