## Website overview

This is a minimal, dark, single-page personal site at `cssnt.ru`. It displays the contact lines, a box that sends an anonymous message, a compact list of pinned GitHub projects, and a block of 88×31 buttons. Astro renders the page on demand through the Cloudflare adapter and runs as a Worker with static assets; a Telegram bot delivers the anonymous messages. Nothing is stored. There is no client-side framework.

## Repository rules

- Never modify `README.md`. It stays as the author's one-line description of the site.

## Structure and content

- `src/pages/index.astro` defines the HTML document, metadata, the Mastodon `rel="me"` verification link, font, the page `<main>` container, and the four page components.
- `src/components/Contacts.astro` is the plain contact block at the top: name, email, and links to Telegram and Mastodon, one line each.
- `src/components/Message.astro` is a single input and a paper-plane Send button beside it. The form posts to the `sendMessage` action, and the page re-renders with the outcome: a line saying the message was sent, or the validation or delivery error.
- `src/components/Projects.astro` renders the repositories pinned on the `cassianthayes` GitHub profile. `src/lib/github.ts` reads them from the GitHub GraphQL API at request time, caches the answer for an hour, and returns null when the profile cannot be read so the page can say so.
- `src/components/Buttons.astro` owns the button list. Each entry specifies an image, alt text, and optionally a link. Buttons without a link render as images only. Buttons are grouped by purpose: the sites and communities of the people around the site, the software it is built and run with, the generator behind the images, then the image-only statements.
- `src/actions/index.ts` defines `sendMessage`, which validates the text with Zod and sends it to Telegram. Nothing is written to a database.
- The notification is compact HTML: a bold "Anonymous message" label and the message itself. Submitted text is escaped because Telegram parses the message as HTML.
- `src/lib/` holds the message length limit and notification text (`message.ts`), the Telegram API call (`telegram.ts`), and the pinned repositories (`github.ts`).
- `wrangler.jsonc` defines the Worker. Astro supplies the entrypoint and the asset binding, so the file only holds the name and the route; there are no bindings.
- `public/buttons/` contains the button images; add new assets there and reference them by `/buttons/...`. Buttons render at 88×31 with pixelated image rendering.
- `src/styles/global.css` imports Tailwind CSS and maps the sans font to Geist. `astro.config.mjs` configures Tailwind's Vite plugin and the Geist font from Fontsource, including Latin and Cyrillic subsets, and the page preloads it.

## Design and link conventions

- Keep the design minimal: a zinc-black background, white text, muted descriptions, and Tailwind utility classes.
- Projects are compact links in a responsive grid (one column on small screens, two on larger screens), not cards. Do not add extra explanatory text.
- The blocks stack in the order contacts, projects, message box, buttons, spaced evenly by `space-y-10` on `<main>`. Blocks carry no visible heading; each `<section>` keeps an `aria-label` instead. The buttons sit in a centered `<nav>` at the bottom.
- Links open in a new tab using `target="_blank"` and `rel="noopener noreferrer"`. Preserve meaningful image alt text and visible keyboard focus.
- Keep content and rendering in their existing Astro components; avoid unnecessary dependencies or client-side JavaScript. The message box deliberately has no script: a plain form post and the re-rendered page carry the outcome.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. The project uses Bun (`bun.lock`); run `bun install` to install dependencies and `bun run build` to validate a production build. Build output is written to `dist/`.

`astro dev` runs the site in Cloudflare's `workerd` runtime through the adapter, so the routes, the Telegram action, and the pins fetch all work locally. Secrets come from `.dev.vars` (gitignored).

Deployment is automatic: the `cssnt-ru` Worker is connected to the GitHub repository in Cloudflare, so a push to `main` builds and deploys the site. Do not run `bun run deploy` after landing a change on `main`; that command builds and uploads the Worker with `wrangler deploy` and is only for a manual deploy when the automatic build failed or the code is not on `main`. There is no Pages project involved any more.

Secrets are set with `wrangler secret put <NAME>` in production and come from `.dev.vars` locally:

- `GITHUB_TOKEN` - reads the pinned repositories through the GitHub GraphQL API.
- `TELEGRAM_BOT_TOKEN` - bot that delivers the anonymous messages.
- `TELEGRAM_CHAT_ID` - numeric Telegram user id of the admin; the only chat the messages are sent to.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
