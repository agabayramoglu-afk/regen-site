import { useState, type ReactNode } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { profilAyarlari, profilKaydet } from "@/lib/regen/api.functions";
import { DIZILIS_ADLARI } from "@/lib/regen/board";
import { FORMA_RENKLERI, KAPAKLAR } from "@/lib/regen/profil";
import { FormaAvatar, KapakBandi } from "@/components/regen/profil-ogeler";
import { SayfaBasligi } from "@/components/regen/site";

export const Route = createFileRoute("/ayarlar")({
  loader: () => profilAyarlari(),
  head: () => ({ meta: [{ title: "Profili düzenle | Regen" }, { name: "robots", content: "noindex" }] }),
  component: Ayarlar,
});

const alanSinifi = "h-12 rounded-lg border border-white/15 bg-yuzey2 px-4 font-semibold text-yazi";

function Alan({ id, etiket, ipucu, children }: { id: string; etiket: string; ipucu?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold">{etiket}</label>
      {children}
      {ipucu ? <p className="text-xs text-soluk">{ipucu}</p> : null}
    </div>
  );
}

function Ayarlar() {
  const p = Route.useLoaderData();
  const router = useRouter();
  const [f, setF] = useState(() => ({
    name: p?.name ?? "",
    handle: p?.handle ?? "",
    bio: p?.bio ?? "",
    konum: p?.konum ?? "",
    favori_takim: p?.favori_takim ?? "",
    favori_dizilis: p?.favori_dizilis ?? "",
    favori_oyuncu: p?.favori_oyuncu ?? "",
    renk: p?.renk ?? "turuncu",
    forma_no: p?.forma_no ?? "",
    kapak: p?.kapak ?? "kor",
    instagram: p?.instagram ?? "",
    x_hesabi: p?.x_hesabi ?? "",
    youtube: p?.youtube ?? "",
  }));
  const [hata, setHata] = useState<string | null>(null);
  const [bekle, setBekle] = useState(false);

  if (!p) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
        <SayfaBasligi baslik="Profili düzenle" alt="Profilini düzenlemek için giriş yapmalısın." />
        <Link to="/giris" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 font-extrabold text-zemin">Giriş</Link>
      </main>
    );
  }

  const degis = (alan: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [alan]: e.target.value }));

  const kaydet = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setHata(null);
    setBekle(true);
    try {
      const r = await profilKaydet({ data: f });
      await router.invalidate();
      await router.navigate({ to: "/uye/$handle", params: { handle: r.handle } });
    } catch (err) {
      const m = err instanceof Error ? err.message : "Kaydedilemedi.";
      setHata(m.startsWith("[") ? "Bazı alanlar geçersiz. Kullanıcı adını ve sosyal medya adlarını kontrol et." : m);
      setBekle(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
      <SayfaBasligi ust="kendi köşen" baslik="Profili düzenle" alt="Forma rengini, kapağını ve taktik kimliğini seç. Profilin herkese açık." />

      <div className="regen-cam relative mt-10 overflow-hidden rounded-3xl">
        <div className="relative h-36">
          <KapakBandi kapak={f.kapak} />
        </div>
        <div className="relative z-10 -mt-12 flex items-end gap-4 px-6 pb-6">
          <FormaAvatar renk={f.renk} no={f.forma_no} isim={f.name || "Regen"} boyut={104} className="relative rounded-full shadow-2xl" />
          <div className="pb-1">
            <p className="text-2xl font-black">{f.name || "İsmin"}</p>
            <p className="text-soluk">@{f.handle || "kullanici_adi"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={kaydet} className="mt-10 flex flex-col gap-10">
        <fieldset className="grid gap-5 md:grid-cols-2">
          <legend className="mb-4 text-xl font-black">Kimlik</legend>
          <Alan id="ad" etiket="Görünen isim">
            <input id="ad" value={f.name} onChange={degis("name")} maxLength={40} required className={alanSinifi} />
          </Alan>
          <Alan id="handle" etiket="Kullanıcı adı" ipucu="Profil adresin: /uye/kullanici_adi. Küçük harf, rakam ve alt çizgi.">
            <input id="handle" value={f.handle} onChange={(e) => setF((x) => ({ ...x, handle: e.target.value.toLowerCase() }))} maxLength={24} required className={alanSinifi} />
          </Alan>
          <div className="md:col-span-2">
            <Alan id="bio" etiket="Hakkında" ipucu="En fazla 400 karakter.">
              <textarea id="bio" value={f.bio} onChange={degis("bio")} maxLength={400} rows={4} placeholder="Futbolu nasıl izliyorsun, neyi analiz etmeyi seviyorsun?" className="rounded-lg border border-white/15 bg-yuzey2 p-4 text-yazi" />
            </Alan>
          </div>
          <Alan id="konum" etiket="Şehir">
            <input id="konum" value={f.konum} onChange={degis("konum")} maxLength={40} placeholder="Örn. İstanbul" className={alanSinifi} />
          </Alan>
        </fieldset>

        <fieldset className="grid gap-5 md:grid-cols-3">
          <legend className="mb-4 text-xl font-black">Futbol kimliği</legend>
          <Alan id="takim" etiket="Tuttuğun takım">
            <input id="takim" value={f.favori_takim} onChange={degis("favori_takim")} maxLength={40} className={alanSinifi} />
          </Alan>
          <Alan id="dizilis" etiket="Favori diziliş" ipucu="Profilinin vitrininde sahada gösterilir.">
            <select id="dizilis" value={f.favori_dizilis} onChange={degis("favori_dizilis")} className={alanSinifi}>
              <option value="">Seçilmedi</option>
              {DIZILIS_ADLARI.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Alan>
          <Alan id="oyuncu" etiket="Favori oyuncu">
            <input id="oyuncu" value={f.favori_oyuncu} onChange={degis("favori_oyuncu")} maxLength={40} className={alanSinifi} />
          </Alan>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-xl font-black">Forma</legend>
          <div className="flex flex-wrap items-end gap-6">
            <div role="radiogroup" aria-label="Forma rengi" className="flex flex-wrap gap-2">
              {FORMA_RENKLERI.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={f.renk === r.id}
                  aria-label={r.ad}
                  title={r.ad}
                  onClick={() => setF((x) => ({ ...x, renk: r.id }))}
                  className={`rounded-full p-1 transition-transform active:scale-95 ${f.renk === r.id ? "ring-2 ring-turuncu-acik" : "ring-1 ring-white/15"}`}
                >
                  <FormaAvatar renk={r.id} no={f.forma_no} isim={f.name || "R"} boyut={52} />
                </button>
              ))}
            </div>
            <div className="w-32">
              <Alan id="forma-no" etiket="Forma numarası" ipucu="Boş kalırsa baş harflerin yazar.">
                <input id="forma-no" value={f.forma_no} onChange={(e) => setF((x) => ({ ...x, forma_no: e.target.value.replace(/\D/g, "").slice(0, 2) }))} inputMode="numeric" className={alanSinifi} />
              </Alan>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 text-xl font-black">Kapak</legend>
          <div role="radiogroup" aria-label="Kapak" className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {KAPAKLAR.map((k) => (
              <button
                key={k.id}
                type="button"
                role="radio"
                aria-checked={f.kapak === k.id}
                onClick={() => setF((x) => ({ ...x, kapak: k.id }))}
                className={`overflow-hidden rounded-2xl text-left ${f.kapak === k.id ? "ring-2 ring-turuncu-acik" : "ring-1 ring-white/15"}`}
              >
                <span className="relative block h-20">
                  <KapakBandi kapak={k.id} />
                </span>
                <span className="block bg-yuzey px-3 py-2 text-sm font-bold">{k.ad}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-5 md:grid-cols-3">
          <legend className="mb-4 text-xl font-black">Sosyal medya</legend>
          <Alan id="ig" etiket="Instagram kullanıcı adı">
            <input id="ig" value={f.instagram} onChange={degis("instagram")} maxLength={60} placeholder="kullaniciadi" className={alanSinifi} />
          </Alan>
          <Alan id="x" etiket="X kullanıcı adı">
            <input id="x" value={f.x_hesabi} onChange={degis("x_hesabi")} maxLength={60} placeholder="kullaniciadi" className={alanSinifi} />
          </Alan>
          <Alan id="yt" etiket="YouTube kanal adı">
            <input id="yt" value={f.youtube} onChange={degis("youtube")} maxLength={60} placeholder="kanaladi" className={alanSinifi} />
          </Alan>
        </fieldset>

        {hata ? <p role="alert" className="font-bold text-turuncu-acik">{hata}</p> : null}

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={bekle} className="regen-parlak min-h-12 rounded-full px-8 text-lg font-extrabold disabled:opacity-60">
            {bekle ? "Kaydediliyor" : "Profili kaydet"}
          </button>
          <Link to="/uye/$handle" params={{ handle: p.handle }} className="font-bold text-soluk hover:text-white">
            Vazgeç
          </Link>
        </div>
      </form>
    </main>
  );
}
