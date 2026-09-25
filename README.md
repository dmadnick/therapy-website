# deborahmadnicktherapy.com

A single-page static site (plain HTML, CSS and JS). There is no build step.

```
index.html       ← all page content
styles.css       ← colors, fonts, layout
script.js        ← mobile menu + contact form
thank-you.html   ← shown after the form is sent if JavaScript is off
images/          ← leaf.svg (logo), leaf-white.svg (footer logo), favicon.svg, headshot.jpg (add later)
```

## 1. Turn on the contact form (Web3Forms, free)

1. Go to https://web3forms.com, enter **dmadnickpsyd@gmail.com**, and click "Create Access Key".
2. Copy the key from the email they send you.
3. In `index.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key.

Messages will arrive in your Gmail. Check the spam folder the first time you test it.

## 2. Add your headshot

Save the photo as `images/headshot.jpg`. A portrait shape works best, about 1000×1250 px.
In `index.html`, search for `HEADSHOT` and follow the note there.

## 3. Deploy on Cloudflare Pages

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Upload assets**.
2. Name the project (for example `deborahmadnicktherapy`) and upload this folder.
   Leave out `.claude/`, `README.md` and `logo-options.html`.
3. Open **Custom domains → Set up a custom domain** and enter `deborahmadnicktherapy.com`
   (and `www.deborahmadnicktherapy.com`). If you bought the domain through Cloudflare, the DNS is set up automatically.

To update the site later, upload the folder again under **Create new deployment**.
