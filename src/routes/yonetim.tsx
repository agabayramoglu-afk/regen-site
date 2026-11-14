import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { konuAcKapa, konuKaydet, yaziDurumu, yaziOneCikar, yonetimVerisi } from "@/lib/regen/api.functions";
import { KonuEtiketi, SayfaBasligi } from "@/components/regen/site";
import { tarihYaz } from "@/lib/regen/metin";

export const Route = createFileRoute("/yonetim")({
  loader: () => yonetimVerisi(),
  head: () => ({ meta: [{ title: "Yönetim | Regen" }, { name: "robots", content: "noindex" }] }),
  component: Yonetim,
});

function Yonetim() {
  const veri = Route.useLoaderData();
  const router = useRouter();
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [tur, setTur] = useState<"konu" | "kategori">("konu");
  const [hata, setHata] = useState<string | null>(null);

  if (!veri) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
        <SayfaBasligi baslik="Yönetim" alt="Bu sayfa yalnızca yönetici içindir." />
      </main>
    );
  }

  const yenile = () => router.invalidate();

  const konuEkle = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setHata(null);
    try {
      await konuKaydet({ data: { title: baslik, description: aciklama, kind: tur } });
      setBaslik("");
      setAciklama("");
      await yenile();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Konu eklenemedi.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6">
      <SayfaBasligi ust={`${veri.uyeSayisi} üye`} baslik="Yönetim" alt="Bekleyen yazıları onayla, haftanın konusunu aç, öne çıkanları seç." />

      <section aria-labelledby="bekleyen" className="mt-12">
        <h2 id="bekleyen" className="mb-5 text-2xl font-black">Onay bekleyen yazılar ({veri.bekleyen.length})</h2>
        {veri.bekleyen.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-white/15 p-8 text-soluk">Bekleyen yazı yok.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {veri.bekleyen.map((y) => (
              <li key={y.id} className="flex flex-col gap-3 rounded-2xl bg-yuzey p-5 md:flex-row md:items-center">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <KonuEtiketi baslik={y.topic_title} tur={y.topic_kind} />
                    <span className="text-sm text-soluk">{y.author} · {tarihYaz(y.created_at)}</span>
                  </div>
                  <Link to="/yazilar/$slug" params={{ slug: y.slug }} className="text-lg font-extrabold underline decoration-turuncu decoration-2 underline-offset-4">
                    {y.title}
                  </Link>
                  <p className="line-clamp-2 text-sm text-soluk">{y.excerpt}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await yaziDurumu({ data: { id: y.id, status: "yayinda" } });
                      await yenile();
                    }}
                    className="min-h-11 regen-parlak rounded-full px-4 font-extrabold text-white"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await yaziDurumu({ data: { id: y.id, status: "reddedildi" } });
                      await yenile();
                    }}
                    className="min-h-11 rounded-lg border-2 border-white/25 px-4 font-extrabold"
                  >
                    Reddet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="konular-yonet" className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <h2 id="konular-yonet" className="mb-5 text-2xl font-black">Konular</h2>
          <ul className="divide-y-2 divide-white/10 rounded-2xl bg-yuzey">
            {veri.konular.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center gap-3 p-4">
                <KonuEtiketi baslik={k.kind === "konu" ? "Haftalık" : "Kategori"} tur={k.kind} />
                <span className="min-w-0 flex-1 font-bold">{k.title}</span>
                <span className="text-sm text-soluk">{k.yazi_sayisi} yazı</span>
                <button
                  type="button"
                  onClick={async () => {
                    await konuAcKapa({ data: { id: k.id, isOpen: k.is_open !== 1 } });
                    await yenile();
                  }}
                  className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${k.is_open ? "border-2 border-white/25" : "bg-white text-zemin"}`}
                >
                  {k.is_open ? "Kapat" : "Aç"}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={konuEkle} className="flex flex-col gap-4 self-start rounded-2xl border-2 border-white/25 p-6">
          <h3 className="text-xl font-black">Yeni konu aç</h3>
          <fieldset className="flex gap-4">
            <legend className="mb-2 font-bold">Tür</legend>
            <label className="flex min-h-11 items-center gap-2 font-semibold">
              <input type="radio" name="tur" checked={tur === "konu"} onChange={() => setTur("konu")} className="size-5 accent-turuncu" />
              Haftanın konusu
            </label>
            <label className="flex min-h-11 items-center gap-2 font-semibold">
              <input type="radio" name="tur" checked={tur === "kategori"} onChange={() => setTur("kategori")} className="size-5 accent-turuncu" />
              Kategori
            </label>
          </fieldset>
          <div className="flex flex-col gap-2">
            <label htmlFor="konu-baslik" className="font-bold">Başlık</label>
            <input id="konu-baslik" value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={90} placeholder="Örn. Derbide orta saha savaşı" className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-3 font-semibold" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="konu-aciklama" className="font-bold">Kısa açıklama</label>
            <textarea id="konu-aciklama" value={aciklama} onChange={(e) => setAciklama(e.target.value)} maxLength={300} rows={3} className="rounded-lg border border-white/15 bg-yuzey2 text-yazi p-3" />
          </div>
          {hata ? <p role="alert" className="font-bold text-turuncu-acik">{hata}</p> : null}
          <button type="submit" className="min-h-12 regen-parlak rounded-full font-extrabold text-white">Konuyu aç</button>
        </form>
      </section>

      <section aria-labelledby="yayinda" className="mt-16">
        <h2 id="yayinda" className="mb-5 text-2xl font-black">Yayındaki yazılar</h2>
        <ul className="divide-y-2 divide-white/10 rounded-2xl bg-yuzey">
          {veri.yayinda.map((y) => (
            <li key={y.id} className="flex flex-wrap items-center gap-3 p-4">
              <Link to="/yazilar/$slug" params={{ slug: y.slug }} className="min-w-0 flex-1 font-bold hover:text-turuncu-acik">{y.title}</Link>
              <span className="text-sm text-soluk">{y.author}</span>
              <button
                type="button"
                aria-pressed={y.featured === 1}
                onClick={async () => {
                  await yaziOneCikar({ data: { id: y.id, featured: y.featured !== 1 } });
                  await yenile();
                }}
                className={`min-h-10 rounded-lg px-3 text-sm font-extrabold ${y.featured ? "bg-turuncu text-white" : "border-2 border-white/25"}`}
              >
                {y.featured ? "Öne çıkarıldı" : "Öne çıkar"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await yaziDurumu({ data: { id: y.id, status: "reddedildi" } });
                  await yenile();
                }}
                className="min-h-10 rounded-lg px-3 text-sm font-bold text-soluk underline"
              >
                Yayından kaldır
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
