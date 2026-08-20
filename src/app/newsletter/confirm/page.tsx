import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { confirmSubscription } from "@/services/newsletter";

export const metadata: Metadata = {
  title: "Confirm your subscription",
  /* Off the index: this URL only means anything with a token attached, and an
     indexed copy would be a dead page in search results. */
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ConfirmPage({
  searchParams,
}: PageProps<"/newsletter/confirm">) {
  const { token } = await searchParams;
  const confirmed =
    typeof token === "string" && token.length > 0
      ? await confirmSubscription(token)
      : false;

  return (
    <>
      <Navbar />

      <main className="flex flex-1 items-center justify-center bg-ink px-6 py-40 text-white">
        <div className="w-full max-w-md text-center">
          {confirmed ? (
            <>
              <CheckCircle2
                className="mx-auto size-10 text-[#25D366]"
                aria-hidden
              />
              <h1 className="font-orbitron mt-6 text-2xl font-bold md:text-3xl">
                You are subscribed
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Thank you. You will get our product launches, offers and
                announcements by email. Every one of them has an unsubscribe link
                at the bottom.
              </p>
            </>
          ) : (
            <>
              <CircleAlert className="mx-auto size-10 text-white/40" aria-hidden />
              <h1 className="font-orbitron mt-6 text-2xl font-bold md:text-3xl">
                That link did not work
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {/* Both real causes, stated, because the fix differs: an
                    already-used link needs no action at all. */}
                It may already have been used, or it may have been copied
                incompletely from the email. If you are already subscribed,
                there is nothing more to do.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/news"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              Read the news
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold transition-colors hover:border-white/50"
            >
              Home
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
