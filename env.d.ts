/// <reference types="@cloudflare/workers-types" />

// Bindings available to the Pages Functions in `functions/`.
interface Env {
    DB: D1Database;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;
    TELEGRAM_WEBHOOK_SECRET: string;
}
