# Putting the site online

Plain steps. Nothing here needs you to understand the security review.

## What each file is

| File | What it is |
|------|-----------|
| `index.html` | **The site.** This is what visitors see. |
| `privacy.html` | The privacy policy, linked from the footer. |
| `404.html` | Shown when someone types a wrong address. |
| `_headers` | Security settings. You never need to open this. |
| `archive/` | An older draft, kept in case you want it. Not part of the live site. |

## Step 1 — Reconnect the contact form

**Right now the forms do not send anything.** Do this first or you will launch a
site nobody can contact you through.

1. Go to **formsubmit.co**
2. Enter your Gmail address and submit
3. FormSubmit emails you to confirm — click the link
4. They give you a **random code** that looks like `a1b2c3d4e5f6...`
5. Open `index.html`, find the line near the bottom that says:

   ```js
   const FORM_ENDPOINT = '';   // ← paste the hashed endpoint here before launch
   ```

6. Change it to (using your own code):

   ```js
   const FORM_ENDPOINT = 'https://formsubmit.co/ajax/a1b2c3d4e5f6';
   ```

Use the code, **not** your email address. That is the whole point — the code
delivers to your inbox without putting your address on the page.

## Step 2 — Fill in the privacy policy

Open `privacy.html`. Everything highlighted in **yellow** needs replacing.
There are 18 of them but only 4 distinct answers:

- Your company's registered address
- An email address for privacy questions (your Gmail is fine)
- How long you keep enquiry emails — **12 months** is a normal answer
- Who hosts the site — **Cloudflare Pages**, once you finish step 3

Also replace `[DATE]` / `[日付]` with today's date.

## Step 3 — Put it online with Cloudflare Pages

1. Make a free account at **dash.cloudflare.com**
2. In the sidebar: **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**
3. Authorise GitHub and pick the **replica-** repository
4. When it asks for build settings, leave everything blank:
   - Framework preset: **None**
   - Build command: **leave empty**
   - Output directory: **leave empty** (or `/`)
5. Click **Save and Deploy**

Done. You get a free address like `replica.pages.dev` with HTTPS already on.
Every time you push to GitHub, the site updates itself.

## Step 4 — Test it before telling anyone

- Open the site and send yourself a message through **both** forms.
  Check they arrive. If they don't, step 1 is wrong.
- Type a made-up address like `yoursite.pages.dev/nonsense` — you should see
  the 404 page, not an error.
- Click **Privacy Policy** in the footer and check it loads.

## Optional — Lock it behind a password

Your site says "Private Presentation" but anyone with the link can read it.
To actually restrict it:

Cloudflare dashboard → **Zero Trust** → **Access** → **Applications** →
**Add an application** → **Self-hosted**. Point it at your site and add the
email addresses allowed in. They get a one-time code by email to get in.

Free for up to 50 people.

## Using your own domain later

In your Cloudflare Pages project: **Custom domains** → **Set up a domain**.
Cloudflare handles the HTTPS certificate automatically. Nothing in the code
needs to change.
