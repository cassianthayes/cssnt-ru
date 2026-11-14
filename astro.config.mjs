// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // Pages are rendered on demand so the pinned repositories stay current and the
  // shoutbox API can read D1 in the same Worker.
  output: "server",
  adapter: cloudflare({ imageService: "passthrough" }),
  session: false,
  vite: { plugins: [tailwindcss()] },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Geist",
      cssVariable: "--font-geist",
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin", "cyrillic"],
    },
  ],
});
