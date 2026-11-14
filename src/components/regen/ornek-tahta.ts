import { bosTahta, takimKur, type Tahta } from "@/lib/regen/board";

// Ana sayfadaki araç önizlemesi: 4-3-3'e karşı 4-4-2, birkaç vurgu.
const temel = bosTahta("taktik");

export const ORNEK_TAHTA: Tahta = {
  ...temel,
  top: { x: 43, y: 47 },
  oyuncular: temel.oyuncular.map((o) => (o.id === "b7" ? { ...o, ad: "10 numara" } : o)),
  isaretler: [
    { id: "o1", tur: "pas", p: [[43, 47], [55, 35]] },
    { id: "o2", tur: "kosu", p: [[64, 12], [80, 22]] },
    { id: "o3", tur: "rakip", p: [[61, 26], [56, 32]] },
    { id: "o4", tur: "cember", p: [[42, 48]] },
    { id: "o5", tur: "alan", p: [[52, 28], [64, 42]] },
    { id: "o6", tur: "soru", p: [[66, 18]] },
    { id: "o7", tur: "etiket", p: [[58, 52]], metin: "Arada boş" },
  ],
};

// Ana sayfadaki diziliş önizlemesi.
export const ORNEK_DIZILIS: Tahta = { ...bosTahta("dizilis"), dizilis: "4-2-3-1", oyuncular: takimKur("4-2-3-1", "biz") };
