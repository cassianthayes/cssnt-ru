CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TEXT NOT NULL,
    reviewed_at TEXT
);

CREATE INDEX messages_status_created_at ON messages (status, created_at DESC);
