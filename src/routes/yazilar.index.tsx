import { createFileRoute, Link } from "@tanstack/react-router";

import { yazilariListele } from "@/lib/regen/api.functions";
import { SayfaBasligi, YaziKarti } from "@/components/regen/site";

export const Route = createFileRoute("/yazilar/")({
  validateSearch: (s: Record<string, unknown>): { konu?: string } => ({
    konu: typeof s.konu === "string" && s.konu ? s.konu : undefined,
  }),
  loaderDeps: ({ search }) => ({ konu: search.konu }),
  loader: ({ deps }) => yazilariListele({ data: { konu: deps.konu } }),
  head: () => ({
    meta: [{ title: "Yazılar | Regen" }, { name: "description", content: "Regen topluluğunun taktik ve psikoloji yazıları." }],
  }),
  component: Yazilar,
});

function Yazilar() {
  const { yazilar, konular, secili } = Route.useLoaderData();
  const filtre = "flex min-h-11 items-center rounded-full border-2 px-4 text-sm font-extrabold";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6">
      <SayfaBasligi
        ust={secili ? (secili.kind === "konu" ? "haftanın konusu" : "kategori") : "defter"}
        baslik={secili ? secili.title : "Yazılar"}
        alt={secili?.description || "Takipçilerin yazdığı, Regen'in onayladığı taktik ve psikoloji yazıları."}
      />

      <nav aria-label="Konuya göre süz" className="mt-10 flex flex-wrap gap-2">
        <Link
          to="/yazilar"
          search={{}}
          className={`${filtre} ${!secili ? "border-white bg-white text-zemin" : "border-white/15 hover:border-white/60"}`}
        >
          Tümü
        </Link>
        {konular.map((k) => (
          <Link
            key={k.id}
            to="/yazilar"
            search={{ konu: k.slug }}
            className={`${filtre} ${
              secili?.id === k.id
                ? k.kind === "konu"
                  ? "border-turuncu bg-turuncu text-white"
                  : "border-white bg-white text-zemin"
                : "border-white/15 hover:border-white/60"
            }`}
          >
            {k.title}
          </Link>
        ))}
      </nav>

      {yazilar.length === 0 ? (
        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border-2 border-dashed border-white/15 p-10">
          <p className="font-el text-3xl font-bold text-turuncu-acik">burada henüz yazı yok</p>
          <p className="max-w-[55ch] text-lg text-soluk">Bu konuya ilk yazan sen ol. Onaylandığında burada görünür.</p>
          <Link to="/yaz" search={secili ? { konu: secili.id } : {}} className="regen-parlak rounded-full px-5 py-3 font-extrabold text-white">
            Yazı yaz
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {yazilar.map((y) => (
            <YaziKarti key={y.id} y={y} />
          ))}
        </div>
      )}
    </main>
  );
}
