import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { tahtaGetir } from "@/lib/regen/api.functions";
import { TahtaSvg } from "@/components/regen/tahta-svg";
import { tarihYaz } from "@/lib/regen/metin";

export const Route = createFileRoute("/cizim/$id")({
  loader: async ({ params }) => {
    const r = await tahtaGetir({ data: { id: params.id } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.title} | Regen` }, { property: "og:title", content: loaderData.title }] : [],
  }),
  component: Cizim,
});

function Cizim() {
  const c = Route.useLoaderData();
  const oyuncuNotlari = c.tahta.oyuncular.filter((o) => o.not);
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 flex flex-col gap-3">
        <span className="font-el text-2xl font-bold text-turuncu-acik">
          {c.tahta.tur === "dizilis" ? `diziliş ${c.tahta.dizilis}` : "taktik çizim"}
        </span>
        <h1 className="text-4xl font-black leading-tight md:text-5xl">{c.title}</h1>
        <p className="text-soluk">
          {c.authorHandle ? (
            <Link to="/uye/$handle" params={{ handle: c.authorHandle }} className="font-bold text-yazi hover:text-turuncu-acik">
              {c.author}
            </Link>
          ) : (
            <span className="font-bold text-yazi">{c.author}</span>
          )}{" "}
          · {c.klasor ? `${c.klasor} · ` : ""}
          {tarihYaz(c.updated_at)}
          {!c.isPublic ? " · yalnızca sen görüyorsun" : ""}
        </p>
      </header>
      <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-white/10">
        <TahtaSvg tahta={c.tahta} baslik={c.title} />
      </div>
      {c.notlar || oyuncuNotlari.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {c.notlar ? (
            <section aria-labelledby="notlar" className="regen-cam rounded-3xl p-6">
              <h2 id="notlar" className="mb-3 text-xl font-black">Notlar</h2>
              <p className="whitespace-pre-line leading-relaxed text-white/90">{c.notlar}</p>
            </section>
          ) : null}
          {oyuncuNotlari.length ? (
            <section aria-labelledby="oyuncu-notlari" className="regen-cam rounded-3xl p-6">
              <h2 id="oyuncu-notlari" className="mb-3 text-xl font-black">Oyuncu notları</h2>
              <ul className="flex flex-col gap-3">
                {oyuncuNotlari.map((o) => (
                  <li key={o.id} className="flex gap-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                        o.takim === "rakip" || o.takim === "rakip_kaleci" ? "bg-white text-zemin" : "bg-turuncu text-white"
                      }`}
                    >
                      {o.no}
                    </span>
                    <span className="leading-relaxed">
                      {o.ad ? <strong className="font-el text-lg">{o.ad}: </strong> : null}
                      <span className="text-white/90">{o.not}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {c.benim ? (
          <>
            <Link to="/tahta" search={{ duzenle: c.id }} className="rounded-lg bg-white px-5 py-3 font-extrabold text-zemin">Düzenle</Link>
            <Link to="/yaz" search={{ cizim: c.id }} className="regen-parlak rounded-full px-5 py-3 font-extrabold text-white">Bununla yazı yaz</Link>
          </>
        ) : (
          <Link to={c.tahta.tur === "dizilis" ? "/dizilis" : "/tahta"} search={{}} className="regen-parlak rounded-full px-5 py-3 font-extrabold text-white">
            Sen de çiz
          </Link>
        )}
      </div>
    </main>
  );
}
