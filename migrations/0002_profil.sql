-- Profil özelleştirme ve taktik odası (klasör, not, vitrin).
-- Not: Canlı sitede bu değişiklikler src/lib/regen/sema.server.ts tarafından ilk istekte uygulanır.
ALTER TABLE users ADD COLUMN handle TEXT;
ALTER TABLE users ADD COLUMN favori_takim TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN favori_dizilis TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN favori_oyuncu TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN renk TEXT NOT NULL DEFAULT 'turuncu';
ALTER TABLE users ADD COLUMN forma_no TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN kapak TEXT NOT NULL DEFAULT 'kor';
ALTER TABLE users ADD COLUMN konum TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN instagram TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN x_hesabi TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN youtube TEXT NOT NULL DEFAULT '';
ALTER TABLE boards ADD COLUMN klasor TEXT NOT NULL DEFAULT '';
ALTER TABLE boards ADD COLUMN notlar TEXT NOT NULL DEFAULT '';
ALTER TABLE boards ADD COLUMN sabit INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
CREATE INDEX IF NOT EXISTS idx_boards_klasor ON boards(user_id, klasor);
