import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { profilVerisi, tahtaSil, tahtaVitrin } from "@/lib/regen/api.functions";
import { FormaAvatar } from "@/components/regen/profil-ogeler";
import { KLASORSUZ } from "@/lib/regen/profil";
import { KonuEtiketi, SayfaBasligi } from "@/components/regen/site";
import { TahtaSvg } from "@/components/regen/tahta-svg";
import type { Tahta } from "@/lib/regen/board";
import { tarihYaz } from "@/lib/regen/metin";

export const Route = createFileRoute("/profil")({
  loader: () => profilVerisi(),
  head: () => ({ meta: [{ title: "Profilim | Regen" }] }),
  component: Profil,
});

const DURUM: Record<string, string> = { beklemede: "Onay bekliyor", yayinda: "Yayında", reddedildi: "Yayına alınmadı" };

function coz(s: string): Tahta | null {
  try {
    return JSON.parse(s) as Tahta;
  } catch {
    return null;
  }
}

function Profil() {
  const veri = Route.useLoaderData();
  const router = useRouter();
  if (!veri) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
        <SayfaBasligi baslik="Profilim" alt="Profilini görmek için giriş yapmalısın." />
        <Link to="/giris" className="mt-8 inline-flex rounded-lg bg-white px-5 py-3 font-extrabold text-zemin">Giriş</Link>
      </main>
    );
  }
  const { uye, yazilar, tahtalar } = veri;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6">
      <div className="flex flex-wrap items-center gap-6">
        <FormaAvatar renk={uye.renk} no={uye.forma_no} isim={uye.name} boyut={96} className="rounded-full" />
        <div className="min-w-0 flex-1">
          <SayfaBasligi ust={uye.role === "admin" ? "yönetici" : "üye"} baslik={uye.name} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/uye/$handle" params={{ handle: uye.handle }} className="regen-cta-beyaz inline-flex min-h-11 items-center rounded-full px-5 font-extrabold">
            Profilimi gör
          </Link>
          <Link to="/ayarlar" className="regen-cta-kesikli inline-flex min-h-11 items-center px-5 font-extrabold">
            Profili düzenle
          </Link>
        </div>
      </div>

      <section aria-labelledby="yazilarim" className="mt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="yazilarim" className="text-2xl font-black">Yazılarım</h2>
          <Link to="/yaz" search={{}} className="regen-parlak rounded-full px-4 py-2.5 font-extrabold text-white">Yazı yaz</Link>
        </div>
        {yazilar.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-white/15 p-8 text-soluk">Henüz yazın yok.</p>
        ) : (
          <ul className="divide-y-2 divide-white/10 rounded-2xl bg-yuzey">
            {yazilar.map((y) => (
              <li key={y.id}>
                <Link to="/yazilar/$slug" params={{ slug: y.slug }} className="flex flex-wrap items-center gap-3 p-5">
                  <KonuEtiketi baslik={y.topic_title} tur={y.topic_kind} />
                  <span className="min-w-0 flex-1 font-extrabold">{y.title}</span>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${y.status === "yayinda" ? "bg-white text-zemin" : "border-2 border-white/25"}`}>
                    {DURUM[y.status] ?? y.status}
                  </span>
                  <span className="text-sm text-soluk">{tarihYaz(y.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="cizimlerim" className="mt-16">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="cizimlerim" className="text-2xl font-black">Çizimlerim</h2>
          <div className="flex gap-4 font-extrabold">
            <Link to="/dizilis" className="underline decoration-turuncu decoration-2 underline-offset-4">Yeni diziliş</Link>
            <Link to="/tahta" search={{}} className="underline decoration-turuncu decoration-2 underline-offset-4">Yeni taktik</Link>
          </div>
        </div>
        {tahtalar.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-white/15 p-8 text-soluk">Kaydedilmiş çizimin yok.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tahtalar.map((t) => {
              const tahta = coz(t.data);
              return (
                <li key={t.id} className="regen-cam flex flex-col overflow-hidden rounded-3xl">
                  <Link to="/cizim/$id" params={{ id: t.id }} className="group flex flex-1 flex-col">
                    {tahta ? <div className="pointer-events-none"><TahtaSvg tahta={tahta} baslik={t.title} /></div> : null}
                    <span className="flex flex-col gap-1 p-4">
                      <span className="text-xs font-bold text-turuncu-acik">{t.klasor || KLASORSUZ}</span>
                      <span className="font-extrabold group-hover:text-turuncu-acik">{t.title}</span>
                      <span className="text-sm text-soluk">
                        {t.kind === "dizilis" ? "Diziliş" : "Taktik"}
                        {t.is_public ? "" : " · gizli"}
                        {t.sabit ? " · vitrinde" : ""}
                      </span>
                    </span>
                  </Link>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/10 px-4 py-2 text-sm font-bold">
                    <Link to="/tahta" search={{ duzenle: t.id }} className="text-turuncu-acik hover:underline">Düzenle</Link>
                    <button
                      type="button"
                      onClick={async () => {
                        await tahtaVitrin({ data: { id: t.id, sabit: !t.sabit } });
                        await router.invalidate();
                      }}
                      className="min-h-10 text-soluk hover:text-white"
                    >
                      {t.sabit ? "Vitrinden çıkar" : "Vitrine koy"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm(`"${t.title}" silinsin mi? Bu geri alınamaz.`)) return;
                        await tahtaSil({ data: { id: t.id } });
                        await router.invalidate();
                      }}
                      className="ml-auto min-h-10 text-soluk hover:text-white"
                    >
                      Sil
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
