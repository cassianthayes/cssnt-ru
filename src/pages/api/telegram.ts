import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { messageText, type ShoutboxMessage } from "../../lib/shoutbox";
import {
    answerCallbackQuery,
    updateNotification,
    type NotificationButton,
    type TelegramUpdate,
} from "../../lib/telegram";

/** Telegram webhook: publishes, declines, or deletes a message when the admin presses a button. */
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

    const action = /^([adx]):(\d+)$/.exec(query.data ?? "");
    if (!action) {
        await ignoreFailure(answerCallbackQuery(env, query.id, "Unknown action."));
        return new Response("ok");
    }

    const id = Number(action[2]);
    const notification = query.message;

    if (action[1] === "x") {
        const message = await deleteApprovedMessage(id);

        await ignoreFailure(
            answerCallbackQuery(env, query.id, message ? "Deleted." : "Already gone."),
        );

        if (message && notification) {
            await ignoreFailure(
                updateNotification(
                    env,
                    notification.chat.id,
                    notification.message_id,
                    messageText(message, "Deleted"),
                ),
            );
        }

        return new Response("ok");
    }

    const status = action[1] === "a" ? "approved" : "declined";
    const reviewed = await setStatus(id, status);

    await ignoreFailure(
        answerCallbackQuery(
            env,
            query.id,
            reviewed ? `${status === "approved" ? "Published" : "Declined"}.` : "Already reviewed.",
        ),
    );

    // An already reviewed message keeps the notification it has.
    if (!reviewed || !notification) {
        return new Response("ok");
    }

    const message = await findMessage(id);
    if (message) {
        await ignoreFailure(
            updateNotification(
                env,
                notification.chat.id,
                notification.message_id,
                messageText(message, status === "approved" ? "Published" : "Declined"),
                status === "approved" ? deleteKeyboard(id) : [],
            ),
        );
    }

    return new Response("ok");
};

function deleteKeyboard(id: number): NotificationButton[][] {
    return [[{ text: "Delete", callback_data: `x:${id}` }]];
}

async function setStatus(
    id: number,
    status: "approved" | "declined",
): Promise<boolean> {
    const result = await env.DB.prepare(
        "UPDATE messages SET status = ?, reviewed_at = ? WHERE id = ? AND status = 'pending'",
    )
        .bind(status, new Date().toISOString(), id)
        .run();

    return result.meta.changes > 0;
}

async function findMessage(id: number): Promise<ShoutboxMessage | null> {
    return env.DB.prepare("SELECT author, body FROM messages WHERE id = ?")
        .bind(id)
        .first<ShoutboxMessage>();
}

/** Only published messages can be deleted, so a stale button cannot remove anything else. */
async function deleteApprovedMessage(id: number): Promise<ShoutboxMessage | null> {
    const message = await env.DB.prepare(
        "SELECT author, body FROM messages WHERE id = ? AND status = 'approved'",
    )
        .bind(id)
        .first<ShoutboxMessage>();

    if (!message) {
        return null;
    }

    await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
    return message;
}

/** Telegram API hiccups must not undo a review that is already stored in D1. */
async function ignoreFailure(work: Promise<unknown>): Promise<void> {
    try {
        await work;
    } catch (error) {
        console.error("Telegram call failed", error);
    }
}
