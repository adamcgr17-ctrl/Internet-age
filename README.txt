INTERNET AGE: Vercel version with personalized group-link previews

Same page as the static version. The difference: when someone pastes a leaderboard link (the ?g= links from
"Challenge friends" and family mode) into iMessage, WhatsApp, Slack, Discord or X, the preview shows the names and
internet ages on that board, with "YOUR TURN.", instead of the generic card.

PLAN
Use Vercel Pro ($20/month), not the free Hobby plan. Hobby is for non-commercial use only, and it pauses a project
that goes over its monthly limits. Its 4 hours of function CPU covers roughly 70,000 new group boards at about
0.2 seconds each, which a real spike would pass.

DEPLOY
1. In public/app.html set your domain: CONFIG.SITE_URL (e.g. "https://internetage.lol/") and CONFIG.DISPLAY_URL
   (e.g. "internetage.lol") near the top of the <script>, and the og:image / og:url tags in the <head>.
2. From this folder run:  npx vercel --prod
   (log in, accept the defaults; the framework preset is "Other"). Or push the folder to a GitHub repo and import it
   in the Vercel dashboard.
3. Add your domain under the project's Domains settings.
Link previews only work on the production domain: Vercel puts a login in front of preview deployments by default,
so chat apps can't fetch those.

HOW IT WORKS
- Normal visits get the static page (public/app.html, served at "/"). No function runs. It is not named index.html
  because Vercel serves a matching static file before applying rewrites, which would bypass the preview function.
- "/" with ?g= is rewritten (vercel.json) to api/page.js, which serves the same index.html with that board's
  og:title, og:description and og:image filled in. Example title: "Grandma, Dad and 2 others posted their internet ages".
- api/og.js draws the 1200x630 image from the ?g= data, using the fonts in public/fonts. A malformed link, or any
  error while drawing, redirects to the generic /og.png, so a preview is never broken.
- Names are capped at 14 characters and escaped; nothing typed into a name can reach the page's HTML.
- Each new board renders once (about 0.2 to 0.6 seconds), then the CDN caches the image and the page tags.
- Both are Node.js functions, which is Vercel's documented setup for @vercel/og outside Next.js.

ANALYTICS (optional, recommended)
Use Plausible on its Business plan. The result bands, the solo/family mode and the group-link flag are custom
properties, and Plausible only shows those on Business. Paste its script into the <head>. With no extra settings it
keeps the page's privacy promise: no cookies, and it drops query strings, so the names and ages inside group links
never reach it.

Don't install PostHog with its default settings. It records the text of clicked buttons (the answers) and full page
addresses (group links carry everyone's names and ages), which would make the page's privacy line false. If you want
PostHog anyway (it's cheaper at high volume), keep its loader snippet but use this init:

  posthog.init('YOUR_PROJECT_KEY', {
    api_host: 'https://us.i.posthog.com',   // https://eu.i.posthog.com for an EU project
    persistence: 'memory',                   // no cookies or stored IDs
    autocapture: false,                      // clicked-button text would include the answers
    capture_pageview: false,                 // the page sends its own "land" event
    capture_pageleave: false,
    capture_heatmaps: false,
    disable_session_recording: true,
    before_send: function (e) {              // remove ?g= (names and ages) from every address PostHog attaches
      function clean(o) { if (!o) return; for (var k in o) { var v = o[k];
        if (typeof v === 'string' && v.indexOf('g=') > -1) { try { var u = new URL(v); u.searchParams.delete('g'); o[k] = u.href; } catch (_) {} } } }
      if (e) { clean(e.properties); clean(e.$set); clean(e.$set_once);
        if (e.properties) { clean(e.properties.$set); clean(e.properties.$set_once); } }
      return e;
    }
  });

Events the page sends: land, start, complete, share_card, share_card_fallback, share_link, copy_text, pass_mode,
next_player, reveal_start, reveal_done, retake. "complete" carries anonymous result bands only: internet_age and
real_age in 5-year bands, the gap band, the type code, and mode (solo or family). Never answers, names, or exact ages.
Give every creator a UTM link (e.g. ?utm_source=tiktok&utm_campaign=creatorname) so visits are attributed automatically.

KEEP @vercel/og AT 1.0.1
1.0.2 and 1.0.3 (the latest as of Nov 18, 2026) failed in testing here: they load a text-shaping file the package
doesn't include, and their edge build imports a Node-only module. 1.0.1 rendered correctly in plain Node and in
Vercel's edge-runtime emulator. package.json pins it exactly.

FILES
public/app.html, public/og.png      the site (same as the static version)
public/fonts/                         Silkscreen and Archivo Black, SIL Open Font License (license files included)
api/page.js, api/og.js                the two functions
lib/board.js                          reads the ?g= data, same format the page writes
lib/image.js                          the preview layout
