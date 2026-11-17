Minimal, dark, single-page site at `cssnt.ru`: contact lines, an anonymous message box, pinned GitHub projects, and 88×31 buttons. Astro renders it on demand through the Cloudflare adapter as a Worker with static assets; a Telegram bot delivers the messages. Nothing is stored; there is no client-side framework.

## Rules

- Never modify `README.md`; it stays the author's one-line description of the site.

## Structure

- `src/pages/index.astro` — document, metadata, Mastodon `rel="me"` link, font preload, `<main>`; renders the four components.
- `src/components/` — `Contacts` (name, email, Telegram, Mastodon, one line each), `Message` (input and paper-plane button posting to `sendMessage`; the re-rendered page shows success or the error), `Projects` (pins), `Buttons` (image, alt, optional link; no link renders the image alone; grouped by purpose).
- `src/actions/index.ts` — `sendMessage`: Zod validation, then Telegram; nothing is stored. `src/lib/`: `message.ts` (limit, and the HTML notification, escaped because Telegram parses it), `telegram.ts` (the API call), `github.ts` (pins read from GitHub GraphQL at request time, cached an hour, null when unreadable).
- `wrangler.jsonc` — name and route only; Astro supplies the entrypoint and the asset binding, so there are no bindings.
- `public/buttons/` — images referenced as `/buttons/...`, rendered 88×31 pixelated. `global.css` and `astro.config.mjs` — Tailwind, and Geist from Fontsource (Latin, Cyrillic) preloaded by the page.

## Design

- Minimal: zinc-black, white text, muted descriptions, Tailwind utilities.
- Projects: compact links in a responsive grid (one column small, two larger), never cards, no explanatory text.
- Blocks stack contacts, projects, message box, buttons, `space-y-10` on `<main>`; no visible headings, each `<section>` keeps an `aria-label`; buttons in a centered `<nav>`.
- Links open in a new tab (`target="_blank"`, `rel="noopener noreferrer"`); keep meaningful alt text and visible focus. Render in the existing components, with no dependencies and no client-side JavaScript: the message box deliberately has no script, so the plain form post and the re-rendered page carry the outcome.

## Development

- Bun (`bun.lock`): `bun install`, and `bun run build` to validate; output in `dist/`.
- Dev in background: `bun run dev --background`, then `bunx astro dev stop|status|logs`. It runs in workerd through the adapter, so routes, the Telegram action, and the pins fetch work locally; secrets come from `.dev.vars` (gitignored).
- Deploy is automatic: the `cssnt-ru` Worker is connected to the GitHub repository, so a push to `main` builds and deploys. `bun run deploy` (`wrangler deploy`) is only for a manual deploy when that failed or the code is not on `main`; no Pages project. Secrets: `wrangler secret put` in production — `GITHUB_TOKEN` (pins), `TELEGRAM_BOT_TOKEN` (delivers messages), `TELEGRAM_CHAT_ID` (admin id; the only chat messages go to).

Astro docs: https://docs.astro.build (routing, components, styling, i18n).
