import type { ShoutboxMessage } from "./shoutbox";
import { sendNotification } from "./telegram";

const RECENT_LIMIT = 100;

export interface PublishedMessage {
    author: string | null;
    body: string;
    createdAt: string | null;
}

interface PublishedRow {
    author: string | null;
    body: string;
    created_at: string | null;
}

/** Approved messages: pinned (a null date) first, then newest first. */
export async function listPublishedMessages(
    db: D1Database,
): Promise<PublishedMessage[]> {
    const { results } = await db
        .prepare(
            `SELECT author, body, created_at
             FROM messages
             WHERE status = 'approved'
             ORDER BY created_at IS NULL DESC, created_at DESC, id DESC
             LIMIT ?`,
        )
        .bind(RECENT_LIMIT)
        .all<PublishedRow>();

    return results.map((row) => ({
        author: row.author,
        body: row.body,
        createdAt: row.created_at,
    }));
}

/**
 * Stores the message as pending and sends it to the admin for review. The notification is
 * the only way to publish a message, so one that could not be delivered is removed again
 * rather than left behind where nobody can approve it.
 */
export async function createPendingMessage(
    env: Env,
    message: ShoutboxMessage,
): Promise<void> {
    const inserted = await env.DB.prepare(
        "INSERT INTO messages (author, body, created_at) VALUES (?, ?, ?)",
    )
        .bind(message.author, message.body, new Date().toISOString())
        .run();

    const id = inserted.meta.last_row_id;

    try {
        await sendNotification(env, id, message);
    } catch (error) {
        await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(id).run();
        throw error;
    }
}
