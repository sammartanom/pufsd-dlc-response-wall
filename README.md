# PUFSD Digital Learning Collective Response Wall

A public, anonymous, single-page reflection activity built for Cloudflare Pages Functions and D1.

## Included

- Pleasantville Schools / Digital Learning Collective branding; Figtree headings with system-font body copy
- Three required sentence starters
- Immediate public response wall
- Cloudflare Pages Function API
- Cloudflare D1 persistence
- Server-side validation, URL blocking, character limits, and honeypot field
- No names, emails, accounts, or form-based identifiers collected

## Deploy

1. Install dependencies:
   `npm install`
2. Sign in to Cloudflare:
   `npx wrangler login`
3. Create the D1 database:
   `npx wrangler d1 create pufsd-dlc-responses`
4. Copy the returned database ID into `wrangler.toml`.
5. Create the database table:
   `npm run db:remote`
6. Create a Cloudflare Pages project connected to this GitHub repository.
7. Use `public` as the build output directory. No build command is required.
8. In the Pages project's Settings > Bindings, add a D1 binding named `DB` and select `pufsd-dlc-responses`.
9. Deploy the Pages project.

## Local development

1. Create the local table: `npm run db:local`
2. Start the local site: `npm run dev`

## Important operational note

The activity intentionally allows anonymous public posting with immediate display. The included controls reduce simple misuse but do not replace moderation. For a broadly distributed public URL, consider enabling Cloudflare Turnstile and adding an administrative removal workflow.

## Universal access password

The site now has a lightweight universal access gate. The password is `DLC`.

- The check runs in Pages middleware before the page, assets, or API are served.
- Successful entry sets a secure, HttpOnly, SameSite=Lax cookie for 12 hours.
- This is a convenience access gate for the DLC activity, not individual-user authentication. Anyone who knows the shared password can enter and submit.
