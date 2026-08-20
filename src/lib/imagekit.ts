import type { ImageLoaderProps } from "next/image";

/**
 * ImageKit delivery for the public site.
 *
 * The database stores a PATH (`/products/chiller-50tr.jpg`), never a full URL,
 * so the endpoint and the transformation are decided here at render time. See
 * the header of the portal's migration 0007 for why that choice was made.
 *
 * This file is the read half only. Uploading, deleting and the private key all
 * live in the portal — the website never writes to ImageKit.
 */

export function imagekitEndpoint(): string {
  return (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "").replace(/\/$/, "");
}

/**
 * Is this an ImageKit-backed image?
 *
 * A stored ImageKit path and a local `public/` path both start with "/", so the
 * two are told apart by the folders the portal uploads into. Anything else --
 * `/assets/...`, a full external URL — goes through Next's own optimiser.
 */
const IMAGEKIT_FOLDERS = ["/products/", "/news/", "/media/"];

export function isImagekitPath(src: string): boolean {
  if (!src || !imagekitEndpoint()) return false;
  if (src.startsWith(imagekitEndpoint())) return true;
  return IMAGEKIT_FOLDERS.some((folder) => src.startsWith(folder));
}

/**
 * Next.js image loader that defers resizing to ImageKit.
 *
 * `f-auto` is the highest-value part: ImageKit reads the Accept header and
 * serves AVIF or WebP where supported, which is typically 30-50% smaller than
 * the JPEG for no visible difference and no extra configuration.
 *
 * Next.js calls this once per entry in its `sizes` breakpoints, so a single
 * <CdnImage> yields a full srcset without any of those variants being generated
 * on our side.
 */
export function imagekitLoader({ src, width, quality }: ImageLoaderProps): string {
  const endpoint = imagekitEndpoint();

  /* Already absolute — strip the endpoint back off so the transformation can be
     inserted in the right place rather than appended to a finished URL. */
  const path = src.startsWith(endpoint) ? src.slice(endpoint.length) : src;
  const clean = path.startsWith("/") ? path : `/${path}`;

  const transforms = [`w-${width}`, "f-auto", `q-${quality ?? 80}`];
  return `${endpoint}/tr:${transforms.join(",")}${clean}`;
}

/** A URL built by hand, for the few places that are not a Next <Image>:
 *  OpenGraph images, structured data and the newsletter. */
export function imagekitUrl(
  path: string,
  options: { w?: number; h?: number; q?: number } = {},
): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (!isImagekitPath(path)) return path;

  const transforms = ["f-auto"];
  if (options.w) transforms.push(`w-${Math.round(options.w)}`);
  if (options.h) transforms.push(`h-${Math.round(options.h)}`);
  if (options.q) transforms.push(`q-${Math.round(options.q)}`);

  return `${imagekitEndpoint()}/tr:${transforms.join(",")}${path}`;
}

/**
 * An absolute URL for an image path, whichever store it came from.
 *
 * This exists because there are two kinds of "/…" path in the app now, and
 * everywhere that needs a fully-qualified URL — structured data, OpenGraph
 * cards, emails — has to resolve them against DIFFERENT origins:
 *
 *   /assets/division_energy.png  → https://www.valnexindustries.com/assets/…
 *   /products/chiller-50tr.jpg   → https://ik.imagekit.io/valnex/tr:…/products/…
 *
 * Passing an ImageKit path to `siteUrl()` produces a URL on our own domain that
 * 404s. It is invisible in development — nothing renders it — and shows up as a
 * missing image in a Google rich result or a blank WhatsApp link preview, which
 * is the worst place to discover it. So the resolution lives here, once.
 *
 * The width default is 1200px because that is what social cards and rich
 * results want; serving a 4 MB original into a preview thumbnail is slow and
 * some crawlers give up on it.
 */
export function absoluteImageUrl(
  path: string | null | undefined,
  options: { w?: number } = { w: 1200 },
): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  if (isImagekitPath(path)) {
    return imagekitUrl(path, { w: options.w ?? 1200 });
  }

  const origin = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.valnexindustries.com"
  ).replace(/\/$/, "");
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
