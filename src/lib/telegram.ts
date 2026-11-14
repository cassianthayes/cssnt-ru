import { messageText, type ShoutboxMessage } from "./shoutbox";

export interface TelegramUpdate {
    callback_query?: {
        id: string;
        from: { id: number };
        data?: string;
        message?: { message_id: number; chat: { id: number } };
    };
}

async function callTelegram<T>(
    env: Env,
    method: string,
    payload: unknown,
): Promise<T> {
    const response = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
        },
    );

    const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        result?: T;
        description?: string;
    } | null;

    if (!response.ok || !data?.ok) {
        throw new Error(
            `Telegram ${method} failed (${response.status}): ${data?.description ?? "unknown error"}`,
        );
    }

    return data.result as T;
}

export type NotificationButton = { text: string; callback_data: string };

/** Sends a pending message to the admin with publish/decline buttons. */
export async function sendNotification(
    env: Env,
    id: number,
    message: ShoutboxMessage,
): Promise<void> {
    await callTelegram(env, "sendMessage", {
        chat_id: env.TELEGRAM_CHAT_ID,
        text: messageText(message, "Pending"),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Publish", callback_data: `a:${id}` },
                    { text: "Decline", callback_data: `d:${id}` },
                ],
            ],
        },
    });
}

/** Rewrites the notification after review and replaces its buttons. */
export async function updateNotification(
    env: Env,
    chatId: number,
    messageId: number,
    text: string,
    keyboard: NotificationButton[][] = [],
): Promise<void> {
    await callTelegram(env, "editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        reply_markup: { inline_keyboard: keyboard },
    });
}

export async function answerCallbackQuery(
    env: Env,
    callbackQueryId: string,
    text: string,
): Promise<void> {
    await callTelegram(env, "answerCallbackQuery", {
        callback_query_id: callbackQueryId,
        text,
    });
}
