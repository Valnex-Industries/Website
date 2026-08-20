import Image, { type ImageProps } from "next/image";

import { imagekitLoader, isImagekitPath } from "@/lib/imagekit";

/**
 * An image that comes from either place the site now stores pictures.
 *
 * Two sources coexist and will for a while: files in this repo's `public/`
 * folder (the seven seeded products) and files in ImageKit (anything uploaded
 * through the portal). This picks the right pipeline per image rather than
 * forcing one on both.
 *
 * WHY IMAGEKIT IMAGES BYPASS VERCEL'S OPTIMISER:
 *
 * Passing an ImageKit URL to a plain <Image> would have Vercel fetch and resize
 * a file that has already been resized by a CDN built for it. That costs money
 * twice over -- Vercel's Hobby plan allows 1,000 source images a month, and
 * every ImageKit image would consume that quota to duplicate work ImageKit does
 * for free. The custom `loader` hands the sizing to ImageKit instead, so the
 * quota stays available for the local `public/` images that genuinely need it.
 *
 * Local paths get the normal <Image> treatment, unchanged.
 */
export function CdnImage({ src, alt, ...props }: ImageProps) {
  const source = typeof src === "string" ? src : "";

  /* `alt` is destructured and passed explicitly rather than riding along in the
     spread. ImageProps already requires it, so this changes nothing at runtime
     — but the jsx-a11y rule cannot see through a spread and would flag both
     branches as missing alt text, training everyone to ignore the one warning
     that catches a genuinely inaccessible image. */
  if (isImagekitPath(source)) {
    return <Image {...props} src={source} alt={alt} loader={imagekitLoader} />;
  }

  return <Image {...props} src={src} alt={alt} />;
}
