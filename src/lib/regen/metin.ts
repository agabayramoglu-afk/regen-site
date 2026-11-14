// Metin yardımcıları (istemci + sunucu).

const TR: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u",
};

export function slugYap(s: string): string {
  return s
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (h) => TR[h] ?? h)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export function ozetCikar(govde: string, n = 180): string {
  const duz = govde
    .split("\n")
    .filter((l) => !l.startsWith("## ") && l.trim() !== "")
    .map((l) => l.replace(/^>\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (duz.length <= n) return duz;
  const kes = duz.slice(0, n);
  const son = kes.lastIndexOf(" ");
  return `${kes.slice(0, son > 80 ? son : n)}…`;
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

// D1 "YYYY-MM-DD HH:MM:SS" (UTC) biçimini Türkçe güne çevirir.
export function tarihYaz(d: string | null | undefined): string {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return "";
  return `${Number(m[3])} ${AYLAR[Number(m[2]) - 1] ?? ""} ${m[1]}`;
}

export function okumaSuresi(govde: string): number {
  const kelime = govde.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(kelime / 200));
}

export type GovdeParca =
  | { tur: "p"; metin: string }
  | { tur: "h2"; metin: string }
  | { tur: "alinti"; metin: string };

// Basit yazı biçimi: boş satır paragraf ayırır, "## " ara başlık, "> " alıntı.
export function govdeAyristir(govde: string): GovdeParca[] {
  const bloklar = govde.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const sonuc: GovdeParca[] = [];
  for (const b of bloklar) {
    const t = b.trim();
    if (!t) continue;
    if (t.startsWith("## ")) sonuc.push({ tur: "h2", metin: t.slice(3).trim() });
    else if (t.startsWith(">"))
      sonuc.push({ tur: "alinti", metin: t.split("\n").map((l) => l.replace(/^>\s?/, "")).join(" ").trim() });
    else sonuc.push({ tur: "p", metin: t.replace(/\n/g, " ") });
  }
  return sonuc;
}
