// Sunucuya özel: şifre özeti, oturum çerezleri ve veritabanı erişimi.
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import type { D1Database } from "@cloudflare/workers-types";

import { bindings } from "../bindings.server";
import { handleOner } from "./profil";

export type Uye = { id: string; name: string; email: string; role: "uye" | "admin"; handle: string; renk: string; forma_no: string };

const CEREZ = "regen_oturum";
const GUN = 24 * 60 * 60;
const enc = new TextEncoder();

export function db(): D1Database {
  const { DB } = bindings();
  if (!DB) throw new Error("Veritabanı hazır değil.");
  return DB;
}

const hex = (buf: ArrayBuffer | Uint8Array) =>
  Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

const hexToBytes = (h: string) => new Uint8Array((h.match(/.{2}/g) ?? []).map((x) => parseInt(x, 16)));

export function rastgeleHex(n: number): string {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return hex(a);
}

export async function sifreOzetle(sifre: string, tuzHex?: string) {
  const tuz = tuzHex ? hexToBytes(tuzHex) : (() => {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return a;
  })();
  const anahtar = await crypto.subtle.importKey("raw", enc.encode(sifre), "PBKDF2", false, ["deriveBits"]);
  const bitler = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: tuz, iterations: 100000 },
    anahtar,
    256,
  );
  return { ozet: hex(bitler), tuz: hex(tuz) };
}

export async function sifreDogrula(sifre: string, ozet: string, tuz: string) {
  const { ozet: yeni } = await sifreOzetle(sifre, tuz);
  if (yeni.length !== ozet.length) return false;
  let fark = 0;
  for (let i = 0; i < yeni.length; i++) fark |= yeni.charCodeAt(i) ^ ozet.charCodeAt(i);
  return fark === 0;
}

async function sha256(s: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

export async function oturumAc(userId: string) {
  const token = rastgeleHex(32);
  const bitis = new Date(Date.now() + 30 * GUN * 1000).toISOString().replace("T", " ").slice(0, 19);
  await db()
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(await sha256(token), userId, bitis)
    .run();
  setCookie(CEREZ, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 30 * GUN });
}

export async function oturumKapat() {
  const token = getCookie(CEREZ);
  if (token) {
    await db().prepare("DELETE FROM sessions WHERE id = ?").bind(await sha256(token)).run();
  }
  deleteCookie(CEREZ, { path: "/" });
}

export async function aktifUye(): Promise<Uye | null> {
  const token = getCookie(CEREZ);
  if (!token || token.length !== 64) return null;
  const { DB } = bindings();
  if (!DB) return null;
  const row = await DB.prepare(
    `SELECT u.id, u.name, u.email, u.role, u.handle, u.renk, u.forma_no FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > datetime('now')`,
  )
    .bind(await sha256(token))
    .first<Omit<Uye, "handle"> & { handle: string | null }>();
  if (!row) return null;
  const handle = row.handle ?? (await handleAta(row.id, row.name));
  return { ...row, handle };
}

// Kullanıcıya benzersiz bir kullanıcı adı verir (eski hesaplar ve yeni kayıtlar için).
export async function handleAta(userId: string, isim: string): Promise<string> {
  const d = db();
  const taban = handleOner(isim);
  for (let i = 0; i < 6; i++) {
    const aday = i === 0 ? taban : `${taban.slice(0, 18)}_${rastgeleHex(2)}`;
    const var_ = await d.prepare("SELECT id FROM users WHERE handle = ?").bind(aday).first<{ id: string }>();
    if (var_ && var_.id !== userId) continue;
    await d.prepare("UPDATE users SET handle = ? WHERE id = ?").bind(aday, userId).run();
    return aday;
  }
  const son = `uye_${rastgeleHex(5)}`;
  await d.prepare("UPDATE users SET handle = ? WHERE id = ?").bind(son, userId).run();
  return son;
}

export async function uyeGerekli(): Promise<Uye> {
  const u = await aktifUye();
  if (!u) throw new Error("Bu işlem için giriş yapmalısın.");
  return u;
}

export async function yoneticiGerekli(): Promise<Uye> {
  const u = await uyeGerekli();
  if (u.role !== "admin") throw new Error("Bu sayfa yalnızca yönetici içindir.");
  return u;
}
