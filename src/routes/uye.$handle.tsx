import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { profilGetir, type TahtaOzet } from "@/lib/regen/api.functions";
import { DIZILISLER, takimKur, type Tahta } from "@/lib/regen/board";
import { HAZIR_KLASORLER, KLASORSUZ } from "@/lib/regen/profil";
import { tarihYaz } from "@/lib/regen/metin";
import { FormaAvatar, KapakBandi, SosyalBaglantilar } from "@/components/regen/profil-ogeler";
import { YaziKarti } from "@/components/regen/site";
import { TahtaSvg } from "@/components/regen/tahta-svg";

export const Route = createFileRoute("/uye/$handle")({
  loader: async ({ params }) => {
    const r = await profilGetir({ data: { handle: params.handle } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.profil.name} (@${loaderData.profil.handle}) | Regen` },
          { name: "description", content: loaderData.profil.bio || `${loaderData.profil.name} adlı üyenin Regen taktik odası.` },
          { property: "og:title", content: `${loaderData.profil.name} | Regen` },
        ]
      : [],
  }),
  component: UyeProfili,
});

function coz(s: string): Tahta | null {
  try {
    return JSON.parse(s) as Tahta;
  } catch {
    return null;
  }
}

function klasorleriSirala(tahtalar: TahtaOzet[]) {
  const gruplar = new Map<string, TahtaOzet[]>();
  for (const t of tahtalar) {
    const k = t.klasor.trim() || KLASORSUZ;
    gruplar.set(k, [...(gruplar.get(k) ?? []), t]);
  }
  const sira = (k: string) => {
    const i = HAZIR_KLASORLER.indexOf(k);
    if (i >= 0) return i;
    if (k === KLASORSUZ) return 1000;
    return 100;
  };
  return [...gruplar.entries()].sort((a, b) => sira(a[0]) - sira(b[0]) || a[0].localeCompare(b[0], "tr"));
}

function TahtaKarti({ t, benim, buyuk = false }: { t: TahtaOzet; benim: boolean; buyuk?: boolean }) {
  const tahta = coz(t.data);
  return (
    <article className="regen-cam group flex h-full flex-col overflow-hidden rounded-3xl">
      <Link to="/cizim/$id" params={{ id: t.id }} className="flex flex-1 flex-col">
        {tahta ? (
          <div className="pointer-events-none border-b border-white/10">
            <TahtaSvg tahta={tahta} baslik={t.title} />
          </div>
        ) : null}
        <div className={`flex flex-1 flex-col gap-2 ${buyuk ? "p-6" : "p-4"}`}>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-soluk">
            <span>{t.kind === "dizilis" ? `Diziliş ${tahta?.dizilis ?? ""}` : "Taktik çizim"}</span>
            {t.is_public ? null : <span className="rounded-full border border-white/20 px-2 py-0.5">yalnızca sen</span>}
          </div>
          <h3 className={`font-extrabold leading-snug group-hover:text-turuncu-acik ${buyuk ? "text-2xl" : "text-lg"}`}>{t.title}</h3>
          {t.notlar ? <p className="line-clamp-2 text-sm leading-relaxed text-soluk">{t.notlar}</p> : null}
        </div>
      </Link>
      {benim ? (
        <div className="border-t border-white/10 px-4 py-2 text-sm font-bold">
          <Link to="/tahta" search={{ duzenle: t.id }} className="text-turuncu-acik hover:underline">
            Düzenle
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function UyeProfili() {
  const { profil: p, benim, yazilar, tahtalar, begeniToplam } = Route.useLoaderData();
  const vitrin = tahtalar.filter((t) => t.sabit === 1).slice(0, 3);
  const klasorler = klasorleriSirala(tahtalar);
  const favoriDizilis = DIZILISLER[p.favori_dizilis] ? p.favori_dizilis : null;
  const favoriTahta: Tahta | null = favoriDizilis
    ? { v: 1, tur: "dizilis", dizilis: favoriDizilis, rakipDizilis: null, oyuncular: takimKur(favoriDizilis, "biz"), top: null, isaretler: [] }
    : null;
  const favoriler = [
    p.favori_takim ? { ad: "Tuttuğu takım", deger: p.favori_takim } : null,
    favoriDizilis ? { ad: "Favori diziliş", deger: favoriDizilis } : null,
    p.favori_oyuncu ? { ad: "Favori oyuncu", deger: p.favori_oyuncu } : null,
  ].filter((f): f is { ad: string; deger: string } => f !== null);

  return (
    <main className="pb-24">
      <section aria-labelledby="profil-adi">
        <div className="relative h-44 overflow-hidden md:h-60">
          <KapakBandi kapak={p.kapak} />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zemin to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative z-10 -mt-16 flex flex-wrap items-end gap-5">
            <FormaAvatar renk={p.renk} no={p.forma_no} isim={p.name} boyut={128} className="relative shrink-0 rounded-full shadow-2xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-1 pb-2">
              <h1 id="profil-adi" className="break-words text-3xl font-black leading-tight tracking-tight md:text-5xl">{p.name}</h1>
              <p className="text-soluk">
                @{p.handle}
                {p.konum ? ` · ${p.konum}` : ""} · {tarihYaz(p.created_at)} tarihinden beri üye
                {p.role === "admin" ? " · Regen" : ""}
              </p>
            </div>
            {benim ? (
              <div className="flex flex-wrap gap-3 pb-2">
                <Link to="/ayarlar" className="regen-cta-beyaz inline-flex min-h-11 items-center rounded-full px-5 font-extrabold">
                  Profili düzenle
                </Link>
                <Link to="/tahta" search={{}} className="regen-cta-kesikli inline-flex min-h-11 items-center px-5 font-extrabold">
                  Yeni çizim
                </Link>
              </div>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-5">
              {p.bio ? <p className="max-w-[65ch] whitespace-pre-line text-lg leading-relaxed text-white/90">{p.bio}</p> : null}
              {favoriler.length ? (
                <ul className="flex flex-wrap gap-2">
                  {favoriler.map((f) => (
                    <li key={f.ad} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
                      <span className="block text-xs font-bold text-soluk">{f.ad}</span>
                      <span className="font-extrabold">{f.deger}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <SosyalBaglantilar p={p} />
              {!p.bio && !favoriler.length && benim ? (
                <p className="text-soluk">
                  Profilin henüz boş.{" "}
                  <Link to="/ayarlar" className="font-bold text-turuncu-acik underline underline-offset-4">Kendini tanıt</Link>, tuttuğun takımı ve favori dizilişini ekle.
                </p>
              ) : null}
            </div>
            <dl className="regen-cam grid grid-cols-3 self-start rounded-3xl text-center">
              <div className="p-5">
                <dt className="text-xs font-bold text-soluk">Yazı</dt>
                <dd className="text-3xl font-black">{yazilar.length}</dd>
              </div>
              <div className="border-x border-white/10 p-5">
                <dt className="text-xs font-bold text-soluk">Çizim</dt>
                <dd className="text-3xl font-black">{tahtalar.length}</dd>
              </div>
              <div className="p-5">
                <dt className="text-xs font-bold text-soluk">Beğeni</dt>
                <dd className="text-3xl font-black">{begeniToplam}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {vitrin.length || favoriTahta ? (
        <section aria-labelledby="vitrin" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex flex-col gap-2">
            <h2 id="vitrin" className="text-3xl font-black">Vitrin</h2>
            <span aria-hidden="true" className="regen-karalama" />
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {favoriTahta ? (
              <article className="regen-kor flex flex-col overflow-hidden rounded-3xl">
                <div className="pointer-events-none">
                  <TahtaSvg tahta={favoriTahta} baslik={`Favori diziliş ${favoriDizilis}`} />
                </div>
                <div className="flex flex-col gap-1 p-6">
                  <span className="font-el text-xl font-bold text-white/90">favori diziliş</span>
                  <h3 className="text-2xl font-black">{favoriDizilis}</h3>
                </div>
              </article>
            ) : null}
            {vitrin.map((t) => (
              <TahtaKarti key={t.id} t={t} benim={benim} buyuk />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="taktik-odasi" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="mb-6 flex flex-col gap-2">
          <span className="font-el text-2xl font-bold text-turuncu-acik">planlar, dizilişler, notlar</span>
          <h2 id="taktik-odasi" className="text-3xl font-black md:text-4xl">Taktik odası</h2>
        </div>
        {klasorler.length === 0 ? (
          <div className="regen-cam flex flex-col items-start gap-4 rounded-3xl p-8">
            <p className="text-soluk">{benim ? "Henüz kaydettiğin bir çizim yok." : "Henüz paylaşılan bir çizim yok."}</p>
            {benim ? (
              <div className="flex flex-wrap gap-3">
                <Link to="/dizilis" className="regen-parlak inline-flex min-h-11 items-center rounded-full px-5 font-extrabold">Diziliş kur</Link>
                <Link to="/tahta" search={{}} className="regen-cta-kesikli inline-flex min-h-11 items-center px-5 font-extrabold">Tahtayı aç</Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {klasorler.map(([ad, liste]) => (
              <div key={ad}>
                <h3 className="mb-4 flex items-baseline gap-3 text-xl font-black">
                  {ad}
                  <span className="text-sm font-bold text-soluk">{liste.length}</span>
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {liste.map((t) => (
                    <TahtaKarti key={t.id} t={t} benim={benim} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="uye-yazilari" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <h2 id="uye-yazilari" className="mb-6 text-3xl font-black">Yazılar</h2>
        {yazilar.length === 0 ? (
          <p className="regen-cam rounded-3xl p-8 text-soluk">Henüz yayında bir yazı yok.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {yazilar.map((y) => (
              <YaziKarti key={y.id} y={y} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
