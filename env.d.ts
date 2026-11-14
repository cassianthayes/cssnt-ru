/// <reference types="@cloudflare/workers-types" />

// Bindings available to the site. Secrets are set with `wrangler secret put`, or
// in `.dev.vars` locally; plain values live in `wrangler.jsonc`.
declare namespace Cloudflare {
    interface Env {
        DB: D1Database;
        GITHUB_TOKEN?: string;
        TELEGRAM_BOT_TOKEN: string;
        TELEGRAM_CHAT_ID: string;
        TELEGRAM_WEBHOOK_SECRET: string;
    }
}

// `env` is imported from `cloudflare:workers`, which types it as Cloudflare.Env.
type Env = Cloudflare.Env;
