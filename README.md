# cssnt.ru

My own website at [cssnt.ru](https://cssnt.ru). Built with Astro and deployed to Cloudflare Pages.

## Shoutbox

Messages live in Cloudflare D1 and only appear after approval in Telegram. The Pages Functions in `functions/` serve it:

- `GET /api/messages` returns approved messages, newest first.
- `POST /api/messages` stores a pending message and notifies the admin through the bot.
- `POST /api/telegram` is the webhook behind the Publish and Decline buttons.

### Setup

1. Create the database and put the printed id into `database_id` in `wrangler.toml`:

    ```sh
    bunx wrangler d1 create cssnt-ru-shoutbox
    bunx wrangler d1 migrations apply cssnt-ru-shoutbox --remote
    ```

2. Add the three secrets (`bunx wrangler pages secret put <NAME>`), or the same names in `.dev.vars` for local runs:

    - `TELEGRAM_BOT_TOKEN` - bot that sends the notifications.
    - `TELEGRAM_CHAT_ID` - your numeric Telegram user id; only this id may approve messages.
    - `TELEGRAM_WEBHOOK_SECRET` - any random string, sent back by Telegram as `X-Telegram-Bot-Api-Secret-Token`.

3. Point the bot at the deployed webhook:

    ```sh
    curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
      -d url=https://cssnt.ru/api/telegram \
      -d secret_token=$TELEGRAM_WEBHOOK_SECRET \
      -d allowed_updates='["callback_query"]'
    ```

### Local development

`bun run dev` serves the pages but not the Functions, so the shoutbox list shows "Could not load messages." Apply the migrations to the local database with `bun run db:migrate:local`, then use `bun run dev:pages` to build and serve the page and its Functions together.
