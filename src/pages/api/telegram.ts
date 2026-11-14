import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { messageText } from "../../lib/shoutbox";
import {
    answerCallbackQuery,
    updateNotification,
    type TelegramUpdate,
} from "../../lib/telegram";

/** Telegram webhook: publishes or declines a message when the admin presses a button. */
export const POST: APIRoute = async ({ request }) => {
    if (
        request.headers.get("x-telegram-bot-api-secret-token") !==
        env.TELEGRAM_WEBHOOK_SECRET
    ) {
        return new Response("Forbidden", { status: 403 });
    }

    let update: TelegramUpdate;
    try {
        update = await request.json();
    } catch {
        return new Response("Invalid update", { status: 400 });
    }

    const query = update.callback_query;
    if (!query) {
        return new Response(null, { status: 204 });
    }

    if (String(query.from.id) !== env.TELEGRAM_CHAT_ID) {
        await ignoreFailure(answerCallbackQuery(env, query.id, "Not allowed."));
        // Acknowledge the update so Telegram does not keep retrying it.
        return new Response("ok");
    }

    const action = /^([ad]):(\d+)$/.exec(query.data ?? "");
    if (!action) {
        await ignoreFailure(answerCallbackQuery(env, query.id, "Unknown action."));
        return new Response("ok");
    }

    const status = action[1] === "a" ? "approved" : "declined";
    const id = Number(action[2]);

    const reviewed = await env.DB.prepare(
        "UPDATE messages SET status = ?, reviewed_at = ? WHERE id = ? AND status = 'pending'",
    )
        .bind(status, new Date().toISOString(), id)
        .run();

    const message = await env.DB.prepare(
        "SELECT author, body FROM messages WHERE id = ?",
    )
        .bind(id)
        .first<{ author: string | null; body: string }>();

    const changed = reviewed.meta.changes > 0;
    const verdict = changed
        ? status === "approved"
            ? "Published."
            : "Declined."
        : "Already reviewed.";

    await ignoreFailure(answerCallbackQuery(env, query.id, verdict));

    if (query.message) {
        await ignoreFailure(
            updateNotification(
                env,
                query.message.chat.id,
                query.message.message_id,
                message
                    ? `${messageText(id, message)}\n\n${verdict}`
                    : `Shoutbox message #${id}\n\n${verdict}`,
            ),
        );
    }

    return new Response("ok");
};

/** Telegram API hiccups must not undo a review that is already stored in D1. */
async function ignoreFailure(work: Promise<unknown>): Promise<void> {
    try {
        await work;
    } catch (error) {
        console.error("Telegram call failed", error);
    }
}
