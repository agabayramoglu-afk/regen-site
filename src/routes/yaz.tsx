import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { yaziGonder, yazmaVerisi } from "@/lib/regen/api.functions";
import { SayfaBasligi, YaziGovdesi } from "@/components/regen/site";

export const Route = createFileRoute("/yaz")({
  validateSearch: (s: Record<string, unknown>): { konu?: string; cizim?: string } => ({
    konu: typeof s.konu === "string" && s.konu ? s.konu : undefined,
    cizim: typeof s.cizim === "string" && s.cizim ? s.cizim : undefined,
  }),
  loader: () => yazmaVerisi(),
  head: () => ({ meta: [{ title: "Yazı yaz | Regen" }] }),
  component: Yaz,
});

function Yaz() {
  const veri = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [baslik, setBaslik] = useState("");
  const [konu, setKonu] = useState(search.konu ?? veri.konular.find((k) => k.kind === "konu")?.id ?? veri.konular[0]?.id ?? "");
  const [govde, setGovde] = useState("");
  const [cizim, setCizim] = useState<string>(search.cizim ?? "");
  const [onizleme, setOnizleme] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  if (!veri.girisli) {
    return (
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
        <SayfaBasligi ust="kalemini al" baslik="Yazı yaz" alt="Yazı göndermek için önce giriş yapmalısın." />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/giris" className="rounded-lg bg-white px-5 py-3 font-extrabold text-zemin">Giriş</Link>
          <Link to="/kayit" className="regen-parlak rounded-full px-5 py-3 font-extrabold text-white">Üye ol</Link>
        </div>
      </main>
    );
  }

  const gonder = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setHata(null);
    setGonderiliyor(true);
    try {
      const r = await yaziGonder({ data: { title: baslik, topicId: konu, body: govde, boardId: cizim || null } });
      await navigate({ to: "/yazilar/$slug", params: { slug: r.slug } });
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Yazı gönderilemedi.");
      setGonderiliyor(false);
    }
  };

  const karakter = govde.trim().length;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
      <SayfaBasligi
        ust="kalemini al"
        baslik="Yazı yaz"
        alt="Yazın önce Regen'e gider; onaylanınca yayına girer. Ara başlık için satırı ## ile, alıntı için > ile başlat."
      />

      <form onSubmit={gonder} className="mt-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="konu" className="font-bold">Konu</label>
          <select id="konu" value={konu} onChange={(e) => setKonu(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-3 font-semibold">
            {veri.konular.map((k) => (
              <option key={k.id} value={k.id}>
                {k.kind === "konu" ? `Haftanın konusu: ${k.title}` : k.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="baslik" className="font-bold">Başlık</label>
          <input id="baslik" value={baslik} maxLength={110} onChange={(e) => setBaslik(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-4 text-lg font-bold" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="cizim" className="font-bold">Çizim ekle</label>
          <select id="cizim" value={cizim} onChange={(e) => setCizim(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-3 font-semibold">
            <option value="">Çizim yok</option>
            {veri.tahtalar.map((t) => (
              <option key={t.id} value={t.id}>
                {t.kind === "dizilis" ? "Diziliş" : "Taktik"}: {t.title}
              </option>
            ))}
          </select>
          <p className="text-sm text-soluk">
            Önce <Link to="/dizilis" className="font-bold underline decoration-turuncu decoration-2 underline-offset-4">diziliş kurucuda</Link> ya da{" "}
            <Link to="/tahta" className="font-bold underline decoration-turuncu decoration-2 underline-offset-4">taktik tahtada</Link> çizip kaydet; burada listelenir.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="govde" className="font-bold">Yazı</label>
            <button type="button" onClick={() => setOnizleme((o) => !o)} className="min-h-10 text-sm font-bold underline decoration-turuncu decoration-2 underline-offset-4">
              {onizleme ? "Düzenle" : "Önizle"}
            </button>
          </div>
          {onizleme ? (
            <div className="min-h-80 rounded-xl bg-yuzey p-6">
              <YaziGovdesi govde={govde || "Henüz bir şey yazmadın."} />
            </div>
          ) : (
            <textarea
              id="govde"
              value={govde}
              onChange={(e) => setGovde(e.target.value)}
              rows={18}
              maxLength={30000}
              className="rounded-xl border border-white/15 bg-yuzey2 text-yazi p-5 text-lg leading-relaxed"
            />
          )}
          <p className={`text-sm ${karakter < 200 ? "text-soluk" : "font-bold text-yazi"}`}>
            {karakter < 200 ? `En az 200 karakter: ${karakter}/200` : `${karakter} karakter`}
          </p>
        </div>

        {hata ? <p role="alert" className="font-bold text-turuncu-acik">{hata}</p> : null}

        <button
          type="submit"
          disabled={gonderiliyor}
          className="self-start regen-parlak rounded-full px-7 py-4 text-lg font-extrabold text-white transition-transform active:translate-y-px disabled:opacity-60"
        >
          {gonderiliyor ? "Gönderiliyor" : "Onaya gönder"}
        </button>
      </form>
    </main>
  );
}
