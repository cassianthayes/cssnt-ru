export const AUTHOR_MAX_LENGTH = 40;
export const BODY_MAX_LENGTH = 500;

export interface ShoutboxMessage {
    author: string | null;
    body: string;
}

export type ParsedMessage =
    | { ok: true; value: ShoutboxMessage }
    | { ok: false; error: string };

/** Trims and validates a submission body, rejecting empty and oversized input. */
export function parseMessage(input: unknown): ParsedMessage {
    const source = (input ?? {}) as { author?: unknown; body?: unknown };
    const body = typeof source.body === "string" ? source.body.trim() : "";
    const author = typeof source.author === "string" ? source.author.trim() : "";

    if (!body) {
        return { ok: false, error: "Message is required." };
    }

    if (body.length > BODY_MAX_LENGTH) {
        return {
            ok: false,
            error: `Message must be at most ${BODY_MAX_LENGTH} characters.`,
        };
    }

    if (author.length > AUTHOR_MAX_LENGTH) {
        return {
            ok: false,
            error: `Name must be at most ${AUTHOR_MAX_LENGTH} characters.`,
        };
    }

    return { ok: true, value: { author: author || null, body } };
}

/** Text of the Telegram notification, reused when the notification is updated after review. */
export function messageText(id: number, message: ShoutboxMessage): string {
    return `Shoutbox message #${id}\nFrom: ${message.author ?? "anonymous"}\n\n${message.body}`;
}
