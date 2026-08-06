-- 建立 LiveFit 所需的資料表。
-- 假資料由 seed_data.js 以參數化查詢寫入，避免把資料重複維護在兩個檔案。

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (role IN ('user','admin'))
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_lower_idx
    ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS galaxies (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    en VARCHAR(150) NOT NULL,
    color CHAR(7) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT galaxies_color_check
        CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE IF NOT EXISTS planets (
    id VARCHAR(50) PRIMARY KEY,
    galaxy_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    name VARCHAR(150) NOT NULL,
    en VARCHAR(150) NOT NULL,
    coord VARCHAR(30) NOT NULL UNIQUE,
    difficulty SMALLINT NOT NULL,
    uses INTEGER NOT NULL DEFAULT 0,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT planets_galaxy_fk
        FOREIGN KEY (galaxy_id)
        REFERENCES galaxies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT planets_type_check CHECK (type IN ('prompt', 'skill')),
    CONSTRAINT planets_difficulty_check CHECK (difficulty BETWEEN 1 AND 5),
    CONSTRAINT planets_uses_check CHECK (uses >= 0)
);

CREATE INDEX IF NOT EXISTS planets_galaxy_id_idx
    ON planets (galaxy_id);


CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    planets_id VARCHAR(50) NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, planets_id)
);

COMMIT;
