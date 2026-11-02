# Layered Relics — website

The website for **Layered Relics**: *Mythic-Grade 3D Prints*, including dice towers, decor and custom gaming materials.

This is a small static site built with plain HTML, CSS and JavaScript. It has no build step and no framework, and it is published by GitHub Actions to GitHub Pages and to Namecheap hosting. It is meant as an interim site until the shop moves to a full ecommerce platform such as Shopify or Etsy. The product data is kept in one file so that move is straightforward.

```
index.html              The page: hero, categories, collection (hidden for now), custom orders, about, contact
404.html                "Page not found" page
css/styles.css          All styles (brand colours are CSS variables at the top)
js/config.js            Site settings: collection on/off, contact email, form endpoint, buy-button label
js/main.js              Menu toggle, product grid + filters, inquiry form
data/products.json      ← The product list. Edit this to change what's shown.
assets/logo.svg         Logo (vector)
assets/favicon.svg      Browser-tab icon (+ favicon-32.png, apple-touch-icon.png)
assets/og-image.png     Preview image shown when the link is shared on social media
assets/products/        Product images (currently placeholders)
.github/workflows/pages.yml          Auto-deploy to GitHub Pages on push to main
.github/workflows/namecheap-ftp.yml  Auto-deploy to Namecheap over FTPS on push to main (off until set up)
```

---

## 1. Where the site is published

The same files are published to two places by two GitHub Actions workflows. Both run on every push to `main`.

| Where | Workflow | Used for |
|---|---|---|
| **https://thaylin.github.io/layeredrelics/** | `pages.yml` | Free review copy on GitHub Pages |
| **https://layeredrelics.com/preview/** (later **https://layeredrelics.com/**) | `namecheap-ftp.yml` | Your real domain, hosted on Namecheap |

`layeredrelics.com` is hosted on **Namecheap shared hosting**. Its DNS points to the Namecheap server, not to GitHub, and that is intended. The domain is served from the cPanel folder `~/layeredrelics.com/`, which currently holds the older website-builder site. There is deliberately **no `CNAME` file** and **no custom domain set in GitHub Pages**. Setting either would conflict with the Namecheap hosting.

All asset paths are relative, so the same files work at all of these addresses.

### 1a. GitHub Pages (one-time setup)

1. Merge the site into the `main` branch.
2. On GitHub, open **thaylin/layeredrelics → Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**. Leave **Custom domain** empty.
4. Open the **Actions** tab. The *Deploy to GitHub Pages* workflow runs on every push to `main`. You can also start it by hand with **Run workflow**.
5. After it finishes, the site is live at **https://thaylin.github.io/layeredrelics/**.

### 1b. Deploying to Namecheap (one-time setup)

The *Deploy to Namecheap (FTP)* workflow uploads the site over FTPS (encrypted FTP). It stays **switched off** until you complete these steps. It starts by deploying to a `preview/` folder, so the current site at layeredrelics.com isn't affected.

1. **Create a dedicated FTP account in cPanel.** Go to **cPanel → Files → FTP Accounts → Add FTP Account**:
   - Log in: for example `deploy-preview`, which becomes `deploy-preview@layeredrelics.com`
   - Password: use **Generate** for a strong one, and copy it
   - **Directory: `layeredrelics.com/preview`**. This locks the account to that folder, and cPanel creates the folder for you.
2. **Find the FTP server name.** Use the server hostname shown in cPanel's *General Information* panel (it looks like `serverNNN.web-hosting.com`), or the host shown under *Configure FTP Client* for the new account. The server hostname is the safest choice for FTPS, because its certificate matches.
3. **Add the login to GitHub.** Open **thaylin/layeredrelics → Settings → Secrets and variables → Actions**.
   - **Secrets** tab → *New repository secret*, three times:
     - `FTP_SERVER`: the server name from step 2
     - `FTP_USERNAME`: the full FTP login, for example `deploy-preview@layeredrelics.com`
     - `FTP_PASSWORD`: the password from step 1
   - **Variables** tab → *New repository variable*:
     - `FTP_DEPLOY_ENABLED` = `true`
     - Optionally, `FTP_SERVER_DIR`. Leave it unset to upload into the FTP account's own folder, which is what you want with a locked account.
4. **Run it.** Go to **Actions → Deploy to Namecheap (FTP) → Run workflow**, or push to `main`. Then open **https://layeredrelics.com/preview/**.

Never commit FTP passwords to the repo. Keep them only in GitHub secrets.

The deploy tool records what it uploaded in a file called `.ftp-deploy-sync-state.json` on the server. It only ever updates or deletes files it uploaded itself, so existing files and folders such as `.well-known/` (used to renew the HTTPS certificate) and `cgi-bin/` are left alone.

### 1c. Switching layeredrelics.com over to the new site

When you're happy with `/preview/`:

1. **Back up the current site.** In **cPanel → File Manager**, open your home folder, right-click `layeredrelics.com` → **Compress** → zip, then download the zip.
2. **Remove the old website-builder files** from `layeredrelics.com/`. That includes `index.html`, `api.php`, `sitemap.xml`, `css/`, `js/`, `images/`, `bundles/`, the template folders and the now-unneeded `preview/`. **Keep `.well-known/` and `cgi-bin/`.**
3. **Re-target the deploy.** In **cPanel → FTP Accounts**, create an account locked to `layeredrelics.com`, for example `deploy@layeredrelics.com`. Update the `FTP_USERNAME` and `FTP_PASSWORD` secrets to the new account, then delete the old preview account. Run the workflow again.
4. **Show the 404 page for missing URLs.** Add a file named `.htaccess` to the repo root with this line:
   ```
   ErrorDocument 404 /404.html
   ```
   Then add `.htaccess` to the `cp` line in both workflows.
5. **Update the share links.** In `index.html`, change `og:url` and `og:image` from `https://thaylin.github.io/layeredrelics/` to `https://layeredrelics.com/`. If you want the domain listed on the page, add it to the contact card at the same time.
6. **Optional:** once layeredrelics.com is the main site, you can turn GitHub Pages off in **Settings → Pages**, or keep it as a backup copy.

### 1d. Hosting other repos on the same Namecheap account

Give every repo its own folder and its own FTP account:

- **Separate domain or subdomain.** In cPanel, add the domain (*Domains*) or subdomain (*Subdomains*). cPanel creates its folder, for example `~/shop.layeredrelics.com/`. Create an FTP account locked to that folder, copy `namecheap-ftp.yml` into the other repo, and add that account's secrets there.
- **Subfolder of this site** (for example `layeredrelics.com/something/`). Lock that repo's FTP account to the subfolder. Then, in this repo's `namecheap-ftp.yml`, add an `exclude:` entry for `something/**` so the two deploys never interfere with each other.

### Pointing the domain at GitHub Pages instead (not planned)

Only do this if you decide to stop using Namecheap hosting for the domain. Change the DNS records for `layeredrelics.com` to GitHub's: four **A** records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, plus a **CNAME** record for `www` pointing to `thaylin.github.io`. Then enter the domain under **Settings → Pages → Custom domain** and enable **Enforce HTTPS**. A `CNAME` file in the repo root is optional; `pages.yml` already copies it if one exists.

---

## 2. Showing the collection

**The Collection is switched off for now**, until real product photos are ready. While it's off:

- the product grid, its **Collection** nav link and the **Browse the Collection** button are hidden;
- the hero shows **Request a Custom Print** and **See What We Make** instead;
- each "What We Forge" card links to the inquiry form with the matching request type already selected.

Nothing has been deleted. `data/products.json` and the grid code are still in place.

**To turn it back on:**

1. Add the real photos and update `data/products.json` (see the next two sections).
2. In `js/config.js`, change `showCollection: false` to `showCollection: true`.
3. Commit. The nav link, the Browse button, the filtered category links and the product grid all come back automatically.

## 3. Editing products

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

## 4. Swapping placeholder images

The current product images in `assets/products/placeholder-*.svg` are illustrated stand-ins. Each one is labelled **PLACEHOLDER**, and the site shows a "Placeholder photo" badge on those products. To use a real photo:

1. Take a photo with a **4:3 landscape** shape, ideally about 1200×900 px. Other shapes are cropped to fit.
2. Save it as a `.jpg` or `.webp` under about 300 KB, for example with <https://squoosh.app>.
3. Put it in `assets/products/`, for example `assets/products/keep-dice-tower.jpg`.
4. In `data/products.json`, update that product's `image` and `imageAlt`, and set `"placeholder": false`.
5. Delete any `placeholder-*.svg` files that are no longer used.

**Other content to personalise:**

- The **About** section in `index.html` contains placeholder story text, marked by a comment that starts with `OWNER:` and a visible "Placeholder copy" note. Replace the paragraphs with your own words, then delete the `<p class="placeholder-note" …>` line.
- Contact is **email only** (`thaylin@gmail.com`). It appears in `index.html` (custom-orders section, contact section and footer) and in `js/config.js` (`email`), which is used for the product buttons and the form fallback. The site intentionally lists no phone number.
- Brand colours and fonts are the CSS variables at the top of `css/styles.css`.

## 5. Inquiry form

By default the **Commission a Relic** form needs no server. When a visitor submits it, their own email app opens with the message already filled in and addressed to `thaylin@gmail.com`.

To receive submissions directly instead, which also works for visitors who have no email app set up:

1. Create a free form at <https://formspree.io>. Any similar service that accepts a standard form `POST` will also work.
2. Copy the form endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `js/config.js` as the `formEndpoint` value.
4. Submit a test request on the live site. Formspree asks you to confirm the first submission.

The form already includes a hidden `_gotcha` field that Formspree uses to filter spam.

## 6. Previewing locally

`fetch()` doesn't work from `file://` URLs, so serve the folder with any static server instead of double-clicking `index.html`:

```sh
python -m http.server 8000
# then open http://localhost:8000/
```

## 7. Moving to Shopify or Etsy later

The site is set up so you can change platforms gradually:

- **Step 1: keep this site and link out.** Turn the collection on (section 2), then list each product on Etsy or Shopify, then paste each listing URL into that product's `buyUrl`. The buttons change from *Ask About This* to *Buy Now* and send buyers to the listing. Nothing else needs to change.
- **Step 2: full move.** `data/products.json` already contains the fields most shops ask for (name, description, price, category, image). Copy them across by hand, or turn the file into a CSV for Shopify's product import. For example, open the JSON in a converter such as <https://konklone.io/json/> and map the columns to Shopify's CSV template. Reuse the real photos from `assets/products/`, `logo.svg` and the colours in `css/styles.css` for the shop theme.
- **Step 3: point the domain.** Once the new shop is live, move the `layeredrelics.com` DNS records to the new platform by following its custom-domain guide. Then turn off GitHub Pages in **Settings → Pages**, or keep this site as a simple landing page that links to the shop.
