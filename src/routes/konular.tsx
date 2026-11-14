import { createFileRoute, Link } from "@tanstack/react-router";

import { konulariGetir } from "@/lib/regen/api.functions";
import { SayfaBasligi } from "@/components/regen/site";

export const Route = createFileRoute("/konular")({
  loader: () => konulariGetir(),
  head: () => ({ meta: [{ title: "Konular | Regen" }, { name: "description", content: "Yazıya açık kategoriler ve haftanın konuları." }] }),
  component: Konular,
});

function Konular() {
  const { konular } = Route.useLoaderData();
  const haftalik = konular.filter((k) => k.kind === "konu");
  const kategoriler = konular.filter((k) => k.kind === "kategori");

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6">
      <SayfaBasligi ust="ne yazsam?" baslik="Konular" alt="Yazılar bu başlıkların altında toplanır. Haftanın konuları Regen tarafından açılır ve süresi bitince kapanır." />

      <section aria-labelledby="haftalik" className="mt-14">
        <h2 id="haftalik" className="mb-6 text-2xl font-black">Haftanın konuları</h2>
        {haftalik.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-white/15 p-8 text-soluk">Şu an açık bir haftalık konu yok. Kategorilere yazabilirsin.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {haftalik.map((k) => (
              <li key={k.id} className="flex flex-col gap-4 regen-kor rounded-3xl p-7 text-white md:flex-row md:items-center">
                <div className="flex flex-1 flex-col gap-2">
                  <span className="text-2xl font-black leading-tight">{k.title}</span>
                  {k.description ? <span className="max-w-[60ch] leading-relaxed text-white/90">{k.description}</span> : null}
                  <span className="text-sm font-bold">{k.yazi_sayisi} yazı</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/yazilar" search={{ konu: k.slug }} className="flex min-h-11 items-center rounded-lg border-2 border-white px-4 font-extrabold">Oku</Link>
                  <Link to="/yaz" search={{ konu: k.id }} className="flex min-h-11 items-center rounded-lg bg-white px-4 font-extrabold text-zemin">Yazı yaz</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="kategoriler" className="mt-16">
        <h2 id="kategoriler" className="mb-6 text-2xl font-black">Kategoriler</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {kategoriler.map((k) => (
            <li key={k.id}>
              <Link to="/yazilar" search={{ konu: k.slug }} className="group flex h-full flex-col gap-2 rounded-2xl border-2 border-white/25 bg-yuzey p-6">
                <span className="text-xl font-black group-hover:text-turuncu-acik">{k.title}</span>
                <span className="leading-relaxed text-soluk">{k.description}</span>
                <span className="mt-auto pt-2 text-sm font-bold">{k.yazi_sayisi} yazı</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
