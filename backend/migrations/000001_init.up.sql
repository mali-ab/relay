-- database: :memory:
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

CREATE TABLE meetings (
    id BIGSERIAL PRIMARY KEY,

    title TEXT NOT NULL,

    room_name TEXT NOT NULL UNIQUE,

    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    max_participants INT NOT NULL,

    meeting_duration_minutes INT NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    ended_at TIMESTAMPTZ
);

CREATE TABLE meeting_participants (
    meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    PRIMARY KEY (meeting_id, user_id)
);

CREATE TABLE plans (
    id BIGSERIAL PRIMARY KEY,

    code TEXT NOT NULL UNIQUE,

    name TEXT NOT NULL,

    max_participants INT NOT NULL,

    meeting_duration_minutes INT NOT NULL,

    price INT NOT NULL DEFAULT 0
);
INSERT INTO plans (
    code,
    name,
    max_participants,
    meeting_duration_minutes,
    price
)
VALUES
(
    'free',
    'Free',
    5,
    30,
    0
),
(
    'pro',
    'Pro',
    30,
    0,
    10
);

CREATE TABLE subscriptions (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    plan_id BIGINT NOT NULL REFERENCES plans(id),

    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ NOT NULL
);