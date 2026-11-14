-- A null created_at marks a pinned message, which is shown above the dated ones.
-- SQLite cannot drop a NOT NULL constraint in place, so the table is rebuilt.

CREATE TABLE messages_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TEXT,
    reviewed_at TEXT
);

INSERT INTO messages_new (id, author, body, status, created_at, reviewed_at)
SELECT id, author, body, status, created_at, reviewed_at FROM messages;

DROP TABLE messages;

ALTER TABLE messages_new RENAME TO messages;

CREATE INDEX messages_status_created_at ON messages (status, created_at DESC);
