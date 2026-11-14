import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";
import { env } from "cloudflare:workers";
import { createPendingMessage } from "../lib/messages";
import { AUTHOR_MAX_LENGTH, BODY_MAX_LENGTH } from "../lib/shoutbox";

// Empty form inputs arrive as null, so each field is normalised to a trimmed string first.
const author = z.preprocess(
    (value) => `${value ?? ""}`.trim(),
    z.string().max(
        AUTHOR_MAX_LENGTH,
        `Name must be at most ${AUTHOR_MAX_LENGTH} characters.`,
    ),
);
const body = z.preprocess(
    (value) => `${value ?? ""}`.trim(),
    z
        .string()
        .min(1, "Message is required.")
        .max(BODY_MAX_LENGTH, `Message must be at most ${BODY_MAX_LENGTH} characters.`),
);

export const server = {
    submitMessage: defineAction({
        accept: "form",
        input: z.object({ author, body }),
        handler: async ({ author, body }) => {
            try {
                await createPendingMessage(env, { author: author || null, body });
            } catch (error) {
                console.error("Shoutbox submission failed", error);
                throw new ActionError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Could not deliver your message. Try again later.",
                });
            }
        },
    }),
};
