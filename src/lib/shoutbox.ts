export const AUTHOR_MAX_LENGTH = 40;
export const BODY_MAX_LENGTH = 500;

export interface ShoutboxMessage {
    author: string | null;
    body: string;
}

/** Text of the Telegram notification, reused when the notification is updated after review. */
export function messageText(id: number, message: ShoutboxMessage): string {
    return `Shoutbox message #${id}\nFrom: ${message.author ?? "anonymous"}\n\n${message.body}`;
}
