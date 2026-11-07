import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { ABOUT_QUESTIONS_HEADING } from "@/lib/about";
import type { Product } from "@/lib/products";
import { CONTACT } from "@/lib/site";

/** "a, b and c" — the list read aloud, for answers built from data. */
function listOf(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * The facts a buyer or an answer engine looks for first, each as a question
 * with a self-contained answer. Every answer is built from the identity in
 * `lib/site.ts`, the catalogue, or a claim the site already publishes on
 * /inquiry, so it cannot drift from the rest of the site.
 */
export function AboutQuestions({ products }: { products: Product[] }) {
  const titles = products.map((product) => product.title.toLowerCase());

  const items = [
    {
      question: "Where is Valnex Industries based?",
      answer: `Our plant and office are at ${CONTACT.address.full.replace(/\.$/, "")}.`,
    },
    {
      question: "When was Valnex Industries founded?",
      answer:
        "Valnex Industries Private Limited was incorporated in Ahmedabad on 5 August 2021.",
    },
    {
      question: "What does Valnex Industries manufacture?",
      answer: `Process equipment for plastics plants: ${listOf(titles)}.`,
    },
    {
      question: "Does Valnex build its own machines?",
      answer:
        "Yes. Every product line is designed and manufactured in-house at the Ahmedabad plant. Nothing in the range is bought in and rebadged.",
    },
  ];

  return (
    <section
      aria-labelledby="questions-heading"
      className="relative bg-[color:var(--brand-ink)] pb-20 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <div className="grid gap-10 border-t border-white/10 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <h2
              id="questions-heading"
              className="text-[clamp(1.7rem,3.4vw,2.5rem)] font-black leading-[1.05] tracking-tight text-white"
            >
              {ABOUT_QUESTIONS_HEADING}
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-8">
            <dl className="grid gap-x-10 gap-y-10 md:grid-cols-2">
              {items.map((item) => (
                <div key={item.question}>
                  <dt className="text-base font-bold leading-snug text-white md:text-lg">
                    {item.question}
                  </dt>
                  <dd className="mt-3 text-[15px] font-light leading-relaxed text-white/65">
                    {item.answer}
                  </dd>
                </div>
              ))}
              <div>
                <dt className="text-base font-bold leading-snug text-white md:text-lg">
                  How do I get a quote?
                </dt>
                <dd className="mt-3 text-[15px] font-light leading-relaxed text-white/65">
                  Send an{" "}
                  <Link
                    href="/inquiry"
                    className="font-semibold text-white underline decoration-[#f97316] underline-offset-4"
                  >
                    inquiry
                  </Link>{" "}
                  with a drawing, a duty cycle or just the problem. It goes to
                  the engineer who owns that product line, and you get a named
                  contact and a first read on feasibility within one working
                  day.
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
