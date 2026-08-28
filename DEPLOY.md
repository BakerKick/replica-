# Putting the site online

Written to be followed click by click. No prior knowledge assumed.

---

## First: what is actually happening

The website is a folder of files. Files on your own laptop cannot be seen
by anyone else, because your laptop is not always switched on and has no
public address.

So there are two jobs.

**Job 1 — somewhere to keep the files that is always on.**
That is GitHub. It is free storage on the internet, and the files are
already there; it is where all the work has been saved. GitHub also has a
switch that says *"show these files to the public as a website."* That
switch is off right now. Turning it on gives a free address like
`bakerkick.github.io/replica-/`. It works, it is just ugly.

**Job 2 — a nice name that points at it.**
That is the domain. A domain is a signpost. We add one line to the
signpost saying *"concept → send people to the GitHub locker."*

Storage locker, then signpost. That is the whole thing.

---

## Before you start: check the domain name

Log in to GoDaddy and read the domain name **exactly** as it is written
there, character by character.

Three different spellings have come up in conversation:

  - shiraumehikosan.com
  - shiraume.com
  - hikosanshiraume.com

Those are three different addresses owned by three different people, the
same way `john@gmail.com` and `gmail@john.com` are different people. A
subdomain can only be added to the domain you actually own.

Everywhere below that says `YOURDOMAIN.com`, put the exact name GoDaddy
shows you.

---

## Job 1 — turn on the GitHub switch

1. Open **github.com** in a browser.
2. Sign in, top right. The account is called **BakerKick**. Sign in with
   the email you used to set it up.
3. On the left you will see a list of repositories. Click **replica-**
   (a repository is just a folder of files).
4. Along the top of the page there is a row of tabs: Code, Issues, Pull
   requests, and so on. Click the last one, **Settings**.
5. Down the left-hand sidebar there is a long list. Scroll down and click
   **Pages**.
6. Under **Build and deployment → Source**, choose **Deploy from a
   branch**.
7. Under **Branch** there are two dropdowns. The first says *None*.
   Click it and choose:

       claude/merge-two-websites-96jt72

   **This one matters.** The repository's default branch is an old one
   called `claude/shiraume-lodge-website-c9awyy`. If you leave it on the
   default you will publish a months-old version of the site.

8. The second dropdown is the folder. Choose **/ (root)**.
9. Click **Save**.
10. Wait a minute or two, then reload the page. A box appears at the top:
    *"Your site is live at https://bakerkick.github.io/replica-/"*
11. Click that link. The site should load.

**Stop here and check it works before doing Job 2.** If this link is
broken, pointing the domain at it will not help.

---

## Job 2 — point the domain at it

### In GoDaddy

1. Log in at **godaddy.com**.
2. Top right, click your name, then **My Products**.
3. Under **Domains** you will see the domain. Click **DNS** next to it
   (on some screens it is the three dots, then **Manage DNS**).
4. You will see a table of rows. Each row is one instruction for the
   signpost. **Do not edit or delete any row that is already there** —
   the boss's email is run by some of those rows, and deleting the wrong
   one stops his mail.
5. Click **Add New Record**.
6. Fill it in exactly:

   | Field | What to put            |
   |-------|------------------------|
   | Type  | `CNAME`                |
   | Name  | `concept`              |
   | Value | `bakerkick.github.io`  |
   | TTL   | 1 hour (leave default) |

   In the **Name** box put only the word `concept`, not the whole
   address. GoDaddy adds the rest for you.

7. Click **Save**.

That is the only change made to the domain. Everything already on it
keeps working exactly as before.

### Back in GitHub

8. Return to **Settings → Pages**.
9. In the **Custom domain** box, type the full address:

       concept.YOURDOMAIN.com

10. Click **Save**. GitHub checks the signpost. This can take anywhere
    from ten minutes to an hour to go through — if it complains at first,
    wait and press Save again. That is normal, not a mistake.
11. Once it is happy, a tickbox appears: **Enforce HTTPS**. Tick it. This
    is what puts the padlock in the browser bar. It may be greyed out for
    a few minutes while a certificate is issued.

Done. The site is at `https://concept.YOURDOMAIN.com`.

---

## Changing the site later

Nothing needs reconnecting, ever. Push a change to the branch and the
live site updates itself in about a minute. The address stays the same.

## Undoing it

Delete the one `concept` row in GoDaddy. That is all. Nothing else on the
domain was touched, so nothing else is affected.

---

## Two things to know before you send the link around

**Anyone with the link can open it.** The page says *"Private concept
presentation — please do not share the URL publicly"*, but that is a
polite request, not a lock. GitHub Pages has no password option. The page
does carry a `noindex` tag, so Google will skip it, but that only stops
searching — it does not stop sharing.

**The repository is public.** Anyone can read the source, and the
inquiry form's destination address is written in it in plain text
(`main.js`, near the bottom). If that address should not be public, it
needs changing before the link goes out.
