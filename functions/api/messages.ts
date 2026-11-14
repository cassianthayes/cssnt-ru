import { parseMessage } from "../_lib/shoutbox";
import { sendNotification } from "../_lib/telegram";

const RECENT_LIMIT = 100;

interface PublishedRow {
    author: string | null;
    body: string;
    created_at: string | null;
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
        },
    });
}

/** Published messages: pinned (no date) first, then newest first. */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
    const { results } = await env.DB.prepare(
        `SELECT author, body, created_at
         FROM messages
         WHERE status = 'approved'
         ORDER BY created_at IS NULL DESC, created_at DESC, id DESC
         LIMIT ?`,
    )
        .bind(RECENT_LIMIT)
        .all<PublishedRow>();

    return json({
        messages: results.map((row) => ({
            author: row.author,
            body: row.body,
            createdAt: row.created_at,
        })),
    });
};

/** Stores a message as pending and asks the admin to review it through Telegram. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return json({ error: "Invalid request." }, 400);
    }

    const parsed = parseMessage(payload);
    if (!parsed.ok) {
        return json({ error: parsed.error }, 400);
    }

    const inserted = await env.DB.prepare(
        "INSERT INTO messages (author, body, created_at) VALUES (?, ?, ?)",
    )
        .bind(parsed.value.author, parsed.value.body, new Date().toISOString())
        .run();

    const id = inserted.meta.last_row_id;

    try {
        await sendNotification(env, id, parsed.value);
    } catch (error) {
        // The notification is the only way to publish a message, so drop it instead of
        // leaving an orphaned row that nobody can approve.
        console.error("Shoutbox notification failed", error);
        await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
        return json({ error: "Could not deliver your message. Try again later." }, 502);
    }

    return json({ ok: true }, 202);
};
