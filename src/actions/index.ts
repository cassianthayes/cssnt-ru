import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { env } from "cloudflare:workers";
import { formatNotification, MESSAGE_MAX_LENGTH } from "../lib/message";
import { sendNotification } from "../lib/telegram";

// An empty form input arrives as null, so it is normalised to a trimmed string first.
const body = z.preprocess(
    (value) => `${value ?? ""}`.trim(),
    z
        .string()
        .min(1, "Message is required.")
        .max(
            MESSAGE_MAX_LENGTH,
            `Message must be at most ${MESSAGE_MAX_LENGTH} characters.`,
        ),
);

export const server = {
    sendMessage: defineAction({
        accept: "form",
        input: z.object({ body }),
        handler: async ({ body }) => {
            try {
                await sendNotification(env, formatNotification(body));
            } catch (error) {
                console.error("Anonymous message failed", error);
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not deliver your message. Try again later.",
                });
            }
        },
    }),
};
