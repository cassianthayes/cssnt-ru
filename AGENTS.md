## Website overview

This is a minimal, dark, single-page personal site at `cssnt.ru`. It displays a compact list of pinned GitHub projects followed by a footer of 88×31 buttons. Astro generates the site as static HTML; there is no client-side framework or runtime data fetching.

## Structure and content

- `src/pages/index.astro` defines the HTML document, metadata, font, and the two page components.
- `src/components/Projects.astro` owns the manually maintained list of pinned repositories for `cassianthayes`. Each entry contains a repository name and description; its link is built from the GitHub username and name. When asked to refresh pins, check the GitHub profile and update this list manually. Do not add API calls or token requirements unless requested.
- `src/components/Footer.astro` owns the footer button list. Each entry specifies an image, alt text, and optionally a link. Buttons without a link render as images only. The list is ordered broadly as social links, sites and tools, then statement buttons.
- `public/buttons/` contains the button images; add new assets there and reference them by `/buttons/...`. Buttons render at 88×31 with pixelated image rendering.
- `src/styles/global.css` imports Tailwind CSS and maps the sans font to Geist. `astro.config.mjs` configures Tailwind's Vite plugin and the Geist font, including Latin and Cyrillic subsets.

## Design and link conventions

- Keep the design minimal: a zinc-black background, white text, muted descriptions, and Tailwind utility classes.
- Projects are compact links in a responsive grid (one column on small screens, two on larger screens), not cards. Do not add a heading, language labels, or extra explanatory text unless requested.
- Keep the buttons in a semantic footer after the projects, with spacing between them; the footer should flow naturally rather than stick to the viewport bottom.
- Links open in a new tab using `target="_blank"` and `rel="noopener noreferrer"`. Preserve meaningful image alt text and visible keyboard focus.
- Keep content and rendering in their existing Astro components; avoid unnecessary dependencies or client-side JavaScript.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`. The project uses Bun (`bun.lock`); run `bun install` to install dependencies and `bun run build` to validate a production build. Build output is written to `dist/`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
