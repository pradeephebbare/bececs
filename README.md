# Electronics & Computer Engineering Department Website

Static website (HTML, CSS, JavaScript) - no build step and no external libraries or CDNs.

Run locally: `python3 -m http.server 8080`, then open http://localhost:8080

## Contact form -> HOD's inbox

Enquiries go straight to **hodei@becbgk.edu** (no mail app opens on the visitor's device).
The form posts to a mail-forwarding service (FormSubmit), which e-mails the HOD.

**One-time activation (required):** after you publish the site, send one test message through the
form. FormSubmit sends an activation e-mail to hodei@becbgk.edu - the HOD must open it and click
the confirm link. Messages are delivered normally after that. Check the spam folder if it does not arrive.

To change the recipient or provider, edit the `CONFIG` block at the top of `contact.js`
(`recipient` and `endpoint`) and, if the provider changes, the host in the `connect-src` part of the
Content-Security-Policy (see below). If sending ever fails, the visitor sees a "Try again" button and a
pre-filled "Open email app" fallback, so no enquiry is lost.

## Security

- **Content-Security-Policy** on every page: only this site's own scripts/styles/fonts run; inline scripts
  and styles are not allowed; the form may only talk to formsubmit.co; only Google Maps may be framed.
- Fonts and icons are **self-hosted** (`assets/`) - no Google/Cloudflare requests, so no third-party tracking.
- No inline event handlers, no `innerHTML` with data, all external links use `rel="noopener noreferrer"`.
- Form: validation, length limits, hidden bot trap, minimum-fill-time check, per-browser rate limit.
- Photos were re-saved without hidden metadata (EXIF/GPS).
- `_headers` (Netlify / Cloudflare Pages) and `.htaccess` (Apache) add the headers a `<meta>` tag cannot:
  HSTS, `frame-ancestors`, `nosniff`, Permissions-Policy, HTTPS redirect, no directory listing.
  GitHub Pages cannot set headers; the in-page CSP still protects it.
- If you add a new external service (analytics, YouTube embed, etc.) you must also allow it in the CSP,
  in all HTML files and in `_headers` / `.htaccess`.

## Files

- `index.html`, `labs.html`, `sdp-events.html`, `otech-events.html`, `magazine.html`, `events.html`
- `style.css`, `refined.css` (original design) and `enhance.css` (responsive fixes, form states, toasts)
- `script.js` (navigation, galleries), `contact.js` (enquiry form), `enhance.js` (search, toasts, prefetch)
- `motion.js`, `scene3d.js` (animated background; honours reduced-motion and Save-Data)
- `assets/` self-hosted fonts and Font Awesome

## Adding content

- New gallery: add an entry to `eventGalleries` in `script.js`, then a button with `data-gallery="galleryN"`.
- New magazine issue: add an `<option>` in `magazine.html` and put the PDF in `magazines/`.
