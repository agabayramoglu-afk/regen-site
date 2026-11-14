import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";

import { girisYap } from "@/lib/regen/api.functions";

export const Route = createFileRoute("/giris")({
  head: () => ({ meta: [{ title: "Giriş | Regen" }] }),
  component: Giris,
});

function Giris() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bekle, setBekle] = useState(false);

  const gonder = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setHata(null);
    setBekle(true);
    try {
      await girisYap({ data: { email, password: sifre } });
      await router.invalidate();
      await router.navigate({ to: "/profil" });
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Giriş yapılamadı.");
      setBekle(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-5xl items-center gap-12 px-4 pb-24 pt-14 sm:px-6 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <span className="font-el text-2xl font-bold text-turuncu-acik">tekrar hoş geldin</span>
        <h1 className="text-5xl font-black leading-none">Giriş</h1>
        <span aria-hidden="true" className="regen-karalama" />
        <form onSubmit={gonder} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-bold">E-posta</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-4 font-semibold" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="sifre" className="font-bold">Şifre</label>
            <input id="sifre" type="password" autoComplete="current-password" required value={sifre} onChange={(e) => setSifre(e.target.value)} className="h-12 rounded-lg border border-white/15 bg-yuzey2 text-yazi px-4 font-semibold" />
          </div>
          {hata ? <p role="alert" className="font-bold text-turuncu-acik">{hata}</p> : null}
          <button type="submit" disabled={bekle} className="min-h-12 rounded-lg bg-white px-6 font-extrabold text-zemin transition-transform active:translate-y-px disabled:opacity-60">
            {bekle ? "Giriş yapılıyor" : "Giriş yap"}
          </button>
          <p className="text-soluk">
            Hesabın yok mu? <Link to="/kayit" className="font-bold text-yazi underline decoration-turuncu decoration-2 underline-offset-4">Üye ol</Link>
          </p>
        </form>
      </div>
      <img src="/assets/regen/oyuncu-kosu.jpg" alt="Topla koşan bir oyuncunun karakalem çizimi" width={560} height={700} className="hidden h-auto w-full rounded-2xl md:block" />
    </main>
  );
}
