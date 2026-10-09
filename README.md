# deborahmadnicktherapy.com

A single-page static site (plain HTML, CSS and JS). There is no build step.

```
index.html       ← home page (all main sections)
about.html       ← full About Me page (bio, education, training, publications)
styles.css       ← colors, fonts, layout
script.js        ← mobile menu + contact form
worker/index.js  ← Cloudflare Worker: serves the site and emails contact form messages
thank-you.html   ← shown after the form is sent if JavaScript is off
robots.txt       ← tells search engines where the sitemap is
sitemap.xml      ← list of pages for search engines (update lastmod when pages change)
images/          ← hero.jpg, ocean.jpg, path.jpg (Unsplash photos), favicon.svg, apple-touch-icon.png, headshot.jpg
```

## 1. Contact form (Cloudflare Email Routing)

The form posts to `/api/contact`, handled by `worker/index.js`, which emails each message to
**dmadnickpsyd@gmail.com** from `hello@deborahmadnicktherapy.com` (replies go to the visitor).

This requires Email Routing to be enabled on the domain in Cloudflare, with
`dmadnickpsyd@gmail.com` verified as a destination address. Check spam the first time you test it.

## 2. Deploy on Cloudflare Workers

The site deploys from GitHub (`dmadnick/therapy-website`) using `wrangler.jsonc`.
Files listed in `.assetsignore` are not published.

1. In the Cloudflare dashboard, go to **Workers & Pages → Create application**.
2. Next to **Import a repository**, select **Get started**, connect GitHub, and pick `therapy-website`.
3. Leave the build command empty and keep the deploy command `npx wrangler deploy`, then **Save and Deploy**.
4. In the Worker, open **Settings → Domains & Routes → Add → Custom domain** and add
   `deborahmadnicktherapy.com` (and `www.deborahmadnicktherapy.com`).

After that, every `git push` to `main` redeploys the site automatically.

## Photo credits

Photos are from Unsplash (free to use under the Unsplash License; credit not required):

- `images/hero.jpg`: Spencer DeMera, https://unsplash.com/photos/jUlVz51P0Yk
- `images/ocean.jpg`: Clark Gu, https://unsplash.com/photos/sbNlS7dWqKE
- `images/path.jpg`: Florian Cordier, https://unsplash.com/photos/uq1MFvHcRUg
