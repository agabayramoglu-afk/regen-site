import { createFileRoute, Link } from "@tanstack/react-router";

import { profilVerisi } from "@/lib/regen/api.functions";
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
      <SayfaBasligi ust={uye.role === "admin" ? "yönetici" : "üye"} baslik={uye.name} />

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
                <li key={t.id}>
                  <Link to="/cizim/$id" params={{ id: t.id }} className="group flex flex-col overflow-hidden rounded-2xl bg-yuzey">
                    {tahta ? <div className="pointer-events-none"><TahtaSvg tahta={tahta} baslik={t.title} /></div> : null}
                    <span className="flex items-center gap-2 p-4">
                      <span className="flex-1 font-extrabold group-hover:text-turuncu-acik">{t.title}</span>
                      <span className="text-sm text-soluk">{t.kind === "dizilis" ? "Diziliş" : "Taktik"}{t.is_public ? "" : " · gizli"}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
