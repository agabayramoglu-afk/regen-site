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
  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 flex flex-col gap-3">
        <span className="font-el text-2xl font-bold text-turuncu-acik">
          {c.tahta.tur === "dizilis" ? `diziliş ${c.tahta.dizilis}` : "taktik çizim"}
        </span>
        <h1 className="text-4xl font-black leading-tight md:text-5xl">{c.title}</h1>
        <p className="text-soluk">
          <span className="font-bold text-yazi">{c.author}</span> · {tarihYaz(c.updated_at)}
          {!c.isPublic ? " · yalnızca sen görüyorsun" : ""}
        </p>
      </header>
      <div className="overflow-hidden rounded-2xl shadow-xl">
        <TahtaSvg tahta={c.tahta} baslik={c.title} />
      </div>
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
