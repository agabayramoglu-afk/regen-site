import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  aktifUye,
  handleAta,
  db,
  oturumAc,
  oturumKapat,
  rastgeleHex,
  sifreDogrula,
  sifreOzetle,
  uyeGerekli,
  yoneticiGerekli,
  type Uye,
} from "./auth.server";
import { tahtaTemizle, type Tahta } from "./board";
import { ozetCikar, slugYap } from "./metin";
import { FORMA_RENKLERI, HANDLE_KURALI, KAPAKLAR, SOSYAL_KURALI } from "./profil";

export type Konu = {
  id: string;
  slug: string;
  title: string;
  description: string;
  kind: "kategori" | "konu";
  is_open: number;
  yazi_sayisi: number;
};

export type YaziKart = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: string;
  featured: number;
  published_at: string | null;
  created_at: string;
  topic_title: string;
  topic_slug: string;
  topic_kind: string;
  author: string;
  author_handle: string | null;
  begeni: number;
  yorum: number;
  board_data: string | null;
};

export type Yorum = { id: string; body: string; created_at: string; author: string; author_handle: string | null; user_id: string };

const KART_SQL = `
  SELECT p.id, p.slug, p.title, p.excerpt, p.status, p.featured, p.published_at, p.created_at,
         t.title AS topic_title, t.slug AS topic_slug, t.kind AS topic_kind, u.name AS author, u.handle AS author_handle,
         (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS begeni,
         (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS yorum,
         b.data AS board_data
  FROM posts p
  JOIN topics t ON t.id = p.topic_id
  JOIN users u ON u.id = p.user_id
  LEFT JOIN boards b ON b.id = p.board_id`;

const KONU_SQL = `
  SELECT t.id, t.slug, t.title, t.description, t.kind, t.is_open,
         (SELECT COUNT(*) FROM posts p WHERE p.topic_id = t.id AND p.status = 'yayinda') AS yazi_sayisi
  FROM topics t`;

async function konular(sadeceAcik: boolean): Promise<Konu[]> {
  const r = await db()
    .prepare(`${KONU_SQL} ${sadeceAcik ? "WHERE t.is_open = 1" : ""} ORDER BY t.kind DESC, t.sort, t.created_at DESC`)
    .all<Konu>();
  return r.results;
}

/* ---------- Üyelik ---------- */

export const getMe = createServerFn({ method: "GET" }).handler(async (): Promise<Uye | null> => {
  try {
    return await aktifUye();
  } catch {
    return null;
  }
});

export const kayitOl = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().trim().min(2, "İsim en az 2 harf olmalı.").max(40),
      email: z.string().trim().toLowerCase().email("Geçerli bir e-posta yaz."),
      password: z.string().min(8, "Şifre en az 8 karakter olmalı.").max(200),
    }),
  )
  .handler(async ({ data }) => {
    const d = db();
    const var_ = await d.prepare("SELECT id FROM users WHERE email = ?").bind(data.email).first();
    if (var_) throw new Error("Bu e-posta ile zaten bir hesap var.");
    const sayi = await d.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
    const role = (sayi?.n ?? 0) === 0 ? "admin" : "uye";
    const { ozet, tuz } = await sifreOzetle(data.password);
    const id = rastgeleHex(12);
    await d
      .prepare("INSERT INTO users (id, email, name, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, data.email, data.name, ozet, tuz, role)
      .run();
    await handleAta(id, data.name);
    await oturumAc(id);
    return { ok: true, role };
  });

export const girisYap = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().toLowerCase(), password: z.string().max(200) }))
  .handler(async ({ data }) => {
    const u = await db()
      .prepare("SELECT id, password_hash, salt FROM users WHERE email = ?")
      .bind(data.email)
      .first<{ id: string; password_hash: string; salt: string }>();
    if (!u || !(await sifreDogrula(data.password, u.password_hash, u.salt))) {
      throw new Error("E-posta ya da şifre hatalı.");
    }
    await oturumAc(u.id);
    return { ok: true };
  });

export const cikisYap = createServerFn({ method: "POST" }).handler(async () => {
  await oturumKapat();
  return { ok: true };
});

/* ---------- Yazılar ---------- */

export const anaSayfaVerisi = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const yazilar = await db()
      .prepare(`${KART_SQL} WHERE p.status = 'yayinda' ORDER BY p.featured DESC, p.published_at DESC LIMIT 6`)
      .all<YaziKart>();
    return { yazilar: yazilar.results, konular: await konular(true) };
  } catch {
    return { yazilar: [] as YaziKart[], konular: [] as Konu[] };
  }
});

export const yazilariListele = createServerFn({ method: "GET" })
  .validator(z.object({ konu: z.string().max(80).optional() }))
  .handler(async ({ data }) => {
    const tumKonular = await konular(false);
    const secili = data.konu ? tumKonular.find((k) => k.slug === data.konu) ?? null : null;
    const sorgu = secili
      ? db().prepare(`${KART_SQL} WHERE p.status = 'yayinda' AND p.topic_id = ? ORDER BY p.published_at DESC LIMIT 60`).bind(secili.id)
      : db().prepare(`${KART_SQL} WHERE p.status = 'yayinda' ORDER BY p.published_at DESC LIMIT 60`);
    const r = await sorgu.all<YaziKart>();
    return { yazilar: r.results, konular: tumKonular, secili };
  });

export const yaziGetir = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().max(120) }))
  .handler(async ({ data }) => {
    const uye = await aktifUye();
    const yazi = await db()
      .prepare(`${KART_SQL.replace("p.excerpt,", "p.excerpt, p.body, p.user_id, p.board_id,")} WHERE p.slug = ?`)
      .bind(data.slug)
      .first<YaziKart & { body: string; user_id: string; board_id: string | null }>();
    if (!yazi) return null;
    const benim = uye?.id === yazi.user_id;
    const yonetici = uye?.role === "admin";
    if (yazi.status !== "yayinda" && !benim && !yonetici) return null;
    const yorumlar = await db()
      .prepare(
        `SELECT c.id, c.body, c.created_at, c.user_id, u.name AS author, u.handle AS author_handle FROM comments c
         JOIN users u ON u.id = c.user_id WHERE c.post_id = ? ORDER BY c.created_at ASC LIMIT 200`,
      )
      .bind(yazi.id)
      .all<Yorum>();
    const begendim = uye
      ? !!(await db().prepare("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?").bind(yazi.id, uye.id).first())
      : false;
    return { yazi, yorumlar: yorumlar.results, begendim, benim, yonetici, girisli: !!uye, uyeId: uye?.id ?? null };
  });

export const yaziGonder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().trim().min(6, "Başlık en az 6 karakter olmalı.").max(110),
      topicId: z.string().max(40),
      body: z.string().trim().min(200, "Yazı en az 200 karakter olmalı.").max(30000),
      boardId: z.string().max(40).nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    const d = db();
    const konu = await d.prepare("SELECT id, is_open FROM topics WHERE id = ?").bind(data.topicId).first<{ id: string; is_open: number }>();
    if (!konu || konu.is_open !== 1) throw new Error("Bu konu şu an yazıya kapalı.");
    if (data.boardId) {
      const b = await d.prepare("SELECT user_id FROM boards WHERE id = ?").bind(data.boardId).first<{ user_id: string }>();
      if (!b || b.user_id !== uye.id) throw new Error("Eklemek istediğin çizim bulunamadı.");
    }
    const yonetici = uye.role === "admin";
    const slug = `${slugYap(data.title) || "yazi"}-${rastgeleHex(3)}`;
    const status = yonetici ? "yayinda" : "beklemede";
    await d
      .prepare(
        `INSERT INTO posts (id, slug, user_id, topic_id, title, excerpt, body, board_id, status, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${yonetici ? "datetime('now')" : "NULL"})`,
      )
      .bind(rastgeleHex(12), slug, uye.id, konu.id, data.title, ozetCikar(data.body), data.body, data.boardId, status)
      .run();
    return { slug, status };
  });

export const begen = createServerFn({ method: "POST" })
  .validator(z.object({ postId: z.string().max(40) }))
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    const d = db();
    const var_ = await d.prepare("SELECT 1 FROM likes WHERE post_id = ? AND user_id = ?").bind(data.postId, uye.id).first();
    if (var_) await d.prepare("DELETE FROM likes WHERE post_id = ? AND user_id = ?").bind(data.postId, uye.id).run();
    else await d.prepare("INSERT INTO likes (post_id, user_id) VALUES (?, ?)").bind(data.postId, uye.id).run();
    const n = await d.prepare("SELECT COUNT(*) AS n FROM likes WHERE post_id = ?").bind(data.postId).first<{ n: number }>();
    return { begendim: !var_, sayi: n?.n ?? 0 };
  });

export const yorumYap = createServerFn({ method: "POST" })
  .validator(z.object({ postId: z.string().max(40), body: z.string().trim().min(2, "Yorum çok kısa.").max(2000) }))
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    const yazi = await db().prepare("SELECT status FROM posts WHERE id = ?").bind(data.postId).first<{ status: string }>();
    if (!yazi || yazi.status !== "yayinda") throw new Error("Bu yazıya yorum yapılamıyor.");
    await db()
      .prepare("INSERT INTO comments (id, post_id, user_id, body) VALUES (?, ?, ?, ?)")
      .bind(rastgeleHex(12), data.postId, uye.id, data.body)
      .run();
    return { ok: true };
  });

export const yorumSil = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().max(40) }))
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    const y = await db().prepare("SELECT user_id FROM comments WHERE id = ?").bind(data.id).first<{ user_id: string }>();
    if (!y) return { ok: true };
    if (y.user_id !== uye.id && uye.role !== "admin") throw new Error("Bu yorumu silemezsin.");
    await db().prepare("DELETE FROM comments WHERE id = ?").bind(data.id).run();
    return { ok: true };
  });

export const konulariGetir = createServerFn({ method: "GET" }).handler(async () => {
  return { konular: await konular(true) };
});

export const yazmaVerisi = createServerFn({ method: "GET" }).handler(async () => {
  const uye = await aktifUye();
  const acik = await konular(true);
  if (!uye) return { girisli: false, konular: acik, tahtalar: [] as { id: string; title: string; kind: string }[] };
  const t = await db()
    .prepare("SELECT id, title, kind FROM boards WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50")
    .bind(uye.id)
    .all<{ id: string; title: string; kind: string }>();
  return { girisli: true, konular: acik, tahtalar: t.results };
});

/* ---------- Tahtalar ---------- */

export const tahtaKaydet = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().max(40).nullable(),
      title: z.string().trim().min(2, "Çizime kısa bir isim ver.").max(80),
      data: z.unknown(),
      isPublic: z.boolean(),
      klasor: z.string().trim().max(40).optional(),
      notlar: z.string().trim().max(2000).optional(),
      sabit: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    const klasor = data.klasor ?? "";
    const notlar = data.notlar ?? "";
    const sabit = data.sabit ? 1 : 0;
    const tahta = tahtaTemizle(data.data);
    if (!tahta) throw new Error("Çizim okunamadı.");
    const json = JSON.stringify(tahta);
    if (json.length > 60000) throw new Error("Çizim çok büyük.");
    const d = db();
    if (data.id) {
      const var_ = await d.prepare("SELECT user_id FROM boards WHERE id = ?").bind(data.id).first<{ user_id: string }>();
      if (var_ && var_.user_id === uye.id) {
        await d
          .prepare(
            "UPDATE boards SET title = ?, data = ?, kind = ?, is_public = ?, klasor = ?, notlar = ?, sabit = ?, updated_at = datetime('now') WHERE id = ?",
          )
          .bind(data.title, json, tahta.tur, data.isPublic ? 1 : 0, klasor, notlar, sabit, data.id)
          .run();
        return { id: data.id };
      }
    }
    const id = rastgeleHex(10);
    await d
      .prepare("INSERT INTO boards (id, user_id, kind, title, data, is_public, klasor, notlar, sabit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(id, uye.id, tahta.tur, data.title, json, data.isPublic ? 1 : 0, klasor, notlar, sabit)
      .run();
    return { id };
  });

export const tahtaGetir = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().max(40) }))
  .handler(async ({ data }) => {
    const uye = await aktifUye();
    const r = await db()
      .prepare(
        `SELECT b.id, b.title, b.kind, b.data, b.is_public, b.user_id, b.updated_at, b.klasor, b.notlar, b.sabit,
                u.name AS author, u.handle AS author_handle
         FROM boards b JOIN users u ON u.id = b.user_id WHERE b.id = ?`,
      )
      .bind(data.id)
      .first<{
        id: string; title: string; kind: string; data: string; is_public: number; user_id: string; updated_at: string;
        klasor: string; notlar: string; sabit: number; author: string; author_handle: string | null;
      }>();
    if (!r) return null;
    const benim = uye?.id === r.user_id;
    if (r.is_public !== 1 && !benim) return null;
    let tahta: Tahta | null = null;
    try {
      tahta = tahtaTemizle(JSON.parse(r.data));
    } catch {
      tahta = null;
    }
    if (!tahta) return null;
    return {
      id: r.id,
      title: r.title,
      author: r.author,
      authorHandle: r.author_handle,
      updated_at: r.updated_at,
      isPublic: r.is_public === 1,
      klasor: r.klasor,
      notlar: r.notlar,
      sabit: r.sabit === 1,
      benim,
      tahta,
    };
  });

export const profilVerisi = createServerFn({ method: "GET" }).handler(async () => {
  const uye = await aktifUye();
  if (!uye) return null;
  const yazilar = await db()
    .prepare(`${KART_SQL} WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT 100`)
    .bind(uye.id)
    .all<YaziKart>();
  const tahtalar = await db()
    .prepare("SELECT id, title, kind, is_public, updated_at, data, klasor, notlar, sabit FROM boards WHERE user_id = ? ORDER BY updated_at DESC LIMIT 200")
    .bind(uye.id)
    .all<TahtaOzet>();
  return { uye, yazilar: yazilar.results, tahtalar: tahtalar.results };
});

/* ---------- Profil ---------- */

export type TahtaOzet = {
  id: string;
  title: string;
  kind: string;
  is_public: number;
  updated_at: string;
  data: string;
  klasor: string;
  notlar: string;
  sabit: number;
};

export type ProfilBilgisi = {
  id: string;
  name: string;
  handle: string;
  role: string;
  bio: string;
  favori_takim: string;
  favori_dizilis: string;
  favori_oyuncu: string;
  renk: string;
  forma_no: string;
  kapak: string;
  konum: string;
  instagram: string;
  x_hesabi: string;
  youtube: string;
  created_at: string;
};

const PROFIL_ALANLARI =
  "id, name, handle, role, bio, favori_takim, favori_dizilis, favori_oyuncu, renk, forma_no, kapak, konum, instagram, x_hesabi, youtube, created_at";

export const profilGetir = createServerFn({ method: "GET" })
  .validator(z.object({ handle: z.string().max(40) }))
  .handler(async ({ data }) => {
    const uye = await aktifUye();
    const p = await db()
      .prepare(`SELECT ${PROFIL_ALANLARI} FROM users WHERE handle = ?`)
      .bind(data.handle.toLowerCase())
      .first<ProfilBilgisi>();
    if (!p) return null;
    const benim = uye?.id === p.id;
    const yazilar = await db()
      .prepare(`${KART_SQL} WHERE p.user_id = ? AND p.status = 'yayinda' ORDER BY p.published_at DESC LIMIT 60`)
      .bind(p.id)
      .all<YaziKart>();
    const tahtalar = await db()
      .prepare(
        `SELECT id, title, kind, is_public, updated_at, data, klasor, notlar, sabit FROM boards
         WHERE user_id = ? ${benim ? "" : "AND is_public = 1"} ORDER BY sabit DESC, updated_at DESC LIMIT 200`,
      )
      .bind(p.id)
      .all<TahtaOzet>();
    const begeni = await db()
      .prepare("SELECT COUNT(*) AS n FROM likes l JOIN posts p ON p.id = l.post_id WHERE p.user_id = ? AND p.status = 'yayinda'")
      .bind(p.id)
      .first<{ n: number }>();
    return { profil: p, benim, yazilar: yazilar.results, tahtalar: tahtalar.results, begeniToplam: begeni?.n ?? 0 };
  });

export const profilAyarlari = createServerFn({ method: "GET" }).handler(async () => {
  const uye = await aktifUye();
  if (!uye) return null;
  return await db().prepare(`SELECT ${PROFIL_ALANLARI} FROM users WHERE id = ?`).bind(uye.id).first<ProfilBilgisi>();
});

const sosyal = z
  .string()
  .trim()
  .transform((v) => v.replace(/^https?:\/\/[^/]+\//, "").replace(/^@/, "").replace(/[/?#].*$/, ""))
  .refine((v) => SOSYAL_KURALI.test(v), "Sosyal medya kullanıcı adında yalnızca harf, rakam, nokta, tire ve alt çizgi olabilir.");

export const profilKaydet = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().trim().min(2, "İsim en az 2 harf olmalı.").max(40),
      handle: z
        .string()
        .trim()
        .toLowerCase()
        .refine((v) => HANDLE_KURALI.test(v), "Kullanıcı adı 3-24 karakter olmalı; yalnızca küçük harf, rakam ve alt çizgi."),
      bio: z.string().trim().max(400),
      favori_takim: z.string().trim().max(40),
      favori_dizilis: z.string().trim().max(12),
      favori_oyuncu: z.string().trim().max(40),
      renk: z.string().refine((v) => FORMA_RENKLERI.some((r) => r.id === v)),
      forma_no: z.string().trim().regex(/^\d{0,2}$/, "Forma numarası en fazla 2 haneli olmalı."),
      kapak: z.string().refine((v) => KAPAKLAR.some((k) => k.id === v)),
      konum: z.string().trim().max(40),
      instagram: sosyal,
      x_hesabi: sosyal,
      youtube: sosyal,
    }),
  )
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    const d = db();
    const sahip = await d.prepare("SELECT id FROM users WHERE handle = ?").bind(data.handle).first<{ id: string }>();
    if (sahip && sahip.id !== uye.id) throw new Error("Bu kullanıcı adı alınmış, başka bir tane dene.");
    await d
      .prepare(
        `UPDATE users SET name = ?, handle = ?, bio = ?, favori_takim = ?, favori_dizilis = ?, favori_oyuncu = ?,
         renk = ?, forma_no = ?, kapak = ?, konum = ?, instagram = ?, x_hesabi = ?, youtube = ? WHERE id = ?`,
      )
      .bind(
        data.name, data.handle, data.bio, data.favori_takim, data.favori_dizilis, data.favori_oyuncu,
        data.renk, data.forma_no, data.kapak, data.konum, data.instagram, data.x_hesabi, data.youtube, uye.id,
      )
      .run();
    return { handle: data.handle };
  });

export const tahtaVitrin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().max(40), sabit: z.boolean() }))
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    await db().prepare("UPDATE boards SET sabit = ? WHERE id = ? AND user_id = ?").bind(data.sabit ? 1 : 0, data.id, uye.id).run();
    return { ok: true };
  });

export const tahtaSil = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().max(40) }))
  .handler(async ({ data }) => {
    const uye = await uyeGerekli();
    await db().prepare("UPDATE posts SET board_id = NULL WHERE board_id = ? AND user_id = ?").bind(data.id, uye.id).run();
    await db().prepare("DELETE FROM boards WHERE id = ? AND user_id = ?").bind(data.id, uye.id).run();
    return { ok: true };
  });

/* ---------- Yönetim ---------- */

export const yonetimVerisi = createServerFn({ method: "GET" }).handler(async () => {
  const uye = await aktifUye();
  if (!uye || uye.role !== "admin") return null;
  const bekleyen = await db().prepare(`${KART_SQL} WHERE p.status = 'beklemede' ORDER BY p.created_at ASC LIMIT 100`).all<YaziKart>();
  const yayinda = await db().prepare(`${KART_SQL} WHERE p.status = 'yayinda' ORDER BY p.published_at DESC LIMIT 40`).all<YaziKart>();
  const uyeSayisi = await db().prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
  return { bekleyen: bekleyen.results, yayinda: yayinda.results, konular: await konular(false), uyeSayisi: uyeSayisi?.n ?? 0 };
});

export const yaziDurumu = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().max(40), status: z.enum(["yayinda", "reddedildi", "beklemede"]) }))
  .handler(async ({ data }) => {
    await yoneticiGerekli();
    await db()
      .prepare(
        `UPDATE posts SET status = ?, published_at = CASE WHEN ? = 'yayinda' THEN COALESCE(published_at, datetime('now')) ELSE published_at END WHERE id = ?`,
      )
      .bind(data.status, data.status, data.id)
      .run();
    return { ok: true };
  });

export const yaziOneCikar = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().max(40), featured: z.boolean() }))
  .handler(async ({ data }) => {
    await yoneticiGerekli();
    await db().prepare("UPDATE posts SET featured = ? WHERE id = ?").bind(data.featured ? 1 : 0, data.id).run();
    return { ok: true };
  });

export const konuKaydet = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().trim().min(3, "Konu başlığı en az 3 karakter olmalı.").max(90),
      description: z.string().trim().max(300),
      kind: z.enum(["kategori", "konu"]),
    }),
  )
  .handler(async ({ data }) => {
    await yoneticiGerekli();
    const slug = `${slugYap(data.title) || "konu"}-${rastgeleHex(2)}`;
    await db()
      .prepare("INSERT INTO topics (id, slug, title, description, kind, is_open, sort) VALUES (?, ?, ?, ?, ?, 1, 50)")
      .bind(rastgeleHex(8), slug, data.title, data.description, data.kind)
      .run();
    return { ok: true };
  });

export const konuAcKapa = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().max(40), isOpen: z.boolean() }))
  .handler(async ({ data }) => {
    await yoneticiGerekli();
    await db().prepare("UPDATE topics SET is_open = ? WHERE id = ?").bind(data.isOpen ? 1 : 0, data.id).run();
    return { ok: true };
  });
