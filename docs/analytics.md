# analytics

This site uses an optional Umami integration because the blog is a static Astro
site deployed to GitHub Pages. The integration is privacy-oriented and does not
put an API key in the generated frontend.

## enable collection

1. Create a site in Umami Cloud or in a self-hosted Umami instance.
2. Add these repository variables under GitHub → Settings → Secrets and
   variables → Actions → Variables:

   - **PUBLIC_UMAMI_WEBSITE_ID**: the website ID from Umami.
   - **PUBLIC_UMAMI_SCRIPT_URL**: the tracker URL. Leave this unset for the
     default Umami Cloud URL, or set it to the script URL of a self-hosted
     instance.
   - **PUBLIC_UMAMI_SHARE_URL**: an Umami public Share URL for the dashboard.

3. Run the deploy workflow again. The tracker is injected into the document
   head, and the traffic panel appears in the About page.

The website ID, script URL, and public Share URL are intended to be public
build-time values. Never put an Umami API key in a PUBLIC variable or in a
frontend file.

## what is shown

The About page embeds the public Share URL when both the website ID and Share
URL are configured. Umami lets the owner choose which views are shared, from a
small overview to pageviews, visitors, sessions, top pages, referrers, devices,
countries, and realtime data. The external dashboard remains the source of
truth; the blog does not proxy or store analytics data.

Without the variables, the About page remains a harmless setup placeholder and no
tracking request is made.

## privacy defaults

The tracker is restricted to the configured site domain, respects Do Not Track,
and excludes search parameters from collected page URLs. Client-side navigation
is covered by the tracker in the root layout.

References:

- [Umami: collect data](https://docs.umami.is/docs/collect-data)
- [Umami: tracker configuration](https://docs.umami.is/docs/tracker-configuration)
- [Umami: enable a Share URL](https://docs.umami.is/docs/enable-share-url)
