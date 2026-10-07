/**
 * Lighthouse CI — SEO only.
 *
 * Run it with `npm run lighthouse:seo`, not `lhci autorun` directly: the URL
 * list is not in this file. scripts/lighthouse-seo.mjs reads it from the
 * site's own /sitemap.xml and passes it in, so every page the site asks to be
 * indexed is audited and a product added in the portal needs no edit here.
 *
 * Only the SEO category runs. Performance is measured from real visitors by
 * Speed Insights, and a lab score here would mostly be measuring the
 * two-second preloader, which is there by design.
 */
module.exports = {
  ci: {
    collect: {
      /* The SEO audits read the DOM, headers and robots.txt; they come out the
         same every run. Repeat runs only matter for timing metrics. */
      numberOfRuns: 1,
      settings: {
        onlyCategories: ["seo"],
        /* Mobile emulation is Lighthouse's default and is left alone on
           purpose: Google indexes the mobile rendering of a page. */
      },
    },
    assert: {
      assertions: {
        /* Every audit in the category, named individually so a failure says
           which rule broke instead of only "SEO scored 92". The category
           floor below catches any audit a future Lighthouse adds. */
        "is-crawlable": "error",
        "document-title": "error",
        "meta-description": "error",
        "http-status-code": "error",
        "link-text": "error",
        "crawlable-anchors": "error",
        "robots-txt": "error",
        "image-alt": "error",
        hreflang: "error",
        canonical: "error",
        "categories:seo": ["error", { minScore: 1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
      /* The default minus its timestamp, so each run overwrites the last
         report for a page rather than piling up copies to pick the newest
         from. The hostname stays: it keeps a local run's reports apart from a
         production run's, and without it the homepage's path sanitises to
         nothing and its report would be the dotfile ".report.html". */
      reportFilenamePattern: "%%HOSTNAME%%-%%PATHNAME%%.report.%%EXTENSION%%",
    },
  },
};
