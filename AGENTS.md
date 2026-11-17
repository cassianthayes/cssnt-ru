## Website overview

This is a minimal, dark, single-page personal site at `cssnt.ru`. It displays the contact lines, a compact list of pinned GitHub projects, a block of 88×31 buttons, and a shoutbox. Astro renders the page on demand through the Cloudflare adapter and runs as a Worker with static assets; Cloudflare D1 stores the shoutbox messages and a Telegram bot approves them. There is no client-side framework.

## Repository rules

- Never modify `README.md`. It stays as the author's one-line description of the site.

## Structure and content

- `src/pages/index.astro` defines the HTML document, metadata, font, the page `<main>` container, and the four page components.
- `src/components/Contacts.astro` is the plain contact block at the top: name, email, and Telegram handle, one line each.
- `src/components/Projects.astro` renders the repositories pinned on the `cassianthayes` GitHub profile. `src/lib/github.ts` reads them from the GitHub GraphQL API at request time, caches the answer for an hour, and returns null when the profile cannot be read so the page can say so.
- `src/components/Buttons.astro` owns the button list. Each entry specifies an image, alt text, and optionally a link. Buttons without a link render as images only. The list is ordered broadly as social links, sites and tools, then statement buttons.
- `src/components/Shoutbox.astro` renders the published messages on the server and holds the form. Without JavaScript the form posts to the `submitMessage` action and the page re-renders with the outcome; the small client script turns that outcome into an alert, sends on Ctrl+Enter, and fades the bottom of the message list while more messages remain below.
- `src/actions/index.ts` defines `submitMessage`, which validates the submitted form with Zod, stores a pending row, and sends the Telegram notification.
- `src/pages/api/telegram.ts` is the webhook behind the Publish/Decline buttons, and behind the Delete button that a published message keeps, which removes the row outright. There is no messages endpoint: the list is part of the page.
- The notification is compact HTML: bold author, the message, then its status (Pending, Published, Declined, Deleted). Submitted text is escaped because Telegram parses the message as HTML.
- `src/lib/` holds the D1 queries (`messages.ts`), the limits and notification text (`shoutbox.ts`), the Telegram API calls (`telegram.ts`), and the pinned repositories (`github.ts`).
- A published message with a null `created_at` counts as pinned: it renders without a date and sorts above the dated messages, which run newest first. The page shows at most 100.
- `migrations/` and `wrangler.jsonc` define the D1 database and the Worker bindings. Astro supplies the Worker entrypoint and the asset binding, so the file only holds the name and bindings.
- `public/buttons/` contains the button images; add new assets there and reference them by `/buttons/...`. Buttons render at 88×31 with pixelated image rendering.
- `src/styles/global.css` imports Tailwind CSS and maps the sans font to Inter. `astro.config.mjs` configures Tailwind's Vite plugin and the Inter font, including Latin and Cyrillic subsets.

## Design and link conventions

- Keep the design minimal: a zinc-black background, white text, muted descriptions, and Tailwind utility classes.
- Projects are compact links in a responsive grid (one column on small screens, two on larger screens), not cards. Do not add extra explanatory text.
- The blocks stack in the order contacts, projects, shoutbox, buttons, spaced evenly by `space-y-10` on `<main>`. Blocks carry no visible heading; each `<section>` keeps an `aria-label` instead. The buttons sit in a centered `<nav>` at the bottom; the shoutbox keeps the published messages on the left and the form on the right, in a two-column grid that stacks on small screens.
- Links open in a new tab using `target="_blank"` and `rel="noopener noreferrer"`. Preserve meaningful image alt text and visible keyboard focus.
- Keep content and rendering in their existing Astro components; avoid unnecessary dependencies or client-side JavaScript beyond the shoutbox script.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. The project uses Bun (`bun.lock`); run `bun install` to install dependencies and `bun run build` to validate a production build. Build output is written to `dist/`.

`astro dev` runs the site in Cloudflare's `workerd` runtime through the adapter, so the routes, the D1 binding, and the pins fetch all work locally. Secrets come from `.dev.vars` (gitignored). Apply migrations to the local database with `bun run db:migrate:local`, and fill it with sample messages for the shoutbox with `bun run db:seed:local` (re-running it does not duplicate rows).

Deployment is automatic: the `cssnt-ru` Worker is connected to the GitHub repository in Cloudflare, so a push to `main` builds and deploys the site. Do not run `bun run deploy` after landing a change on `main`; that command builds and uploads the Worker with `wrangler deploy` and is only for a manual deploy when the automatic build failed or the code is not on `main`. There is no Pages project involved any more.

Secrets are set with `wrangler secret put <NAME>` in production and come from `.dev.vars` locally:

- `GITHUB_TOKEN` - reads the pinned repositories through the GitHub GraphQL API.
- `TELEGRAM_BOT_TOKEN` - bot that sends the approval notifications.
- `TELEGRAM_CHAT_ID` - numeric Telegram user id of the admin; only this id may approve messages.
- `TELEGRAM_WEBHOOK_SECRET` - random string echoed by Telegram in `X-Telegram-Bot-Api-Secret-Token`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
