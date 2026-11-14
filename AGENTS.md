## Website overview

This is a minimal, dark, single-page personal site at `cssnt.ru`. It displays a compact list of pinned GitHub projects, a block of 88×31 buttons, and a shoutbox. Astro generates the pages as static HTML; a Cloudflare Pages Function serves the shoutbox API, and Cloudflare D1 stores the messages. There is no client-side framework.

## Structure and content

- `src/pages/index.astro` defines the HTML document, metadata, font, the page `<main>` container, and the three page components.
- `src/components/Projects.astro` owns the manually maintained list of pinned repositories for `cassianthayes`. Each entry contains a repository name and description; its link is built from the GitHub username and name. When asked to refresh pins, check the GitHub profile and update this list manually. Do not add API calls or token requirements unless requested.
- `src/components/Buttons.astro` owns the button list. Each entry specifies an image, alt text, and optionally a link. Buttons without a link render as images only. The list is ordered broadly as social links, sites and tools, then statement buttons.
- `src/components/Shoutbox.astro` owns the shoutbox markup, the published message list, and the client script that talks to `/api/messages`. The list is filled at runtime; the Astro page itself stays static.
- `functions/api/` holds the Pages Functions: `messages.ts` (`GET` published messages, `POST` a pending one) and `telegram.ts` (webhook for the Publish/Decline buttons). `functions/_lib/` holds validation, the notification text, and the Telegram API calls.
- `migrations/` and `wrangler.toml` define the D1 database and the Pages project bindings. See `README.md` for the setup steps and the three Telegram secrets.
- `public/buttons/` contains the button images; add new assets there and reference them by `/buttons/...`. Buttons render at 88×31 with pixelated image rendering.
- `src/styles/global.css` imports Tailwind CSS and maps the sans font to Geist. `astro.config.mjs` configures Tailwind's Vite plugin and the Geist font, including Latin and Cyrillic subsets.

## Design and link conventions

- Keep the design minimal: a zinc-black background, white text, muted descriptions, and Tailwind utility classes.
- Projects are compact links in a responsive grid (one column on small screens, two on larger screens), not cards. Do not add a heading, language labels, or extra explanatory text unless requested.
- Keep the buttons in a `<nav>` below the projects, with spacing between them. The shoutbox sits below the buttons, with the published messages on the left and the form on the right, in a two-column grid that stacks on small screens.
- Links open in a new tab using `target="_blank"` and `rel="noopener noreferrer"`. Preserve meaningful image alt text and visible keyboard focus.
- Keep content and rendering in their existing Astro components; avoid unnecessary dependencies or client-side JavaScript beyond the shoutbox script.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. The project uses Bun (`bun.lock`); run `bun install` to install dependencies and `bun run build` to validate a production build. Build output is written to `dist/`.

`astro dev` does not run the Pages Functions, so the shoutbox API is missing there. Use `bun run dev:pages` (builds, then `wrangler pages dev dist`) to exercise the API and the D1 binding, and `bun run db:migrate:local` to apply migrations to the local database. Wrangler's dev server needs Node.js; it does not work when started through Bun's own runtime.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
