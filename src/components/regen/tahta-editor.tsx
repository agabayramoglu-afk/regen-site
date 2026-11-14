// Etkileşimli diziliş kurucu ve taktik tahta.
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as RPointerEvent, ReactNode } from "react";

import {
  bosTahta,
  DIZILIS_ADLARI,
  dizilisDegistir,
  SAHA_BOY,
  SAHA_EN,
  yeniId,
  type Isaret,
  type IsaretTur,
  type Tahta,
  type TahtaTur,
} from "@/lib/regen/board";
import { RENK, TahtaSvg } from "./tahta-svg";

type Arac = "sec" | IsaretTur | "sil";

const ARACLAR: { arac: Arac; ad: string; ipucu: string; sadeceTaktik?: boolean }[] = [
  { arac: "sec", ad: "Taşı", ipucu: "Oyuncuları, topu ve çizimleri sürükleyerek taşı. İsmini düzenlemek için oyuncuya dokun." },
  { arac: "pas", ad: "Pas", ipucu: "Pasın başladığı yerden bittiği yere sürükle." },
  { arac: "kosu", ad: "Topsuz koşu", ipucu: "Koşunun başlangıcından hedefine sürükle." },
  { arac: "surme", ad: "Top sürme", ipucu: "Sürmenin başlangıcından hedefine sürükle." },
  { arac: "rakip", ad: "Rakip hareketi", ipucu: "Rakibin pres ya da kayma yönünü sürükleyerek çiz.", sadeceTaktik: true },
  { arac: "cember", ad: "Bizim oyuncu", ipucu: "Öne çıkarmak istediğin oyuncuya dokun." },
  { arac: "rakip_cember", ad: "Rakip oyuncu", ipucu: "Göstermek istediğin rakibe dokun.", sadeceTaktik: true },
  { arac: "soru", ad: "Kararsızlık", ipucu: "Rakibin kararsız kaldığı yere dokun.", sadeceTaktik: true },
  { arac: "alan", ad: "Alan", ipucu: "Kontrol ettiğin ya da boş kalan alanı köşeden köşeye sürükle." },
  { arac: "etiket", ad: "Etiket", ipucu: "Metni yaz, sonra sahada yerine dokun." },
  { arac: "sil", ad: "Sil", ipucu: "Silmek istediğin çizime dokun." },
];

function AracOrnegi({ arac }: { arac: Arac }) {
  const c = arac === "rakip" || arac === "rakip_cember" ? "#FFFFFF" : RENK.turuncu;
  let ic: ReactNode = null;
  if (arac === "pas" || arac === "kosu" || arac === "rakip")
    ic = (
      <>
        <path d="M4 18 Q 16 6 28 12" fill="none" stroke={c} strokeWidth={3} strokeDasharray={arac === "pas" ? undefined : "5 4"} strokeLinecap="round" />
        <path d="M22 8 L 28 12 L 21 15" fill="none" stroke={c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </>
    );
  else if (arac === "surme")
    ic = <path d="M3 14 q 3 -5 6 0 t 6 0 t 6 0 l 6 0 M23 10 L 28 14 L 23 18" fill="none" stroke={c} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />;
  else if (arac === "cember" || arac === "rakip_cember")
    ic = <circle cx={16} cy={13} r={9} fill="none" stroke={c} strokeWidth={2.6} strokeDasharray="4 3" />;
  else if (arac === "soru")
    ic = <text x={16} y={20} textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={20} fill={RENK.tebesir} stroke={RENK.murekkep} strokeWidth={1.6} paintOrder="stroke">?</text>;
  else if (arac === "alan")
    ic = <rect x={5} y={5} width={22} height={16} rx={4} fill={RENK.turuncu} fillOpacity={0.25} stroke={RENK.turuncu} strokeWidth={2} strokeDasharray="4 3" />;
  else if (arac === "etiket")
    ic = <rect x={4} y={7} width={24} height={12} rx={3} fill={RENK.turuncu} />;
  else if (arac === "sil")
    ic = <path d="M9 7 L 23 21 M23 7 L 9 21" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />;
  else
    ic = <path d="M10 5 L 10 22 L 14 18 L 17 24 L 20 23 L 17 17 L 22 17 Z" fill="#FFFFFF" />;
  return (
    <svg width={32} height={26} viewBox="0 0 32 26" aria-hidden="true">
      {ic}
    </svg>
  );
}

const TIKLAMA: Arac[] = ["cember", "rakip_cember", "soru", "etiket"];
const SURUKLEME: Arac[] = ["pas", "kosu", "surme", "rakip", "alan"];

type KaydetSonuc = { id: string };

export function TahtaEditor({
  tur,
  baslangic,
  baslangicBaslik,
  baslangicId,
  girisli,
  kaydet,
}: {
  tur: TahtaTur;
  baslangic?: Tahta | null;
  baslangicBaslik?: string;
  baslangicId?: string | null;
  girisli: boolean;
  kaydet: (girdi: { id: string | null; title: string; data: Tahta; isPublic: boolean }) => Promise<KaydetSonuc>;
}) {
  const taslakAnahtari = `regen-tahta-${tur}`;
  const [tahta, setTahta] = useState<Tahta>(() => baslangic ?? bosTahta(tur));
  const [gecmis, setGecmis] = useState<Tahta[]>([]);
  const [arac, setArac] = useState<Arac>("sec");
  const [secili, setSecili] = useState<string | null>(null);
  const [taslak, setTaslak] = useState<Isaret | null>(null);
  const [etiketMetni, setEtiketMetni] = useState("Arada boş");
  const [baslik, setBaslik] = useState(baslangicBaslik ?? "");
  const [herkeseAcik, setHerkeseAcik] = useState(true);
  const [kayitId, setKayitId] = useState<string | null>(baslangicId ?? null);
  const [durum, setDurum] = useState<{ tur: "ok" | "hata"; metin: string } | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const surukle = useRef<{ tur: "oyuncu" | "top" | "isaret"; id: string; son?: [number, number] } | null>(null);
  const yuklendi = useRef(false);

  // Giriş yapmadan çalışan kaybolmasın: taslak tarayıcıda saklanır.
  useEffect(() => {
    if (baslangic) {
      yuklendi.current = true;
      return;
    }
    try {
      const s = window.localStorage.getItem(taslakAnahtari);
      if (s) {
        const t = JSON.parse(s) as Tahta;
        if (t && t.v === 1 && Array.isArray(t.oyuncular)) setTahta(t);
      }
    } catch {
      /* taslak yok */
    }
    yuklendi.current = true;
  }, [baslangic, taslakAnahtari]);

  useEffect(() => {
    if (!yuklendi.current) return;
    try {
      window.localStorage.setItem(taslakAnahtari, JSON.stringify(tahta));
    } catch {
      /* depolama kapalı */
    }
  }, [tahta, taslakAnahtari]);

  const degistir = useCallback(
    (f: (t: Tahta) => Tahta) => {
      setGecmis((g) => [...g.slice(-40), tahta]);
      setTahta(f(tahta));
    },
    [tahta],
  );

  const noktaAl = (e: { clientX: number; clientY: number }): [number, number] => {
    const svg = svgRef.current;
    if (!svg) return [0, 0];
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return [0, 0];
    const p = pt.matrixTransform(m.inverse());
    return [Math.round((p.x / 10) * 10) / 10, Math.round((p.y / 10) * 10) / 10];
  };

  const yakinOyuncu = (x: number, y: number) => {
    let en: { x: number; y: number } | null = null;
    let d = 3.2;
    for (const o of tahta.oyuncular) {
      const dd = Math.hypot(o.x - x, o.y - y);
      if (dd < d) {
        d = dd;
        en = o;
      }
    }
    return en;
  };

  const sahaDown = (e: RPointerEvent<SVGSVGElement>) => {
    if (surukle.current) return;
    const [x, y] = noktaAl(e);
    if (arac === "sec") {
      setSecili(null);
      return;
    }
    if (TIKLAMA.includes(arac)) {
      const yakin = arac === "cember" || arac === "rakip_cember" ? yakinOyuncu(x, y) : null;
      const p: [number, number] = yakin ? [yakin.x, yakin.y] : [x, y];
      const m: Isaret = { id: yeniId(), tur: arac as IsaretTur, p: [p] };
      if (arac === "etiket") m.metin = etiketMetni.trim().slice(0, 28) || "Not";
      degistir((t) => ({ ...t, isaretler: [...t.isaretler, m] }));
      return;
    }
    if (SURUKLEME.includes(arac)) {
      svgRef.current?.setPointerCapture(e.pointerId);
      setTaslak({ id: yeniId(), tur: arac as IsaretTur, p: [[x, y], [x, y]] });
    }
  };

  const oyuncuDown = (id: string, e: RPointerEvent<SVGGElement>) => {
    if (arac !== "sec") return;
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    surukle.current = { tur: "oyuncu", id };
    setSecili(id);
    setGecmis((g) => [...g.slice(-40), tahta]);
  };

  const topDown = (e: RPointerEvent<SVGGElement>) => {
    if (arac !== "sec") return;
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    surukle.current = { tur: "top", id: "top" };
    setGecmis((g) => [...g.slice(-40), tahta]);
  };

  const isaretDown = (id: string, e: RPointerEvent<SVGGElement>) => {
    if (arac === "sil") {
      e.stopPropagation();
      degistir((t) => ({ ...t, isaretler: t.isaretler.filter((m) => m.id !== id) }));
      return;
    }
    if (arac !== "sec") return;
    e.stopPropagation();
    svgRef.current?.setPointerCapture(e.pointerId);
    surukle.current = { tur: "isaret", id, son: noktaAl(e) };
    setSecili(null);
    setGecmis((g) => [...g.slice(-40), tahta]);
  };

  const hareket = (e: RPointerEvent<SVGSVGElement>) => {
    const s = surukle.current;
    if (s) {
      const [x, y] = noktaAl(e);
      const cx = Math.min(SAHA_EN + 2, Math.max(-2, x));
      const cy = Math.min(SAHA_BOY + 2, Math.max(-2, y));
      if (s.tur === "isaret") {
        const [sx, sy] = s.son ?? [x, y];
        const dx = x - sx;
        const dy = y - sy;
        s.son = [x, y];
        setTahta((t) => ({
          ...t,
          isaretler: t.isaretler.map((m) =>
            m.id === s.id ? { ...m, p: m.p.map(([px, py]) => [px + dx, py + dy] as [number, number]) } : m,
          ),
        }));
        return;
      }
      if (s.tur === "top") setTahta((t) => ({ ...t, top: { x: cx, y: cy } }));
      else setTahta((t) => ({ ...t, oyuncular: t.oyuncular.map((o) => (o.id === s.id ? { ...o, x: cx, y: cy } : o)) }));
      return;
    }
    if (taslak) {
      const [x, y] = noktaAl(e);
      setTaslak({ ...taslak, p: [taslak.p[0], [x, y]] });
    }
  };

  const birak = () => {
    if (surukle.current) {
      surukle.current = null;
      return;
    }
    if (taslak) {
      const [a, b] = taslak.p;
      const uzunluk = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (uzunluk > 2) {
        const m = taslak;
        degistir((t) => ({ ...t, isaretler: [...t.isaretler, m] }));
      }
      setTaslak(null);
    }
  };

  const geriAl = () => {
    if (gecmis.length === 0) return;
    setTahta(gecmis[gecmis.length - 1]);
    setGecmis(gecmis.slice(0, -1));
  };

  // Ctrl+Z (Mac'te Cmd+Z) ile geri al. Yazı alanlarında tarayıcının kendi geri alması çalışır.
  const geriAlRef = useRef(geriAl);
  useEffect(() => {
    geriAlRef.current = geriAl;
  });
  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey || e.key.toLowerCase() !== "z") return;
      const hedef = e.target as HTMLElement | null;
      if (hedef && (hedef.tagName === "INPUT" || hedef.tagName === "TEXTAREA" || hedef.isContentEditable)) return;
      e.preventDefault();
      geriAlRef.current();
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, []);

  const seciliOyuncu = tahta.oyuncular.find((o) => o.id === secili) ?? null;

  const oyuncuGuncelle = (alan: "no" | "ad", deger: string) => {
    if (!secili) return;
    setTahta((t) => ({
      ...t,
      oyuncular: t.oyuncular.map((o) => (o.id === secili ? { ...o, [alan]: deger.slice(0, alan === "no" ? 3 : 24) } : o)),
    }));
  };

  const sifirla = () => {
    degistir(() => bosTahta(tur));
    setSecili(null);
  };

  const pngIndir = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const kopya = svg.cloneNode(true) as SVGSVGElement;
    kopya.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    kopya.setAttribute("width", "2260");
    kopya.setAttribute("height", "1520");
    const veri = new XMLSerializer().serializeToString(kopya);
    const url = URL.createObjectURL(new Blob([veri], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 2260;
      canvas.height = 1520;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = RENK.kagit;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `regen-${tur}-${(baslik || "cizim").replace(/\s+/g, "-").toLowerCase()}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  };

  const kaydetTikla = async () => {
    setDurum(null);
    if (!baslik.trim()) {
      setDurum({ tur: "hata", metin: "Çizime kısa bir isim ver." });
      return;
    }
    setKaydediliyor(true);
    try {
      const r = await kaydet({ id: kayitId, title: baslik.trim(), data: tahta, isPublic: herkeseAcik });
      setKayitId(r.id);
      setDurum({ tur: "ok", metin: "Kaydedildi." });
    } catch (err) {
      setDurum({ tur: "hata", metin: err instanceof Error ? err.message : "Kaydedilemedi." });
    } finally {
      setKaydediliyor(false);
    }
  };

  const gorunurAraclar = ARACLAR.filter((a) => tur === "taktik" || !a.sadeceTaktik);
  const aktifIpucu = ARACLAR.find((a) => a.arac === arac)?.ipucu;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap gap-2" role="toolbar" aria-label="Çizim araçları">
          {gorunurAraclar.map((a) => (
            <button
              key={a.arac}
              type="button"
              onClick={() => setArac(a.arac)}
              aria-pressed={arac === a.arac}
              className={`flex min-h-11 items-center gap-1.5 rounded-lg border-2 px-2.5 text-sm font-bold transition-transform active:translate-y-px ${
                arac === a.arac ? "border-white bg-white text-zemin" : "border-white/15 bg-yuzey text-yazi hover:border-white/60"
              }`}
            >
              <span className="rounded-md bg-zemin/80 px-0.5">
                <AracOrnegi arac={a.arac} />
              </span>
              {a.ad}
            </button>
          ))}
        </div>
        <p className="mb-3 min-h-6 text-sm text-soluk" aria-live="polite">
          {aktifIpucu}
        </p>
        {arac === "etiket" ? (
          <div className="mb-3 flex max-w-sm flex-col gap-1">
            <label htmlFor="etiket-metni" className="text-sm font-bold">Etiket metni</label>
            <input
              id="etiket-metni"
              value={etiketMetni}
              maxLength={28}
              onChange={(e) => setEtiketMetni(e.target.value)}
              className="h-11 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-3 font-semibold"
            />
          </div>
        ) : null}
        <div className="overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-[0_30px_80px_-30px_rgba(249,75,2,0.45)]">
          <TahtaSvg
            tahta={tahta}
            svgRef={svgRef}
            secili={secili}
            taslak={taslak}
            onSahaDown={sahaDown}
            onMove={hareket}
            onUp={birak}
            onOyuncuDown={oyuncuDown}
            onTopDown={tahta.top ? topDown : undefined}
            onIsaretDown={isaretDown}
            imlec={arac === "sec" ? "grab" : arac === "sil" ? "pointer" : "crosshair"}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={geriAl} disabled={gecmis.length === 0} className="min-h-11 rounded-lg border-2 border-white/25 px-4 text-sm font-bold disabled:opacity-40">
            Geri al <span className="ml-1 text-xs font-semibold opacity-60">Ctrl+Z</span>
          </button>
          <button
            type="button"
            onClick={() => degistir((t) => ({ ...t, isaretler: [] }))}
            className="min-h-11 rounded-lg border-2 border-white/25 px-4 text-sm font-bold"
          >
            Çizimleri temizle
          </button>
          <button type="button" onClick={sifirla} className="min-h-11 rounded-lg border-2 border-white/25 px-4 text-sm font-bold">
            Baştan başla
          </button>
          <button type="button" onClick={pngIndir} className="min-h-11 rounded-lg border-2 border-white/25 px-4 text-sm font-bold">
            Görsel indir
          </button>
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <section className="regen-cam rounded-3xl p-5">
          <h2 className="mb-3 text-lg font-black">{tur === "dizilis" ? "Diziliş" : "Bizim diziliş"}</h2>
          <div className="flex flex-wrap gap-2">
            {DIZILIS_ADLARI.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => degistir((t) => dizilisDegistir(t, d, "biz"))}
                aria-pressed={tahta.dizilis === d}
                className={`min-h-11 rounded-full border-2 px-3.5 text-sm font-extrabold ${
                  tahta.dizilis === d ? "border-turuncu bg-turuncu text-white" : "border-white/15 hover:border-white/60"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {tur === "taktik" ? (
            <>
              <h3 className="mb-3 mt-5 text-base font-black">Rakip diziliş</h3>
              <div className="flex flex-wrap gap-2">
                {DIZILIS_ADLARI.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => degistir((t) => dizilisDegistir(t, d, "rakip"))}
                    aria-pressed={tahta.rakipDizilis === d}
                    className={`min-h-11 rounded-full border-2 px-3.5 text-sm font-extrabold ${
                      tahta.rakipDizilis === d ? "border-white bg-white text-zemin" : "border-white/15 hover:border-white/60"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </section>

        <section className="regen-cam rounded-3xl p-5">
          <h2 className="mb-1 text-lg font-black">Oyuncu</h2>
          {seciliOyuncu ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-soluk">
                {seciliOyuncu.takim === "rakip" || seciliOyuncu.takim === "rakip_kaleci" ? "Rakip" : "Bizim"} oyuncu seçili.
              </p>
              <div className="flex gap-3">
                <div className="flex w-20 flex-col gap-1">
                  <label htmlFor="oyuncu-no" className="text-sm font-bold">Numara</label>
                  <input id="oyuncu-no" value={seciliOyuncu.no} onChange={(e) => oyuncuGuncelle("no", e.target.value)} className="h-11 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-3 font-bold" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <label htmlFor="oyuncu-ad" className="text-sm font-bold">İsim</label>
                  <input id="oyuncu-ad" value={seciliOyuncu.ad} placeholder="Örn. Kaptan" onChange={(e) => oyuncuGuncelle("ad", e.target.value)} className="h-11 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-3 font-semibold" />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-soluk">Taşı aracı seçiliyken bir oyuncuya dokun; numarasını ve ismini buradan yaz.</p>
          )}
        </section>

        <section className="regen-cam rounded-3xl p-5">
          <h2 className="mb-3 text-lg font-black">Kaydet ve paylaş</h2>
          {girisli ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="tahta-baslik" className="text-sm font-bold">Çizimin adı</label>
                <input id="tahta-baslik" value={baslik} maxLength={80} placeholder="Örn. Sol kanatta üçgen" onChange={(e) => setBaslik(e.target.value)} className="h-11 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-3 font-semibold" />
              </div>
              <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={herkeseAcik} onChange={(e) => setHerkeseAcik(e.target.checked)} className="size-5 accent-turuncu" />
                Bağlantısı olan herkes görebilsin
              </label>
              <button
                type="button"
                onClick={kaydetTikla}
                disabled={kaydediliyor}
                className="regen-parlak min-h-12 rounded-full px-5 font-extrabold disabled:opacity-60"
              >
                {kaydediliyor ? "Kaydediliyor" : kayitId ? "Güncelle" : "Kaydet"}
              </button>
              {durum ? (
                <p role="status" className={`text-sm font-bold ${durum.tur === "ok" ? "text-yazi" : "text-turuncu-acik"}`}>{durum.metin}</p>
              ) : null}
              {kayitId ? (
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
                  <Link to="/cizim/$id" params={{ id: kayitId }} className="underline decoration-turuncu decoration-2 underline-offset-4">
                    Paylaşım sayfası
                  </Link>
                  <Link to="/yaz" search={{ cizim: kayitId }} className="underline decoration-turuncu decoration-2 underline-offset-4">
                    Bununla yazı yaz
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-soluk">
              Çizimin bu tarayıcıda saklanıyor. Kaydedip paylaşmak ve yazına eklemek için{" "}
              <Link to="/giris" className="font-bold text-yazi underline decoration-turuncu decoration-2 underline-offset-4">giriş yap</Link>{" "}
              ya da{" "}
              <Link to="/kayit" className="font-bold text-yazi underline decoration-turuncu decoration-2 underline-offset-4">üye ol</Link>.
            </p>
          )}
        </section>
      </aside>
    </div>
  );
}
