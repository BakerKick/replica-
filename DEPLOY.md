# Putting the site online

Two stages. Stage 1 costs nothing, needs nobody else, and gives a working
link today. Stage 2 attaches the real domain once the boss has approved it.

---

## Stage 1 — the free link (do this first)

The site is plain HTML at the root of this repo, so GitHub can host it as-is.

1. Go to **github.com/BakerKick/replica- → Settings → Pages**
2. Under **Source**, choose **Deploy from a branch**
3. **Branch:** `claude/merge-two-websites-96jt72` — **Folder:** `/ (root)`
4. **Save**

Wait about a minute, then reload the Settings → Pages page. It shows the
live address, which will be:

    https://bakerkick.github.io/replica-/

That link is safe to send to anyone. It is served over https, and the page
carries a `noindex` tag so search engines skip it.

### Nicer address (optional, free)

Rename the repository in **Settings → General → Repository name** from
`replica-` to `shiraume-lodge`, and the address becomes:

    https://bakerkick.github.io/shiraume-lodge/

Renaming is safe — GitHub redirects the old address automatically.

### Updating the live site

Push a change to the branch Pages is serving. The site rebuilds itself in
about a minute. The address never changes, and nothing needs reconnecting.

---

## Stage 2 — attaching shiraumehikosan.com

### Prefer a subdomain

Ask for `preview.shiraumehikosan.com` (or `concept.`) rather than the bare
domain. It only **adds** one new record and changes nothing that already
exists, so it cannot disturb the boss's email or anything else on the
domain, and removing it later is deleting one line.

At the domain registrar, add one record:

| Type  | Name      | Value                |
|-------|-----------|----------------------|
| CNAME | `preview` | `bakerkick.github.io` |

Then in **Settings → Pages → Custom domain**, enter
`preview.shiraumehikosan.com` and save. Tick **Enforce HTTPS** once it
becomes available (it can take a few minutes while the certificate is
issued).

### If the bare domain is wanted instead

`shiraumehikosan.com` with no prefix needs A records rather than a CNAME,
and those touch the domain's root. **Do not type IP addresses from memory
or from a guide.** Enter the custom domain in Settings → Pages first —
GitHub then displays the exact records to create. Use precisely those.

Before doing this, confirm with the domain owner whether any email runs on
the domain. Website records (A / CNAME) and mail records (MX) are separate,
so adding the website does not remove email — but it is worth knowing what
is there before changing anything at the root.

### Undoing it

Delete the record at the registrar and clear the Custom domain field in
Settings → Pages. The site returns to its `github.io` address. Nothing is
lost, and the domain is unaffected.

---

## Note on the enquiry forms

Forms post to the service set in `FORM_ENDPOINT` at the top of `main.js`.
That address has to be confirmed once: submit the form on the live site,
then click the link in the confirmation email that arrives.

Form services reject submissions from pages opened as local files, so on a
downloaded copy the form opens the visitor's email app with the details
filled in instead. On the hosted site it submits normally.
