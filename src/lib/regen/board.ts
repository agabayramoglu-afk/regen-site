// Tahta (diziliş ve taktik çizim) veri modeli. İstemci ve sunucu ortak kullanır.
// Koordinatlar metre: x 0..105 (soldan sağa, "biz" sağa hücum eder), y 0..68.

export type Takim = "biz" | "rakip" | "kaleci" | "rakip_kaleci";

export type Oyuncu = {
  id: string;
  x: number;
  y: number;
  no: string;
  ad: string;
  takim: Takim;
};

export type IsaretTur =
  | "pas"
  | "kosu"
  | "surme"
  | "rakip"
  | "cember"
  | "rakip_cember"
  | "soru"
  | "etiket"
  | "alan";

export type Isaret = {
  id: string;
  tur: IsaretTur;
  p: [number, number][];
  metin?: string;
};

export type TahtaTur = "dizilis" | "taktik";

export type Tahta = {
  v: 1;
  tur: TahtaTur;
  dizilis: string;
  rakipDizilis: string | null;
  oyuncular: Oyuncu[];
  top: { x: number; y: number } | null;
  isaretler: Isaret[];
};

export const SAHA_EN = 105;
export const SAHA_BOY = 68;

type Konum = [number, number, string];

// "Biz" sağa hücum eder; y=0 sahanın üst kenarı (sol kanat).
export const DIZILISLER: Record<string, Konum[]> = {
  "4-3-3": [
    [5, 34, "1"],
    [22, 10, "3"], [20, 26, "5"], [20, 42, "4"], [22, 58, "2"],
    [42, 20, "8"], [36, 34, "6"], [42, 48, "10"],
    [64, 12, "11"], [68, 34, "9"], [64, 56, "7"],
  ],
  "4-2-3-1": [
    [5, 34, "1"],
    [22, 10, "3"], [20, 26, "5"], [20, 42, "4"], [22, 58, "2"],
    [37, 26, "6"], [37, 42, "8"],
    [54, 12, "11"], [55, 34, "10"], [54, 56, "7"],
    [71, 34, "9"],
  ],
  "4-4-2": [
    [5, 34, "1"],
    [22, 10, "3"], [20, 26, "5"], [20, 42, "4"], [22, 58, "2"],
    [44, 10, "11"], [40, 26, "6"], [40, 42, "8"], [44, 58, "7"],
    [64, 26, "10"], [66, 42, "9"],
  ],
  "4-1-4-1": [
    [5, 34, "1"],
    [22, 10, "3"], [20, 26, "5"], [20, 42, "4"], [22, 58, "2"],
    [34, 34, "6"],
    [50, 10, "11"], [48, 26, "8"], [48, 42, "10"], [50, 58, "7"],
    [70, 34, "9"],
  ],
  "3-5-2": [
    [5, 34, "1"],
    [20, 18, "5"], [18, 34, "4"], [20, 50, "3"],
    [44, 6, "11"], [38, 24, "6"], [36, 34, "8"], [38, 44, "10"], [44, 62, "2"],
    [64, 26, "9"], [66, 42, "7"],
  ],
  "3-4-3": [
    [5, 34, "1"],
    [20, 18, "5"], [18, 34, "4"], [20, 50, "3"],
    [42, 8, "11"], [38, 26, "6"], [38, 42, "8"], [42, 60, "2"],
    [62, 14, "10"], [67, 34, "9"], [62, 54, "7"],
  ],
  "5-3-2": [
    [5, 34, "1"],
    [26, 6, "3"], [19, 20, "5"], [17, 34, "4"], [19, 48, "6"], [26, 62, "2"],
    [42, 20, "8"], [38, 34, "10"], [42, 48, "7"],
    [62, 26, "9"], [64, 42, "11"],
  ],
};

export const DIZILIS_ADLARI = Object.keys(DIZILISLER);

export function yeniId(): string {
  const a = new Uint8Array(6);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function takimKur(dizilis: string, taraf: "biz" | "rakip"): Oyuncu[] {
  const konumlar = DIZILISLER[dizilis] ?? DIZILISLER["4-3-3"];
  return konumlar.map(([x, y, no], i) => {
    const kaleci = i === 0;
    if (taraf === "biz") {
      return { id: `b${i}`, x, y, no, ad: "", takim: kaleci ? "kaleci" : "biz" };
    }
    return {
      id: `r${i}`,
      x: SAHA_EN - x,
      y: SAHA_BOY - y,
      no,
      ad: "",
      takim: kaleci ? "rakip_kaleci" : "rakip",
    };
  });
}

export function bosTahta(tur: TahtaTur): Tahta {
  if (tur === "dizilis") {
    return {
      v: 1,
      tur,
      dizilis: "4-3-3",
      rakipDizilis: null,
      oyuncular: takimKur("4-3-3", "biz"),
      top: null,
      isaretler: [],
    };
  }
  return {
    v: 1,
    tur,
    dizilis: "4-3-3",
    rakipDizilis: "4-4-2",
    oyuncular: [...takimKur("4-3-3", "biz"), ...takimKur("4-4-2", "rakip")],
    top: { x: 37, y: 34 },
    isaretler: [],
  };
}

// Mevcut isim ve numaraları koruyarak bir takımı yeni dizilişe taşır.
export function dizilisDegistir(t: Tahta, dizilis: string, taraf: "biz" | "rakip"): Tahta {
  const yeni = takimKur(dizilis, taraf);
  const eski = t.oyuncular.filter((o) =>
    taraf === "biz" ? o.takim === "biz" || o.takim === "kaleci" : o.takim === "rakip" || o.takim === "rakip_kaleci",
  );
  const birlesik = yeni.map((o, i) => ({ ...o, ad: eski[i]?.ad ?? "", no: eski[i]?.no || o.no }));
  const digerleri = t.oyuncular.filter((o) => !eski.includes(o));
  return {
    ...t,
    dizilis: taraf === "biz" ? dizilis : t.dizilis,
    rakipDizilis: taraf === "rakip" ? dizilis : t.rakipDizilis,
    oyuncular: taraf === "biz" ? [...birlesik, ...digerleri] : [...digerleri, ...birlesik],
  };
}

const TURLER: IsaretTur[] = ["pas", "kosu", "surme", "rakip", "cember", "rakip_cember", "soru", "etiket", "alan"];
const TAKIMLAR: Takim[] = ["biz", "rakip", "kaleci", "rakip_kaleci"];

const sayi = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
const metin = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

// Dışarıdan gelen veriyi güvenli bir Tahta'ya dönüştürür (sunucuda kayıttan önce).
export function tahtaTemizle(girdi: unknown): Tahta | null {
  if (!girdi || typeof girdi !== "object") return null;
  const g = girdi as Record<string, unknown>;
  const tur: TahtaTur = g.tur === "taktik" ? "taktik" : "dizilis";
  const oyuncular = Array.isArray(g.oyuncular) ? g.oyuncular.slice(0, 30) : [];
  const isaretler = Array.isArray(g.isaretler) ? g.isaretler.slice(0, 80) : [];
  const top = g.top && typeof g.top === "object" ? (g.top as Record<string, unknown>) : null;
  return {
    v: 1,
    tur,
    dizilis: metin(g.dizilis, 12) || "4-3-3",
    rakipDizilis: typeof g.rakipDizilis === "string" ? metin(g.rakipDizilis, 12) : null,
    oyuncular: oyuncular.map((o, i) => {
      const r = (o ?? {}) as Record<string, unknown>;
      const takim = TAKIMLAR.includes(r.takim as Takim) ? (r.takim as Takim) : "biz";
      return {
        id: metin(r.id, 20) || `o${i}`,
        x: sayi(r.x, 0, SAHA_EN),
        y: sayi(r.y, 0, SAHA_BOY),
        no: metin(r.no, 3),
        ad: metin(r.ad, 24),
        takim,
      };
    }),
    top: top ? { x: sayi(top.x, 0, SAHA_EN), y: sayi(top.y, 0, SAHA_BOY) } : null,
    isaretler: isaretler
      .map((m, i) => {
        const r = (m ?? {}) as Record<string, unknown>;
        if (!TURLER.includes(r.tur as IsaretTur)) return null;
        const p = Array.isArray(r.p) ? r.p.slice(0, 2) : [];
        const noktalar = p.map((q) => {
          const a = Array.isArray(q) ? q : [0, 0];
          return [sayi(a[0], -5, SAHA_EN + 5), sayi(a[1], -5, SAHA_BOY + 5)] as [number, number];
        });
        if (noktalar.length === 0) return null;
        const isaret: Isaret = { id: metin(r.id, 20) || `m${i}`, tur: r.tur as IsaretTur, p: noktalar };
        if (r.tur === "etiket") isaret.metin = metin(r.metin, 28) || "Not";
        return isaret;
      })
      .filter((m): m is Isaret => m !== null),
  };
}
