async function callTelegram(
    env: Env,
    method: string,
    payload: unknown,
): Promise<void> {
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
        description?: string;
    } | null;

    if (!response.ok || !data?.ok) {
        throw new Error(
            `Telegram ${method} failed (${response.status}): ${data?.description ?? "unknown error"}`,
        );
    }
}

/** Sends the message to the admin, whose chat is the only place it is kept. */
export async function sendNotification(env: Env, text: string): Promise<void> {
    await callTelegram(env, "sendMessage", {
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
    });
}
