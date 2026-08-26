# Shiraume Lodge — Pre-Launch Security Review

Reviewed: the single-file build `ShiraumeLodgeconcept_6.html` (7,480 lines; 4 script
blocks; ~3.9 MB once fonts and photographs are inlined), plus the tracked
`index.html`, `base.css` and `style.css` in this repository.

Note that the two are not the same site. The tracked `index.html` is an earlier
draft whose enquiry form does not submit anywhere — it hides itself and shows a
confirmation. The single-file build is the current site, and it is the one that
posts real enquiries to a live endpoint. Everything below refers to the build
unless it says otherwise.

## What this site is, and what that rules out

A static page. No server, no database, no accounts, no sessions, no login, no
file uploads, no API keys, no server-side code of any kind. The only thing that
leaves the browser is an enquiry POST to a third-party form service.

So a good part of the usual pre-launch checklist has nothing to attach to here:
password hashing, session expiry, email verification, password-reset tokens,
IDOR and ownership checks, SQL and command injection, upload validation. There
is no authentication system to harden and no data store to protect. A secrets
scan across the whole file found no keys, tokens, credentials or connection
strings.

That leaves a narrower and more honest set of risks: where enquiries go, who can
post to that endpoint, what the page leaks to third parties, and what the
markup would do if the room data ever stopped being hardcoded.

## Findings

### 1. The enquiry endpoint embeds a personal address and is open to anyone — Medium, partly fixed

```js
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/bakeyalrawi@gmail.com';  // line 7174
const CONTACT_EMAIL = 'bakeyalrawi@gmail.com';                            // line 7176
```

Two separate problems. The address is in plain sight in the page source, so any
scraper harvests it the moment the site is public. And because the endpoint is
keyed on the address itself, anyone who reads it can POST to that URL directly
from anywhere — curl, a script, a competitor — without ever loading the page.
None of the page's own defences apply to a request that never touches the page.

Decision taken: move to the hashed endpoint, keep the same Gmail as the
destination.

`FORM_ENDPOINT` is now empty, with the instructions for obtaining the hash in
the comment above it. FormSubmit only issues the hash once the address is
activated, so that string has to be pasted in by hand — it is the one step left
before launch. Until then the forms fail honestly rather than silently: they say
the form is not connected and point the visitor at the contact address.

`CONTACT_EMAIL` still holds the Gmail (line 7186). That is deliberate — it is
the address shown to a visitor when delivery fails, and the `mailto:` target
when someone opens a downloaded copy of the file, so emptying it would remove a
working fallback. It does mean the address remains in the page source for
scrapers, even though the openly-postable endpoint is gone. Setting it to `''`
closes that too; the code already handles the empty case in every branch, at the
cost of those two fallbacks.

### 2. Captcha was switched off — Fixed

```js
const FORM_EXTRA_FIELDS = { _template: 'table', _captcha: 'false' };
```

This disabled the form service's own spam filtering, leaving the honeypot as the
only defence. Changed to `'true'`.

### 3. The honeypot is well built but cannot carry this alone — Informational

The spam trap is done properly: positioned off-screen rather than
`display: none` (bots skip hidden fields and fill this one), `tabindex="-1"`,
`aria-hidden`, `autocomplete="off"`, on both forms.

It stops indiscriminate bots. It does not stop anyone who looks at the page
once: the field's id is right there in the source, and skipping it is a single
line. That is why finding 2 matters.

### 4. Rate limiting is not something this page can do — Informational

The submit handler disables the button while a request is in flight, which stops
a visitor double-clicking. Against a script it does nothing at all, and nothing
written in the page ever could — the attacker controls the browser, or skips it
entirely per finding 1.

Real throttling has to come from the form service's own limits and from the host
(Cloudflare, Netlify or Vercel rules in front of the site).

### 5. The privacy notice did not match what the form does — Fixed

The form said, in both languages, that information "will not be shared with
third parties" — while posting names and email addresses through a third-party
relay service. Reworded in English and Japanese to say that details are relayed
by a form-delivery service and used for nothing else.

If you expect enquiries from the EU or UK, a short privacy note naming that
processor is the safer footing, since names and email addresses are personal
data under GDPR.

### 6. The private URL was leaking to third parties — Fixed

Four images load from `images.unsplash.com` and three links point to external
sites. Every one of those requests carried the full URL of this page as a
`Referer` header, into logs you do not control. `noindex, nofollow` keeps the
page out of search results; it does nothing about this.

Added `<meta name="referrer" content="strict-origin-when-cross-origin">`.

### 7. `noindex` is not access control — Informational

Worth stating plainly since the page describes itself as a private concept
presentation. `noindex, nofollow` is a request to search engines. Anyone holding
the link — forwarded, pasted, sitting in someone's browser history — sees the
whole site. If the concept is genuinely confidential before launch, put HTTP
basic auth or the host's password protection in front of it.

### 8. No security headers — Low, and host-level

Worth setting wherever this deploys: `Strict-Transport-Security`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `X-Frame-Options: DENY`
(or `frame-ancestors 'none'`) so the page cannot be framed.

A Content-Security-Policy is not practical for the single-file build. It contains
4 inline `<script>` blocks, 8 inline `onerror=` handlers, 7 `onclick=` and 2
`onsubmit=` — all of which need `unsafe-inline`, which removes most of the point
of having a CSP. If you deploy the multi-file version instead, move the scripts
to external files and a real policy becomes worth writing.

### 9. `innerHTML` string-building — latent, not exploitable today

`populateRoom` (lines 7106–7144) assembles markup by concatenation, including an
`onclick="goRoom('...')"` attribute built from a string.

This is safe as written. Every value comes from the hardcoded `ROOMS` object,
`goRoom` validates its argument against that object (`if (!ROOMS[slug]) return;`),
and nothing anywhere on the page reads from the URL, query string or hash — so
no attacker-controlled value can reach the DOM.

Flagging it because that stops being true the moment room data comes from a CMS,
an API, or a URL parameter. At that point this is an XSS hole. If that change is
coming, move to `textContent` and `createElement` first.

### 10. Third-party image dependency — Low

The four season photographs load from Unsplash: outside your control, and they
change or disappear on someone else's schedule. There are `onerror` fallbacks so
the section degrades rather than breaking. Self-host them if the page needs to
render reliably or offline.

## Not security, but noticed

`<meta name="viewport" ... maximum-scale=1>` blocks pinch-zoom on mobile. That is
an accessibility problem for anyone who needs to magnify text.

## Applied in this review

Five changes, made to a copy of the single-file build:

| # | Change | Location |
|---|--------|----------|
| 1 | `FORM_ENDPOINT` moved off the address-keyed URL to an empty hashed-endpoint slot | line 7184 |
| 2 | `_captcha: 'false'` → `'true'` | line 7185 |
| 6 | Added `<meta name="referrer" content="strict-origin-when-cross-origin">` | line 9 |
| 5 | Privacy notice reworded, English | line 5390 |
| 5 | Privacy notice reworded, Japanese | line 5391 |

All four script blocks were re-parsed after editing and are syntactically clean.

Because the single-file build is generated (`build-standalone.py`), make these
same edits in the source tree or the next rebuild will drop them.

## Before launch

1. Paste the hashed endpoint into `FORM_ENDPOINT` and send one test enquiry
   through both forms to confirm it arrives (finding 1). The site cannot receive
   enquiries until this is done.
2. Carry the five fixes above into the source tree.
3. Set the security headers at the host (finding 8).
4. Decide whether the site needs password protection, not just `noindex`
   (finding 7).
