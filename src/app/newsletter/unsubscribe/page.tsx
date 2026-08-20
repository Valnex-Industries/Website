import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, CircleAlert } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { unsubscribe } from "@/services/newsletter";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * One click, no confirmation step, no sign-in.
 *
 * That is deliberate. Making someone log in or answer "are you sure" to stop
 * receiving email is the behaviour that gets a sender marked as spam, and the
 * inquiry mailbox shares this domain's reputation. The token is single-purpose
 * and unguessable, so the only thing it can do is unsubscribe the one address
 * it belongs to.
 *
 * The emails also carry List-Unsubscribe headers pointing here, which is what
 * lets Gmail and Outlook show their own native unsubscribe button.
 */
export default async function UnsubscribePage({
  searchParams,
}: PageProps<"/newsletter/unsubscribe">) {
  const { token } = await searchParams;
  const done =
    typeof token === "string" && token.length > 0
      ? await unsubscribe(token)
      : false;

  return (
    <>
      <Navbar />

      <main className="flex flex-1 items-center justify-center bg-ink px-6 py-40 text-white">
        <div className="w-full max-w-md text-center">
          {done ? (
            <>
              <CheckCircle2 className="mx-auto size-10 text-white/70" aria-hidden />
              <h1 className="font-orbitron mt-6 text-2xl font-bold md:text-3xl">
                You have been unsubscribed
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                We will not send you any more news or offers. Inquiries you send
                us are unaffected — we will still reply to those.
              </p>
            </>
          ) : (
            <>
              <CircleAlert className="mx-auto size-10 text-white/40" aria-hidden />
              <h1 className="font-orbitron mt-6 text-2xl font-bold md:text-3xl">
                That link did not work
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                You may already have unsubscribed, or the link may have been
                copied incompletely. If you keep receiving emails, reply to one
                of them and we will remove you by hand.
              </p>
            </>
          )}

          <div className="mt-8">
            <Link
              href="/"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold transition-colors hover:border-white/50"
            >
              Back to the website
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
