import { useState } from "react";
import { createFileRoute, Link, useRouteContext, useRouter } from "@tanstack/react-router";

import { kayitOl } from "@/lib/regen/api.functions";

export const Route = createFileRoute("/kayit")({
  head: () => ({ meta: [{ title: "Üye ol | Regen" }] }),
  component: Kayit,
});

function Kayit() {
  const { user } = useRouteContext({ from: "__root__" });
  const router = useRouter();
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekle, setBekle] = useState(false);

  const gonder = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setHata(null);
    setBekle(true);
    try {
      await kayitOl({ data: { name: ad, email, password: sifre } });
      await router.invalidate();
      await router.navigate({ to: "/profil" });
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Kayıt tamamlanamadı.");
      setBekle(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-5xl items-center gap-12 px-4 pb-24 pt-14 sm:px-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <span className="font-el text-2xl font-bold text-turuncu-acik">sahaya hoş geldin</span>
        <h1 className="text-5xl font-black leading-none">Üye ol</h1>
        <span aria-hidden="true" className="regen-karalama" />
        {user ? (
          <p className="mt-6 text-lg">
            Zaten giriş yaptın. <Link to="/profil" className="font-bold underline decoration-turuncu decoration-2 underline-offset-4">Profiline git</Link>
          </p>
        ) : (
          <form onSubmit={gonder} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="ad" className="font-bold">Görünen isim</label>
              <input id="ad" autoComplete="nickname" required minLength={2} maxLength={40} value={ad} onChange={(e) => setAd(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-4 font-semibold" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-bold">E-posta</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-4 font-semibold" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="sifre" className="font-bold">Şifre</label>
              <input id="sifre" type="password" autoComplete="new-password" required minLength={8} value={sifre} onChange={(e) => setSifre(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-4 font-semibold" />
              <p className="text-sm text-soluk">En az 8 karakter.</p>
            </div>
            {hata ? <p role="alert" className="font-bold text-turuncu-acik">{hata}</p> : null}
            <button type="submit" disabled={bekle} className="min-h-12 regen-parlak rounded-full px-6 font-extrabold text-white transition-transform active:translate-y-px disabled:opacity-60">
              {bekle ? "Hesap açılıyor" : "Hesabımı aç"}
            </button>
            <p className="text-soluk">
              Hesabın var mı? <Link to="/giris" className="font-bold text-yazi underline decoration-turuncu decoration-2 underline-offset-4">Giriş</Link>
            </p>
          </form>
        )}
      </div>
      <img src="/assets/regen/ana-karakter-koyu.jpg" alt="Turuncu formalı Regen karakterinin karakalem çizimi" width={560} height={700} className="hidden h-auto w-full rounded-2xl md:block" />
    </main>
  );
}
