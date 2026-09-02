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
`bakerkick.github.io/shiraume-lodge/`. It works, it is just ugly.

**Job 2 — a nice name that points at it.**
That is the domain. A domain is a signpost. We add one line to the
signpost saying *"concept → send people to the GitHub locker."*

Storage locker, then signpost. That is the whole thing.

---

## The address being built

    concept.shiraumehikosan.com

Confirmed against the GoDaddy account.

## Which file becomes the website

You do not choose. GitHub always serves the file called **index.html**,
and that is the site — every change made so far is in it.

Two HTML files are on GitHub in this branch:

  - `index.html`      ← the website
  - `splash-lab.html` ← a testing page for comparing splash treatments,
                        reachable at /splash-lab.html if someone types it

`Shiraume-Lodge-concept.html` is **not** on GitHub. It is excluded on
purpose: it is a 3.7 MB file rebuilt from the others by
`build-standalone.py` whenever a copy needs emailing.

---

## Job 0 — rename the repository (do this first)

Renaming after Pages is switched on means redoing the later steps, so it
goes first.

1. Open **github.com**, sign in top right. The account is **BakerKick**.
2. On the left, click **replica-** (a repository is a folder of files).
3. Click **Settings** (last tab along the top).
4. The first box is **Repository name**. Change `replica-` to
   `shiraume-lodge` and click **Rename**.

Old links keep working — GitHub redirects them automatically.

**What this does and does not do.** It tidies the free link to
`bakerkick.github.io/shiraume-lodge/`. It does **not** remove your
username from what the boss would see in GoDaddy: the DNS row's Value
field has to say `bakerkick.github.io`, and that is the username, not the
repository name. Hiding that would mean moving to a host where you pick
the name yourself, such as Netlify.

**Tell me once you have renamed it.** My copy still points at the old
address and I cannot push changes until I update it.

---

## Job 1 — turn on the GitHub switch

1. Still in **Settings**, on the repository (now `shiraume-lodge`).
2. Down the left-hand sidebar there is a long list. Scroll down and click
   **Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a
   branch**.
4. Under **Branch** there are two dropdowns. The first says *None*.
   Click it and choose:

       claude/merge-two-websites-96jt72

   **This one matters.** The repository's default branch is an old one
   called `claude/shiraume-lodge-website-c9awyy`. If you leave it on the
   default you will publish a months-old version of the site.

5. The second dropdown is the folder. Choose **/ (root)**.
6. Click **Save**.
7. Wait a minute or two, then reload the page. A box appears at the top:
    *"Your site is live at https://bakerkick.github.io/shiraume-lodge/"*
8. Click that link. The site should load.

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

       concept.shiraumehikosan.com

10. Click **Save**. GitHub checks the signpost. This can take anywhere
    from ten minutes to an hour to go through — if it complains at first,
    wait and press Save again. That is normal, not a mistake.
11. Once it is happy, a tickbox appears: **Enforce HTTPS**. Tick it. This
    is what puts the padlock in the browser bar. It may be greyed out for
    a few minutes while a certificate is issued.

Done. The site is at `https://concept.shiraumehikosan.com`.

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
