# Layered Relics — website

The website for **Layered Relics**: *Mythic-Grade 3D Prints*, including dice towers, decor and custom gaming materials.

This is a small static site built with plain HTML, CSS and JavaScript. It has no build step and no framework, and it is hosted for free on GitHub Pages. It is meant as an interim site until the shop moves to a full ecommerce platform such as Shopify or Etsy. The product data is kept in one file so that move is straightforward.

```
index.html              The page: hero, categories, collection, custom orders, about, contact
404.html                "Page not found" page served by GitHub Pages
css/styles.css          All styles (brand colours are CSS variables at the top)
js/config.js            Site settings: contact email, form endpoint, buy-button label
js/main.js              Menu toggle, product grid + filters, inquiry form
data/products.json      ← The product list. Edit this to change what's shown.
assets/logo.svg         Logo (vector)
assets/favicon.svg      Browser-tab icon (+ favicon-32.png, apple-touch-icon.png)
assets/og-image.png     Preview image shown when the link is shared on social media
assets/products/        Product images (currently placeholders)
.github/workflows/pages.yml   Auto-deploy to GitHub Pages on push to main
```

---

## 1. Publishing on GitHub Pages (one-time setup)

1. Merge the site into the `main` branch.
2. On GitHub, open **thaylin/layeredrelics → Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open the **Actions** tab. The *Deploy to GitHub Pages* workflow runs on every push to `main`. You can also start it by hand with **Run workflow**.
5. After it finishes, the site is live at **https://thaylin.github.io/layeredrelics/**.

All asset paths are relative, so the same files work at that address and on a custom domain.

### Adding the custom domain (layeredrelics.com) later

Do this once you control the DNS for `layeredrelics.com`.

1. At your domain registrar, add these DNS records:
   - For the apex domain `layeredrelics.com`, add four **A** records pointing to
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
     For IPv6 you can also add **AAAA** records for `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` and `2606:50c0:8003::153`.
   - For `www`, add a **CNAME** record pointing to `thaylin.github.io`.
2. In **Settings → Pages → Custom domain**, enter `layeredrelics.com` and click **Save**. When the DNS check passes, tick **Enforce HTTPS**. The certificate can take up to about an hour to appear.
3. Optionally, commit a file named `CNAME` (no file extension) at the repo root that contains the single line `layeredrelics.com`. The workflow already copies it into the published site if it exists. With the *GitHub Actions* source, the Settings field is what actually controls the domain, so the file is only a record of the setting.
4. Update the two absolute URLs in `index.html` (`og:url` and `og:image`) from `https://thaylin.github.io/layeredrelics/` to `https://layeredrelics.com/`, so link previews use the new domain.
5. Optional, recommended: [verify the domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages) in your GitHub account settings, so nobody else can claim it.

---

## 2. Editing products

Everything in **The Collection** comes from `data/products.json`. Each product looks like this:

```json
{
  "id": "keep-dice-tower",
  "name": "Ruined Keep Dice Tower",
  "category": "dice-towers",
  "description": "A crumbling castle keep with internal baffles…",
  "price": "From $45",
  "image": "assets/products/keep-dice-tower.jpg",
  "imageAlt": "Grey castle dice tower with a copper gate, next to a red d20",
  "placeholder": false,
  "featured": true,
  "buyUrl": ""
}
```

| Field | What it does |
|---|---|
| `id` | A unique short name with no spaces. |
| `name` | The product title. |
| `category` | One of the `id`s in the `categories` list at the top of the file (`dice-towers`, `decor`, `gaming`). You can add new categories there, and a filter button appears for each one automatically. |
| `description` | One or two sentences. |
| `price` | Text shown exactly as written, for example `"$32"`, `"From $45"` or `"Ask for a quote"`. |
| `image` | The image path, relative to the site root. |
| `imageAlt` | A short description of the photo for screen readers. Describe what is in the picture. |
| `placeholder` | Set to `true` to show a "Placeholder photo" badge. Set to `false` when you use a real photo. |
| `featured` | Featured products are listed first. |
| `buyUrl` | Leave it as `""` to show an **Ask About This** button, which opens a pre-filled email. Paste an Etsy or Shopify listing URL here to show a **Buy Now** button that opens the listing instead. |

You can edit the file directly on GitHub: open the file, click the pencil icon, then **Commit changes**. The site redeploys automatically. Keep the JSON valid: wrap text in double quotes, put commas between items, and leave no comma after the last item. If the page shows "The collection couldn't load", the JSON usually has a typo. Paste it into <https://jsonlint.com> to find the problem.

## 3. Swapping placeholder images

The current product images in `assets/products/placeholder-*.svg` are illustrated stand-ins. Each one is labelled **PLACEHOLDER**, and the site shows a "Placeholder photo" badge on those products. To use a real photo:

1. Take a photo with a **4:3 landscape** shape, ideally about 1200×900 px. Other shapes are cropped to fit.
2. Save it as a `.jpg` or `.webp` under about 300 KB, for example with <https://squoosh.app>.
3. Put it in `assets/products/`, for example `assets/products/keep-dice-tower.jpg`.
4. In `data/products.json`, update that product's `image` and `imageAlt`, and set `"placeholder": false`.
5. Delete any `placeholder-*.svg` files that are no longer used.

**Other content to personalise:**

- The **About** section in `index.html` contains placeholder story text, marked by a comment that starts with `OWNER:` and a visible "Placeholder copy" note. Replace the paragraphs with your own words, then delete the `<p class="placeholder-note" …>` line.
- Contact details appear in `index.html` (contact section and footer) and in `js/config.js` (`email`).
- Brand colours and fonts are the CSS variables at the top of `css/styles.css`.

## 4. Inquiry form

By default the **Commission a Relic** form needs no server. When a visitor submits it, their own email app opens with the message already filled in and addressed to `thaylin@gmail.com`.

To receive submissions directly instead, which also works for visitors who have no email app set up:

1. Create a free form at <https://formspree.io>. Any similar service that accepts a standard form `POST` will also work.
2. Copy the form endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `js/config.js` as the `formEndpoint` value.
4. Submit a test request on the live site. Formspree asks you to confirm the first submission.

The form already includes a hidden `_gotcha` field that Formspree uses to filter spam.

## 5. Previewing locally

`fetch()` doesn't work from `file://` URLs, so serve the folder with any static server instead of double-clicking `index.html`:

```sh
python -m http.server 8000
# then open http://localhost:8000/
```

## 6. Moving to Shopify or Etsy later

The site is set up so you can change platforms gradually:

- **Step 1: keep this site and link out.** List each product on Etsy or Shopify, then paste each listing URL into that product's `buyUrl`. The buttons change from *Ask About This* to *Buy Now* and send buyers to the listing. Nothing else needs to change.
- **Step 2: full move.** `data/products.json` already contains the fields most shops ask for (name, description, price, category, image). Copy them across by hand, or turn the file into a CSV for Shopify's product import. For example, open the JSON in a converter such as <https://konklone.io/json/> and map the columns to Shopify's CSV template. Reuse the real photos from `assets/products/`, `logo.svg` and the colours in `css/styles.css` for the shop theme.
- **Step 3: point the domain.** Once the new shop is live, move the `layeredrelics.com` DNS records to the new platform by following its custom-domain guide. Then turn off GitHub Pages in **Settings → Pages**, or keep this site as a simple landing page that links to the shop.
