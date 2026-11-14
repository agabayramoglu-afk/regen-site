import { createElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { ScrollScrub, type ScrollScrubScene } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";
import { anaSayfaVerisi } from "@/lib/regen/api.functions";
import { KonuEtiketi, YaziKarti } from "@/components/regen/site";
import { TahtaSvg } from "@/components/regen/tahta-svg";
import { ORNEK_DIZILIS, ORNEK_TAHTA } from "@/components/regen/ornek-tahta";

export const Route = createFileRoute("/")({
  loader: () => anaSayfaVerisi(),
  component: Index,
});

function UyeOlCta() {
  return (
    <Link to="/kayit" className="regen-parlak inline-flex min-h-12 items-center rounded-full px-7 text-base font-extrabold">
      Üye ol
    </Link>
  );
}

function DizilisCta() {
  return (
    <Link to="/dizilis" className="regen-cta-beyaz inline-flex min-h-12 items-center rounded-full px-7 text-base font-extrabold">
      Diziliş kur
    </Link>
  );
}

function TahtaCta() {
  return (
    <Link to="/tahta" search={{}} className="regen-cta-kesikli inline-flex min-h-12 items-center px-7 text-base font-extrabold">
      Tahtayı aç
    </Link>
  );
}

function YazCta() {
  return (
    <Link to="/yaz" search={{}} className="group inline-flex min-h-12 items-center gap-2 font-el text-3xl font-bold text-turuncu-acik">
      Yazı yaz
      <svg width="46" height="22" viewBox="0 0 46 22" aria-hidden="true" className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
        <path d="M2 13 C 14 6, 26 16, 40 10" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M33 4 L 41 10 L 33 16" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

const CTALAR = [UyeOlCta, DizilisCta, TahtaCta, YazCta];

// Modül sabiti: sahnelere bölüm butonlarını ekler, kimliği her çizimde aynı kalır.
const SAHNELER: ScrollScrubScene[] = scrollScrubScenes.map((s, i) => ({
  ...s,
  actions: createElement(CTALAR[i] ?? UyeOlCta),
}));

function Index() {
  const { yazilar, konular } = Route.useLoaderData();
  const [ilk, ...diger] = yazilar;
  const haftalik = konular.filter((k) => k.kind === "konu");
  const kategoriler = konular.filter((k) => k.kind === "kategori");
  const haftaninKonusu = haftalik[0] ?? null;

  return (
    <main>
      <ScrollScrub className="regen-yolculuk" scenes={SAHNELER} theme={scrollScrubTheme} />

      <section aria-labelledby="araclar" className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6">
        <div className="mb-10 flex flex-col gap-3">
          <span className="font-el text-2xl font-bold text-turuncu-acik">videodaki çizim dili, senin elinde</span>
          <h2 id="araclar" className="max-w-[18ch] text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">Çiz, kaydet, yazına ekle</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-6 md:grid-rows-[auto_auto]">
          <Link to="/tahta" search={{}} className="regen-cam group flex flex-col overflow-hidden rounded-3xl md:col-span-4">
            <div className="pointer-events-none border-b border-white/10">
              <TahtaSvg tahta={ORNEK_TAHTA} baslik="Örnek taktik çizim: turuncu 10 numara rakip orta sahanın arasında" />
            </div>
            <div className="flex flex-col gap-2 p-6">
              <h3 className="text-2xl font-black group-hover:text-turuncu-acik">Taktik tahta</h3>
              <p className="max-w-[55ch] leading-relaxed text-soluk">Düz turuncu ok pas, kesikli ok topsuz koşu, siyah ok rakibin hareketi. Çember, alan, etiket ve kararsızlık işareti.</p>
            </div>
          </Link>

          <div className="regen-kor flex flex-col justify-between gap-8 rounded-3xl p-7 md:col-span-2">
            <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-3xl font-black leading-tight">Üye ol, defterine yaz</h3>
              <p className="leading-relaxed text-white/90">Yazıların Regen onayıyla yayına girer. Çizimlerin profilinde saklanır.</p>
              <Link to="/kayit" className="mt-2 inline-flex min-h-12 items-center self-start rounded-full bg-white px-6 font-extrabold text-zemin transition-transform active:translate-y-px">
                Hesap aç
              </Link>
            </div>
          </div>

          <Link to="/dizilis" className="regen-cam group flex flex-col overflow-hidden rounded-3xl md:col-span-3">
            <div className="pointer-events-none border-b border-white/10">
              <TahtaSvg tahta={ORNEK_DIZILIS} baslik="Örnek diziliş: 4-2-3-1" />
            </div>
            <div className="flex flex-col gap-2 p-6">
              <h3 className="text-2xl font-black group-hover:text-turuncu-acik">Diziliş kurucu</h3>
              <p className="leading-relaxed text-soluk">7 hazır şablon. Oyuncuları sürükle, numara ve isim yaz, görsel olarak indir.</p>
            </div>
          </Link>

          <Link
            to="/konular"
            className="regen-cam group relative flex flex-col justify-end gap-3 overflow-hidden rounded-3xl p-7 md:col-span-3"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-turuncu/25 blur-3xl" />
            <span className="relative font-el text-2xl font-bold text-turuncu-acik">haftanın konusu</span>
            <h3 className="relative text-3xl font-black leading-tight group-hover:text-turuncu-acik">
              {haftaninKonusu ? haftaninKonusu.title : "Her hafta yeni bir konu açılır"}
            </h3>
            <p className="relative max-w-[48ch] leading-relaxed text-soluk">
              {haftaninKonusu?.description || "Regen bir maç, bir oyuncu ya da bir psikolojik an seçer; takipçiler kendi analizini yazar."}
            </p>
          </Link>
        </div>
      </section>

      <section aria-labelledby="son-yazilar" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-col gap-3">
          <h2 id="son-yazilar" className="text-4xl font-black tracking-tight md:text-5xl">Topluluktan yazılar</h2>
          <span aria-hidden="true" className="regen-karalama" />
        </div>
        {ilk ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <YaziKarti y={ilk} buyuk />
            <ul className="regen-cam flex flex-col divide-y divide-white/10 rounded-3xl">
              {diger.length === 0 ? (
                <li className="p-6 text-soluk">Yeni yazılar onaylandıkça burada görünecek.</li>
              ) : (
                diger.map((y) => (
                  <li key={y.id}>
                    <Link to="/yazilar/$slug" params={{ slug: y.slug }} className="group flex flex-col gap-2 p-6">
                      <span><KonuEtiketi baslik={y.topic_title} tur={y.topic_kind} /></span>
                      <span className="text-lg font-extrabold leading-snug group-hover:text-turuncu-acik">{y.title}</span>
                      <span className="text-sm text-soluk">{y.author} · {y.begeni} beğeni</span>
                    </Link>
                  </li>
                ))
              )}
              <li>
                <Link to="/yazilar" search={{}} className="flex min-h-14 items-center px-6 font-extrabold text-turuncu-acik">
                  Tüm yazılar
                </Link>
              </li>
            </ul>
          </div>
        ) : (
          <div className="regen-cam flex flex-col items-start gap-4 rounded-3xl p-10">
            <p className="font-el text-3xl font-bold text-turuncu-acik">defter henüz boş</p>
            <p className="max-w-[55ch] text-lg text-soluk">İlk yazılar onaylandığında burada olacak. Bir konu seç, dizilişini çiz ve yazmaya başla.</p>
          </div>
        )}
      </section>

      <section aria-labelledby="acik-konular" className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 id="acik-konular" className="text-3xl font-black md:text-4xl">Yazıya açık konular</h2>
          <p className="mt-3 max-w-[60ch] text-soluk">Her hafta yeni bir konu açılır. Kategoriler her zaman açık.</p>
        </div>
        <ul className="mx-auto mt-8 flex max-w-7xl snap-x gap-4 overflow-x-auto px-4 pb-4 sm:px-6">
          {[...haftalik, ...kategoriler].map((k) => (
            <li key={k.id} className="w-72 shrink-0 snap-start">
              <Link
                to="/yazilar"
                search={{ konu: k.slug }}
                className={`flex h-full flex-col gap-3 rounded-3xl p-6 transition-transform hover:-translate-y-1 motion-reduce:transition-none ${
                  k.kind === "konu" ? "regen-kor" : "regen-cam"
                }`}
              >
                <span className={`font-el text-xl font-bold ${k.kind === "konu" ? "text-white/90" : "text-turuncu-acik"}`}>
                  {k.kind === "konu" ? "haftanın konusu" : "kategori"}
                </span>
                <span className="text-xl font-black leading-tight">{k.title}</span>
                {k.description ? <span className={`text-sm leading-relaxed ${k.kind === "konu" ? "text-white/90" : "text-soluk"}`}>{k.description}</span> : null}
                <span className="mt-auto pt-2 text-sm font-bold">{k.yazi_sayisi} yazı</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
