Minimal, dark, single-page site at `cssnt.ru`: contact lines, pinned GitHub projects, and 88×31 buttons. Astro renders it on demand through the Cloudflare adapter as a Worker with static assets. Nothing is stored; there is no client-side JavaScript and no framework.

## Rules

- Never modify `README.md`; it stays the author's one-line description of the site.
- Never ask for the local GitHub token: pull it from `gh` into `.dev.vars` (gitignored) before starting dev — `printf 'GITHUB_TOKEN=%s\n' "$(gh auth token)" > .dev.vars`. Always do this for local runs; the file holds a secret and must stay out of git.

## Structure

- `src/pages/index.astro` — document, metadata, Mastodon `rel="me"` link, font preload, `<main>`; renders the three components.
- `src/components/` — `Contacts` (name, email, Telegram, Mastodon, one line each), `Projects` (pins), `Buttons` (image, alt, optional link; no link renders the image alone; grouped by purpose).
- `src/lib/github.ts` — pins read from GitHub GraphQL at request time, cached an hour, null when unreadable.
- `wrangler.jsonc` — name and route only; Astro supplies the entrypoint and the asset binding, so there are no bindings.
- `public/buttons/` — images referenced as `/buttons/...`, rendered 88×31 pixelated. `global.css` and `astro.config.mjs` — Tailwind, a root font size that scales the rem-based layout, and Geist from Fontsource (Latin, Cyrillic) preloaded by the page.

## Design

- Minimal: zinc-black, white text, muted descriptions, Tailwind utilities.
- Projects: compact links in a responsive grid (one column small, two larger), never cards, no explanatory text.
- Blocks stack contacts, projects, buttons, `space-y-10` on `<main>`; no visible headings, each `<section>` keeps an `aria-label`; buttons in a centered `<nav>`.
- Links open in a new tab (`target="_blank"`, `rel="noopener noreferrer"`); keep meaningful alt text and visible focus. Render in the existing components, with no dependencies and no client-side script.

## Development

- Bun (`bun.lock`): `bun install`, and `bun run build` to validate; output in `dist/`.
- Dev in background: `bun run dev --background`, then `bunx astro dev stop|status|logs`. It runs in workerd through the adapter, so routes and the pins fetch work locally; `.dev.vars` supplies `GITHUB_TOKEN`, written from `gh auth token` (see Rules).
- Deploy is automatic: the `cssnt-ru` Worker is connected to the GitHub repository, so a push to `main` builds and deploys. `bun run deploy` (`wrangler deploy`) is only for a manual deploy when that failed or the code is not on `main`; no Pages project. Secret: `wrangler secret put GITHUB_TOKEN` in production (pins).

Astro docs: https://docs.astro.build (routing, components, styling, i18n).
