// Profil seçenekleri (istemci + sunucu).

export const FORMA_RENKLERI: { id: string; ad: string; dolgu: string; yazi: string }[] = [
  { id: "turuncu", ad: "Turuncu", dolgu: "#F94B02", yazi: "#FFFFFF" },
  { id: "siyah", ad: "Siyah", dolgu: "#111111", yazi: "#FFFFFF" },
  { id: "beyaz", ad: "Beyaz", dolgu: "#F6F3EA", yazi: "#111111" },
  { id: "kirmizi", ad: "Kırmızı", dolgu: "#D7263D", yazi: "#FFFFFF" },
  { id: "bordo", ad: "Bordo", dolgu: "#7A1C2E", yazi: "#FFFFFF" },
  { id: "sari", ad: "Sarı", dolgu: "#F2C230", yazi: "#111111" },
  { id: "lacivert", ad: "Lacivert", dolgu: "#1D3A8A", yazi: "#FFFFFF" },
  { id: "mavi", ad: "Mavi", dolgu: "#2F80ED", yazi: "#FFFFFF" },
  { id: "yesil", ad: "Yeşil", dolgu: "#1E8E3E", yazi: "#FFFFFF" },
  { id: "mor", ad: "Mor", dolgu: "#5B2A86", yazi: "#FFFFFF" },
];

export const KAPAKLAR: { id: string; ad: string }[] = [
  { id: "kor", ad: "Kor" },
  { id: "gece", ad: "Gece" },
  { id: "saha", ad: "Saha" },
  { id: "tebesir", ad: "Tebeşir" },
];

// Taktik odasındaki hazır klasörler. Kullanıcı kendi klasör adını da yazabilir.
export const HAZIR_KLASORLER = [
  "Favori dizilişlerim",
  "Hücum planlarım",
  "Pres planlarım",
  "Savunma planlarım",
  "Duran toplar",
  "Maç analizleri",
];

export const KLASORSUZ = "Diğer çizimler";

export const HANDLE_KURALI = /^[a-z0-9_]{3,24}$/;
export const SOSYAL_KURALI = /^[A-Za-z0-9._-]{0,40}$/;

export function formaRengi(id: string | null | undefined) {
  return FORMA_RENKLERI.find((r) => r.id === id) ?? FORMA_RENKLERI[0];
}

export function kapakGecerli(id: string | null | undefined) {
  return KAPAKLAR.some((k) => k.id === id) ? (id as string) : "kor";
}

const TR: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };

// İsimden kullanıcı adı önerisi: küçük harf, rakam ve alt çizgi.
export function handleOner(isim: string): string {
  const h = isim
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (c) => TR[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 18);
  return h.length >= 3 ? h : `uye_${h}`.slice(0, 18);
}

export function basHarfler(isim: string): string {
  const p = isim.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toLocaleUpperCase("tr");
}
