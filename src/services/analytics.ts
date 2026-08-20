import "server-only";

import { insertAdmin } from "@/services/supabase";

/**
 * Writes to the analytics tables.
 *
 * Uses the service role, which is why this file is server-only and why the
 * tables have no anon insert policy. A browser can therefore not forge a
 * pageview or a WhatsApp inquiry: everything goes through a route handler on
 * this origin, which is where bot filtering and geo enrichment happen.
 *
 * Every function returns void and swallows failures. Analytics must never be
 * able to break a page: if the events table is down, the visitor's experience
 * is that nothing happened, which is correct.
 */

export interface EventRow {
  event: string;
  visitor_id: string;
  session_id: string;
  path: string;
  title?: string | null;
  referrer_host?: string | null;
  referrer_url?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  device?: string | null;
  os?: string | null;
  browser?: string | null;
  viewport_w?: number | null;
  is_entry?: boolean;
  duration_ms?: number | null;
  props?: Record<string, unknown>;
}

export async function recordEvent(row: EventRow): Promise<void> {
  await insertAdmin("analytics_events", row);
}

export interface VitalRow {
  metric: string;
  value: number;
  rating?: string | null;
  path: string;
  device?: string | null;
  session_id?: string | null;
}

export async function recordVitals(rows: VitalRow[]): Promise<void> {
  if (rows.length === 0) return;
  await insertAdmin("analytics_web_vitals_samples", rows);
}

export interface WhatsAppClickRow {
  page_path: string;
  product_slug?: string | null;
  prefilled_message?: string | null;
  referrer_host?: string | null;
  country?: string | null;
  device?: string | null;
  os?: string | null;
  browser?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
}

export async function recordWhatsAppClick(row: WhatsAppClickRow): Promise<void> {
  /* `source` is set here rather than by the caller so every row the website
     writes is unambiguously a click intent. The Meta Cloud API integration,
     when it lands, writes 'cloud_api' from its own webhook. */
  await insertAdmin("whatsapp_inquiries", { ...row, source: "click_intent" });
}
