"use server";

import { headers } from "next/headers";

import { recordEvent } from "@/services/analytics";
import { subscribe } from "@/services/newsletter";
import { clientIp, parseUserAgent, visitorId } from "@/lib/visitor";

export interface SubscribeState {
  status: "idle" | "success" | "error";
  message: string;
}

export const INITIAL_SUBSCRIBE_STATE: SubscribeState = {
  status: "idle",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter signup from the news feed.
 *
 * Deliberately says the same thing whether the address is new or already
 * subscribed: "check your inbox". Telling a stranger which addresses are on the
 * list turns the form into a way to test whether someone's email is known to
 * the company.
 */
export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  /* A hidden field no human fills in. Bots complete every input they find, so
     a non-empty value here is a bot -- and it is told nothing useful. */
  const honeypot = String(formData.get("company_website") ?? "");
  if (honeypot) {
    return { status: "success", message: "Check your inbox to confirm." };
  }

  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const headerList = await headers();
  const ip = clientIp(headerList);
  const userAgent = headerList.get("user-agent") ?? "";

  const result = await subscribe(email, name || null, "news-feed", ip, userAgent);

  if (result.status === "error") {
    return { status: "error", message: result.message };
  }

  if (result.status === "already") {
    return {
      status: "success",
      message: "You are already subscribed — nothing more to do.",
    };
  }

  /* Recorded so the conversion shows up next to WhatsApp clicks and form
     inquiries in the portal. A failure here must not fail the signup. */
  const { device, os, browser } = parseUserAgent(userAgent);
  await recordEvent({
    event: "subscribe",
    visitor_id: visitorId(ip, userAgent, new Date()),
    session_id: "server",
    path: "/news",
    country: headerList.get("x-vercel-ip-country"),
    device,
    os,
    browser,
  }).catch(() => {});

  return {
    status: "success",
    message: "Almost there — click the link in the email we just sent.",
  };
}
