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

## Step 1 — Deploy first, then get your form code

FormSubmit will not give you a code until a form has actually been submitted.
So the order is: put the site online, submit your own form once, then swap the
code in. The form is already set up to work on the first deploy — do step 3
before this one if you like, it makes no difference.

1. With the site online, open it and **send yourself a message through the
   contact form.**
2. FormSubmit emails you. That email has two things: an **activation link**
   and a **random code**.
3. Click the activation link. Your form is now live — messages start arriving.
4. Open `index.html` and find this line near the bottom:

   ```js
   const FORM_ENDPOINT = 'https://formsubmit.co/ajax/bakeyalrawi@gmail.com';
   ```

5. Replace your email address with the random code, so it reads:

   ```js
   const FORM_ENDPOINT = 'https://formsubmit.co/ajax/YOUR-RANDOM-CODE';
   ```

6. Push the change. The site updates itself.

Step 5 is the part that takes your email address off the page. Until you do it,
anyone reading the page source can see your Gmail. That is not dangerous —
it just means more spam over time.

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
