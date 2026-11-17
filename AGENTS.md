## Overview

Minimal, dark, single-page site at `cssnt.ru`: contact lines, an anonymous message box, pinned GitHub projects, and 88×31 buttons. Astro renders it on demand through the Cloudflare adapter as a Worker with static assets; a Telegram bot delivers the messages. Nothing is stored and there is no client-side framework.

## Rules

- Never modify `README.md`; it stays the author's one-line description of the site.

## Structure

- `src/pages/index.astro` — document, metadata, Mastodon `rel="me"` link, font preload, `<main>`; renders the four components.
- `src/components/` — `Contacts` (name, email, Telegram, Mastodon, one line each), `Message` (one input and a paper-plane button posting to `sendMessage`; the re-rendered page shows success or the validation or delivery error), `Projects` (the pinned repositories), `Buttons` (image, alt text, optional link; no link renders the image alone; grouped by purpose, peers' sites first, image-only statements last).
- `src/actions/index.ts` — `sendMessage` validates the text with Zod and sends it to Telegram; nothing is stored.
- `src/lib/` — `message.ts` (length limit, and the HTML notification, escaped because Telegram parses it), `telegram.ts` (the API call), `github.ts` (pins: GitHub GraphQL at request time, cached an hour, null when the profile cannot be read).
- `wrangler.jsonc` — Worker name and route only; Astro supplies the entrypoint and the asset binding, so there are no bindings.
- `public/buttons/` — button images, referenced as `/buttons/...` and rendered 88×31 with pixelated rendering.
- `src/styles/global.css` and `astro.config.mjs` — Tailwind, and Geist from Fontsource (Latin, Cyrillic) preloaded by the page.

## Design

- Minimal: zinc-black background, white text, muted descriptions, Tailwind utilities.
- Projects are compact links in a responsive grid (one column on small screens, two on larger ones), never cards, with no extra explanatory text.
- Blocks stack contacts, projects, message box, buttons, spaced by `space-y-10` on `<main>`. No visible headings: each `<section>` keeps an `aria-label`. The buttons sit in a centered `<nav>`.
- Links open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`; keep meaningful alt text and visible keyboard focus.
- Keep content and rendering in the existing components; avoid dependencies and client-side JavaScript. The message box deliberately has no script: a plain form post and the re-rendered page carry the outcome.

## Development

- Bun (`bun.lock`): `bun install`, and `bun run build` to validate; output goes to `dist/`.
- Dev server in background mode: `bun run dev --background`, managed with `bunx astro dev stop`, `status`, and `logs`. It runs in Cloudflare's `workerd` runtime through the adapter, so the routes, the Telegram action, and the pins fetch all work locally. Secrets come from `.dev.vars` (gitignored).
- Deployment is automatic: the `cssnt-ru` Worker is connected to the GitHub repository in Cloudflare, so a push to `main` builds and deploys. `bun run deploy` (`wrangler deploy`) is only for a manual deploy when that failed or the code is not on `main`. There is no Pages project.
- Secrets are set with `wrangler secret put <NAME>` in production and come from `.dev.vars` locally: `GITHUB_TOKEN` (pinned repositories), `TELEGRAM_BOT_TOKEN` (delivers the messages), `TELEGRAM_CHAT_ID` (admin id; the only chat messages go to).

## Documentation

Astro docs: https://docs.astro.build — chiefly routing, components, framework components, content collections, styling, and i18n.
