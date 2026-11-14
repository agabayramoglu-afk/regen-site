// Veritabanı tablolarını ilk istekte kurar (yalnızca "IF NOT EXISTS" / "OR IGNORE").
// Böylece Cloudflare'de ayrı bir taşıma (migration) adımı gerekmez.
import type { D1Database } from "@cloudflare/workers-types";

const SEMA: string[] = [
  "CREATE TABLE IF NOT EXISTS users ( id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'uye', bio TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE TABLE IF NOT EXISTS sessions ( id TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)",
  "CREATE TABLE IF NOT EXISTS topics ( id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', kind TEXT NOT NULL DEFAULT 'kategori', is_open INTEGER NOT NULL DEFAULT 1, sort INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE TABLE IF NOT EXISTS boards ( id TEXT PRIMARY KEY, user_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, data TEXT NOT NULL, is_public INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE INDEX IF NOT EXISTS idx_boards_user ON boards(user_id)",
  "CREATE TABLE IF NOT EXISTS posts ( id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, user_id TEXT NOT NULL, topic_id TEXT NOT NULL, title TEXT NOT NULL, excerpt TEXT NOT NULL DEFAULT '', body TEXT NOT NULL, board_id TEXT, status TEXT NOT NULL DEFAULT 'beklemede', featured INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')), published_at TEXT )",
  "CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, published_at)",
  "CREATE INDEX IF NOT EXISTS idx_posts_topic ON posts(topic_id)",
  "CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id)",
  "CREATE TABLE IF NOT EXISTS comments ( id TEXT PRIMARY KEY, post_id TEXT NOT NULL, user_id TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')) )",
  "CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id)",
  "CREATE TABLE IF NOT EXISTS likes ( post_id TEXT NOT NULL, user_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (post_id, user_id) )",
  "INSERT OR IGNORE INTO topics (id, slug, title, description, kind, is_open, sort) VALUES ('kat-taktik', 'taktik', 'Taktik', 'Diziliş, pres, geçiş oyunu, duran toplar.', 'kategori', 1, 1), ('kat-psikoloji', 'psikoloji', 'Psikoloji', 'Baskı, özgüven, karar verme, takım içi dinamikler.', 'kategori', 1, 2), ('kat-oyuncu', 'oyuncu-analizi', 'Oyuncu analizi', 'Bir oyuncunun rolü, alışkanlıkları ve gelişimi.', 'kategori', 1, 3), ('kat-mac', 'mac-analizi', 'Maç analizi', 'Tek bir maçın kırılma anları ve planları.', 'kategori', 1, 4)"
];

let hazir: Promise<void> | null = null;

export function semaHazirla(db: D1Database | undefined): Promise<void> {
  if (!db) return Promise.resolve();
  if (!hazir) {
    hazir = db
      .batch(SEMA.map((s) => db.prepare(s)))
      .then(() => undefined)
      .catch((err) => {
        hazir = null;
        throw err;
      });
  }
  return hazir;
}
