export const AUTHOR_MAX_LENGTH = 40;
export const BODY_MAX_LENGTH = 500;

export interface ShoutboxMessage {
    author: string | null;
    body: string;
}

/** Telegram notification text: bold author, the message itself, then its status. */
export function messageText(message: ShoutboxMessage, status: string): string {
    return `<b>${escapeHtml(message.author ?? "anonymous")}</b>\n${escapeHtml(message.body)}\n\n${status}`;
}

/** The notification is sent with parse_mode HTML, so submitted text has to be escaped. */
function escapeHtml(text: string): string {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
