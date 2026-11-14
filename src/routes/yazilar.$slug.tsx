import { useState } from "react";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";

import { begen, yaziDurumu, yaziGetir, yorumSil, yorumYap } from "@/lib/regen/api.functions";
import { KonuEtiketi, YaziGovdesi } from "@/components/regen/site";
import { TahtaSvg } from "@/components/regen/tahta-svg";
import type { Tahta } from "@/lib/regen/board";
import { okumaSuresi, tarihYaz } from "@/lib/regen/metin";

export const Route = createFileRoute("/yazilar/$slug")({
  loader: async ({ params }) => {
    const r = await yaziGetir({ data: { slug: params.slug } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.yazi.title} | Regen` },
          { name: "description", content: loaderData.yazi.excerpt },
          { property: "og:title", content: loaderData.yazi.title },
          { property: "og:description", content: loaderData.yazi.excerpt },
        ]
      : [],
  }),
  component: YaziSayfasi,
});

const DURUM_ADI: Record<string, string> = {
  beklemede: "Onay bekliyor",
  reddedildi: "Yayına alınmadı",
  yayinda: "Yayında",
};

function YaziSayfasi() {
  const veri = Route.useLoaderData();
  const { yazi, yorumlar, girisli, yonetici, uyeId } = veri;
  const router = useRouter();
  const [begeni, setBegeni] = useState({ begendim: veri.begendim, sayi: yazi.begeni });
  const [yorum, setYorum] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  let tahta: Tahta | null = null;
  try {
    tahta = yazi.board_data ? (JSON.parse(yazi.board_data) as Tahta) : null;
  } catch {
    tahta = null;
  }

  const begenTikla = async () => {
    if (!girisli) {
      await router.navigate({ to: "/giris" });
      return;
    }
    const r = await begen({ data: { postId: yazi.id } });
    setBegeni(r);
  };

  const yorumGonder = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setHata(null);
    setGonderiliyor(true);
    try {
      await yorumYap({ data: { postId: yazi.id, body: yorum } });
      setYorum("");
      await router.invalidate();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Yorum gönderilemedi.");
    } finally {
      setGonderiliyor(false);
    }
  };

  const durumDegistir = async (status: "yayinda" | "reddedildi") => {
    await yaziDurumu({ data: { id: yazi.id, status } });
    await router.invalidate();
  };

  return (
    <main className="pb-24">
      <article>
        <header className="mx-auto flex max-w-3xl flex-col gap-5 px-4 pb-8 pt-14 sm:px-6">
          {yazi.status !== "yayinda" ? (
            <div role="status" className="regen-cam flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3 text-yazi">
              <span className="font-extrabold">{DURUM_ADI[yazi.status] ?? yazi.status}</span>
              {yonetici ? (
                <span className="flex gap-2">
                  <button type="button" onClick={() => durumDegistir("yayinda")} className="min-h-10 regen-parlak rounded-full px-3 text-sm font-extrabold text-white">Onayla</button>
                  <button type="button" onClick={() => durumDegistir("reddedildi")} className="min-h-10 rounded-lg border-2 border-white px-3 text-sm font-extrabold">Reddet</button>
                </span>
              ) : (
                <span className="text-sm text-white/75">Bu yazıyı şu an yalnızca sen görüyorsun.</span>
              )}
            </div>
          ) : null}
          <Link to="/yazilar" search={{ konu: yazi.topic_slug }} className="self-start">
            <KonuEtiketi baslik={yazi.topic_title} tur={yazi.topic_kind} />
          </Link>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight md:text-5xl">{yazi.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t-2 border-white/25 pt-4 text-base">
            <span className="font-bold">{yazi.author}</span>
            <span className="text-soluk">{tarihYaz(yazi.published_at ?? yazi.created_at)} · {okumaSuresi(yazi.body)} dk okuma</span>
            <button
              type="button"
              onClick={begenTikla}
              aria-pressed={begeni.begendim}
              className={`ml-auto flex min-h-11 items-center gap-2 rounded-full border-2 px-4 font-extrabold transition-transform active:scale-[0.98] ${
                begeni.begendim ? "border-turuncu bg-turuncu text-white" : "border-white/25"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill={begeni.begendim ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
                <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
              </svg>
              {begeni.sayi}
            </button>
          </div>
        </header>

        {tahta ? (
          <figure className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <TahtaSvg tahta={tahta} baslik={`${yazi.title} çizimi`} />
            </div>
            <figcaption className="mt-3 text-center text-sm text-soluk">
              Turuncu: anlatılan takım. Siyah: rakip. Düz ok pas, kesikli ok topsuz koşu.
            </figcaption>
          </figure>
        ) : null}

        <div className="mx-auto max-w-[720px] px-4 pt-10 sm:px-6">
          <YaziGovdesi govde={yazi.body} />
        </div>
      </article>

      <section aria-labelledby="yorumlar" className="mx-auto mt-16 max-w-[720px] px-4 sm:px-6">
        <h2 id="yorumlar" className="text-2xl font-black">Yorumlar ({yorumlar.length})</h2>
        <ul className="mt-6 flex flex-col gap-4">
          {yorumlar.map((c) => (
            <li key={c.id} className="rounded-xl bg-yuzey p-5">
              <div className="mb-2 flex items-center gap-3 text-sm">
                <span className="font-el text-xl font-bold">{c.author}</span>
                <span className="text-soluk">{tarihYaz(c.created_at)}</span>
                {yonetici || c.user_id === uyeId ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await yorumSil({ data: { id: c.id } });
                      await router.invalidate();
                    }}
                    className="ml-auto min-h-10 text-sm font-bold text-soluk underline"
                  >
                    Sil
                  </button>
                ) : null}
              </div>
              <p className="whitespace-pre-line leading-relaxed">{c.body}</p>
            </li>
          ))}
        </ul>
        {yazi.status === "yayinda" ? (
          girisli ? (
            <form onSubmit={yorumGonder} className="mt-6 flex flex-col gap-2">
              <label htmlFor="yorum" className="font-bold">Yorumun</label>
              <textarea
                id="yorum"
                value={yorum}
                onChange={(e) => setYorum(e.target.value)}
                rows={4}
                maxLength={2000}
                className="rounded-xl border border-white/15 bg-yuzey2 text-yazi p-4 leading-relaxed"
              />
              {hata ? <p role="alert" className="text-sm font-bold text-turuncu-acik">{hata}</p> : null}
              <button type="submit" disabled={gonderiliyor || yorum.trim().length < 2} className="self-start rounded-lg bg-white px-5 py-3 font-extrabold text-zemin disabled:opacity-50">
                {gonderiliyor ? "Gönderiliyor" : "Yorum gönder"}
              </button>
            </form>
          ) : (
            <p className="mt-6 text-soluk">
              Yorum yazmak için <Link to="/giris" className="font-bold text-yazi underline decoration-turuncu decoration-2 underline-offset-4">giriş yap</Link>.
            </p>
          )
        ) : null}
      </section>
    </main>
  );
}
