/**
 * A small Markdown subset, rendered to HTML.
 *
 * This is a copy of the renderer in the Analytics Portal
 * (Analytics-Portal/src/lib/markdown.ts) and the two must stay identical: the
 * portal shows a preview of a post and this renders the published article, and
 * a preview that does not match what ships is worse than no preview. Copied
 * rather than shared through a package because the two apps deploy separately
 * and a workspace dependency would couple their release cycles for ~200 lines.
 *
 * The safety property is structural: **every character of input is HTML-escaped
 * before any formatting is applied**, so no tag in the source can survive as a
 * tag. Every tag in the output is one this file wrote. That matters because
 * news bodies are typed into a portal and rendered on the public site — without
 * this, an editor's account would be a cross-site scripting vector.
 *
 * Supported: # ## ### headings, **bold**, _italic_, `code`, [links](url),
 * ![alt](src) images, - bullet lists, 1. numbered lists, > quotes, --- rules,
 * and paragraphs.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Only http, https and mailto survive. `javascript:` in an href is the one
 * injection escaping alone does not stop, because the colon and the letters are
 * all perfectly ordinary characters.
 */
function safeUrl(raw: string): string | null {
  const url = raw.trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return null;
}

/**
 * Image sources are narrower than link hrefs: http(s) or site-relative only.
 * No mailto, no javascript:. Same structural guarantee as safeUrl -- the input
 * is already escaped, and only these two shapes are ever emitted as a src.
 */
function safeImageUrl(raw: string): string | null {
  const url = raw.trim();
  if (/^https?:/i.test(url)) return url;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return null;
}

/** An <img> tag from an already-escaped alt and src. `max-width` is inline
 *  rather than in a stylesheet because this same output is mailed, and an email
 *  has no stylesheet -- without it a large image overflows the 600px column. */
function imageTag(alt: string, rawSrc: string): string | null {
  const url = safeImageUrl(rawSrc);
  if (!url) return null;
  return `<img src="${url}" alt="${alt}" loading="lazy" style="max-width:100%;height:auto;" />`;
}

/** Inline formatting. Input here is ALREADY escaped. */
function inline(escaped: string): string {
  return escaped
    /* Images first: their alt and src must not then be read as other
       formatting, and the ![..](..) has to be consumed before the link rule
       below sees the [..](..) nested inside it. */
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt: string, src: string) => {
      return imageTag(alt, src) ?? alt;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_([^_]+)_/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, href: string) => {
      const url = safeUrl(href);
      if (!url) return label;
      const external = /^https?:/i.test(url);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${url}"${attrs}>${label}</a>`;
    });
}

export function renderMarkdown(source: string): string {
  if (!source.trim()) return "";

  const lines = escapeHtml(source).split(/\r?\n/);
  const out: string[] = [];

  let block: "ul" | "ol" | "blockquote" | null = null;
  let paragraph: string[] = [];

  function closeParagraph() {
    if (paragraph.length > 0) {
      out.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  }

  function closeBlock() {
    if (block) {
      out.push(`</${block}>`);
      block = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeBlock();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      closeParagraph();
      closeBlock();
      /* # becomes h2, so the article's own <h1> stays the only one on the page
         and the heading outline a screen reader announces stays correct. */
      const level = heading[1].length + 1;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      closeParagraph();
      closeBlock();
      out.push("<hr />");
      continue;
    }

    /* An image on a line of its own becomes a block figure rather than an image
       wrapped in a paragraph -- that is how a picture reads in the copy. An
       image mid-sentence is still handled inline() below. */
    const standaloneImage = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (standaloneImage) {
      closeParagraph();
      closeBlock();
      const tag = imageTag(standaloneImage[1], standaloneImage[2]);
      out.push(tag ? `<figure>${tag}</figure>` : `<p>${standaloneImage[1]}</p>`);
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      closeParagraph();
      if (block !== "ul") {
        closeBlock();
        out.push("<ul>");
        block = "ul";
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    const numbered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (numbered) {
      closeParagraph();
      if (block !== "ol") {
        closeBlock();
        out.push("<ol>");
        block = "ol";
      }
      out.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }

    /* The escape pass has already turned ">" into "&gt;", so a blockquote is
       matched on the entity rather than on the character. */
    const quote = /^&gt;\s?(.*)$/.exec(trimmed);
    if (quote) {
      closeParagraph();
      if (block !== "blockquote") {
        closeBlock();
        out.push("<blockquote>");
        block = "blockquote";
      }
      out.push(`<p>${inline(quote[1])}</p>`);
      continue;
    }

    closeBlock();
    paragraph.push(trimmed);
  }

  closeParagraph();
  closeBlock();

  return out.join("\n");
}

/** Body as plain text, for meta descriptions and structured data. */
export function markdownToText(source: string): string {
  return source
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    /* Images become their alt text (or nothing), stripped before links so the
       leading "!" cannot survive as stray punctuation. */
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
