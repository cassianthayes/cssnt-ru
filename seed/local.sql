-- Sample messages for the local D1 database, so the shoutbox list has enough
-- content to scroll while developing. Applied by `bun run db:seed:local`.
-- A row is only inserted when no message with the same body exists, so running
-- the seed again does not duplicate anything or touch messages added by hand.

WITH seed (author, body, created_at) AS (
    VALUES
        ('cassian', 'Welcome to the shoutbox. Messages appear here once approved.', NULL),
        ('anon', 'The 88x31 buttons are a nice touch.', '2026-01-02T09:14:00Z'),
        ('cassian', 'Testing how the list scrolls once there are enough messages to fill it.', '2026-01-03T18:42:00Z'),
        ('maria', 'hello from the other side of the internet', '2026-01-04T11:05:00Z'),
        ('anon', 'Dark theme looks good, and Inter renders well.', '2026-01-05T20:31:00Z'),
        ('tomas', 'What stack is this running on?', '2026-01-06T08:12:00Z'),
        ('cassian', 'Astro on Cloudflare Workers, with D1 for the messages.', '2026-01-06T08:26:00Z'),
        ('anon', 'neat, bookmarking this', '2026-01-07T13:47:00Z'),
        ('yuki', 'the pinned message at the top is a good idea', '2026-01-08T19:03:00Z'),
        ('anon', 'please keep the site minimal, it is refreshing', '2026-01-09T07:59:00Z'),
        ('cassian', 'Thanks, that is the plan.', '2026-01-09T08:04:00Z'),
        ('anon', 'scroll test line, should sit at the bottom', '2026-01-10T16:22:00Z')
)
INSERT INTO messages (author, body, status, created_at, reviewed_at)
SELECT
    seed.author,
    seed.body,
    'approved',
    seed.created_at,
    coalesce(seed.created_at, '2026-01-01T00:00:00Z')
FROM seed
WHERE NOT EXISTS (SELECT 1 FROM messages WHERE messages.body = seed.body);
