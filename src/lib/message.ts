export const MESSAGE_MAX_LENGTH = 500;

/** Telegram renders the notification as HTML, so the submitted text has to be escaped. */
export function formatNotification(body: string): string {
    return `<b>Anonymous message</b>\n\n${escapeHtml(body)}`;
}

function escapeHtml(text: string): string {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
