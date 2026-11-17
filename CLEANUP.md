# Shoutbox infrastructure cleanup

The site no longer has a shoutbox: an anonymous message is sent straight to
Telegram and nothing is stored or published. The code for it is gone, but the
Cloudflare and Telegram resources it used still exist and need removing by hand.

The guide below is for the deployed site at `cssnt.ru`. Do it in this order — the
deploy has to go out first, so the webhook route that D1 and Telegram point at is
gone before the resources behind it.

## 1. Deploy the new Worker

Push the change to `main`. Cloudflare builds and deploys `cssnt-ru` automatically
from the repository, so nothing else is needed. (`bun run deploy` exists as a
manual fallback, but do not use it when the automatic build is working.)

Once the new version is live, `POST /api/telegram` should return 404 and the site
should show the message box instead of the shoutbox.

## 2. Stop Telegram from calling the deleted webhook

A webhook still configured for a route that no longer exists logs failed
updates on every event. Remove it:

```sh
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook?drop_pending_updates=true"
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

The second call should report `"url": ""`. Run both from a shell where
`TELEGRAM_BOT_TOKEN` is exported; do not paste the token into a file in the repo.

## 3. Delete the D1 database

The `cssnt-ru-shoutbox` database holds the pending, published, and declined
messages, including the pinned one. Export it first if the content is worth
keeping — deleting the database destroys it:

```sh
bunx wrangler d1 export cssnt-ru-shoutbox --remote --output=shoutbox-backup.sql
bunx wrangler d1 delete cssnt-ru-shoutbox --skip-confirmation
bunx wrangler d1 list
```

`d1 list` should no longer show the database. The `DB` binding is already removed
from `wrangler.jsonc`, so the Worker no longer references it either way.

## 4. Delete the unused secret

`TELEGRAM_WEBHOOK_SECRET` only authenticated the webhook. The bot token and chat
id stay, because they send the anonymous messages:

```sh
bunx wrangler secret delete TELEGRAM_WEBHOOK_SECRET
bunx wrangler secret list
```

## 5. Clean up locally

- `.wrangler/` holds the local D1 state; deleting the directory removes the local
  copy of the old messages: `rm -rf .wrangler`.
- Remove the `TELEGRAM_WEBHOOK_SECRET=` line from `.dev.vars` (gitignored; keep
  the bot token and chat id). Nothing reads it any more.
- The migrations and seed files are already deleted from the repository, along
  with the `db:migrate`, `db:migrate:local`, and `db:seed:local` scripts.

## What remains

`src/lib/telegram.ts` sends one plain message to `TELEGRAM_CHAT_ID` with
`TELEGRAM_BOT_TOKEN`; there are no inline buttons, no callback handling, and no
stored rows. Deleting the whole bot would only mean emptying `TELEGRAM_BOT_TOKEN`
and `TELEGRAM_CHAT_ID`, and losing the message form with it.
