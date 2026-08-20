"use client";

import { usePathname } from "next/navigation";

import { whatsappHref } from "@/lib/site";

/**
 * The WhatsApp link with the current page attached.
 *
 * A hook rather than a component because the three places these buttons appear
 * -- the header pill, the mobile drawer and the CTA band -- each have their own
 * markup and styling, and only the href is shared. Wrapping them in a common
 * component would mean threading className, children and target through it for
 * no benefit.
 *
 * The `from` parameter is what turns a click into something answerable: without
 * it every WhatsApp inquiry in the portal reads "someone, somewhere on the
 * site", and "which product page produces inquiries" stays a guess.
 */
export function useWhatsAppHref(product?: string): string {
  const pathname = usePathname();
  return whatsappHref({ product, from: pathname });
}
