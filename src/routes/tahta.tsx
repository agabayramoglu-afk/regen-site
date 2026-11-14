import { createFileRoute, useRouteContext } from "@tanstack/react-router";

import { tahtaGetir, tahtaKaydet } from "@/lib/regen/api.functions";
import { SayfaBasligi } from "@/components/regen/site";
import { TahtaEditor } from "@/components/regen/tahta-editor";

export const Route = createFileRoute("/tahta")({
  validateSearch: (s: Record<string, unknown>): { duzenle?: string } => ({
    duzenle: typeof s.duzenle === "string" && s.duzenle ? s.duzenle : undefined,
  }),
  loaderDeps: ({ search }) => ({ duzenle: search.duzenle }),
  loader: async ({ deps }) => {
    if (!deps.duzenle) return { kayit: null };
    const r = await tahtaGetir({ data: { id: deps.duzenle } });
    return { kayit: r && r.benim ? r : null };
  },
  head: () => ({
    meta: [{ title: "Taktik tahta | Regen" }, { name: "description", content: "Pas, koşu, pres ve boş alanları Regen'in çizim diliyle sahada anlat." }],
  }),
  component: TaktikTahta,
});

function TaktikTahta() {
  const { user } = useRouteContext({ from: "__root__" });
  const { kayit } = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6">
      <SayfaBasligi
        ust="turuncu biziz, siyah rakip"
        baslik="Taktik tahta"
        alt="Aracı seç, sahada sürükle. Pas düz turuncu, topsuz koşu kesikli turuncu, rakibin hareketi kesikli siyah."
      />
      <div className="mt-10">
        <TahtaEditor
          key={kayit?.id ?? "yeni"}
          tur={kayit?.tahta.tur ?? "taktik"}
          baslangic={kayit?.tahta ?? null}
          baslangicBaslik={kayit?.title}
          baslangicId={kayit?.id ?? null}
          girisli={!!user}
          kaydet={(d) => tahtaKaydet({ data: d })}
        />
      </div>
    </main>
  );
}
