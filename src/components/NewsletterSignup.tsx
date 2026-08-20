"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";

import {
  INITIAL_SUBSCRIBE_STATE,
  subscribeAction,
} from "@/app/news/actions";
import { cn } from "@/utils/cn";

/**
 * The newsletter signup.
 *
 * Double opt-in, so the success message says "check your inbox" rather than
 * "you're subscribed" — claiming the second when only the first has happened is
 * how people conclude the newsletter is broken when nothing arrives.
 */

function SubmitButton({ compact }: { compact?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group flex shrink-0 items-center justify-center gap-2 rounded-full bg-white font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0",
        compact ? "px-6 py-3 text-xs" : "px-7 py-3.5 text-sm",
      )}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          Sending
        </>
      ) : (
        <>
          Subscribe
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </>
      )}
    </button>
  );
}

export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [state, formAction] = useActionState(
    subscribeAction,
    INITIAL_SUBSCRIBE_STATE,
  );

  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.03]",
        compact ? "p-6 md:p-8" : "p-8 md:p-14",
      )}
    >
      <div className={cn(!compact && "max-w-2xl")}>
        <h2
          className={cn(
            "font-orbitron font-bold",
            compact ? "text-lg" : "text-2xl md:text-4xl",
          )}
        >
          Get news and offers by email
        </h2>
        <p
          className={cn(
            "mt-3 text-white/55",
            compact ? "text-sm" : "text-sm md:text-base",
          )}
        >
          Product launches, price offers and announcements. No more than a few
          emails a month, and one click to stop.
        </p>

        {state.status === "success" ? (
          <p
            className="mt-6 flex items-center gap-2 text-sm font-medium text-white"
            role="status"
          >
            <Check className="size-4 shrink-0" aria-hidden />
            {state.message}
          </p>
        ) : (
          <form action={formAction} className="mt-6 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={state.status === "error"}
                className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm text-white placeholder:text-white/35 focus:border-white/40 focus:outline-none"
              />

              {/* Honeypot. Hidden from people, filled in by bots, and the
                  server treats a non-empty value as a silent no-op.

                  Clipped to a 1px box rather than parked at `left: -9999px`.
                  The off-canvas trick puts a 310px-wide element outside the
                  layout, which browsers still count when computing scroll
                  extents — harmless in LTR, but it is real content sitting
                  outside the page, and it flips to a rightward overflow the
                  moment anything renders in RTL. This occupies no space in any
                  direction while staying a real, focusable-by-a-bot input,
                  which `display: none` would not be. */}
              <div
                aria-hidden
                className="absolute h-px w-px overflow-hidden [clip-path:inset(50%)]"
              >
                <label htmlFor="company_website">Leave this empty</label>
                <input
                  id="company_website"
                  name="company_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <SubmitButton compact={compact} />
            </div>

            {state.status === "error" ? (
              <p className="text-xs text-red-300" role="alert">
                {state.message}
              </p>
            ) : (
              <p className="text-xs text-white/35">
                We send a confirmation link first. Your address is never shared.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
