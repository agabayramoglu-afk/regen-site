// Site iskeleti: üst menü, altbilgi, yazı kartları ve yazı gövdesi.
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";

import { cikisYap, type YaziKart } from "@/lib/regen/api.functions";
import type { Tahta } from "@/lib/regen/board";
import { govdeAyristir, tarihYaz } from "@/lib/regen/metin";
import type { Uye } from "@/lib/regen/auth.server";
import { TahtaSvg } from "./tahta-svg";
import { FormaAvatar } from "./profil-ogeler";

const NAV = [
  { to: "/yazilar", ad: "Yazılar" },
  { to: "/konular", ad: "Konular" },
  { to: "/dizilis", ad: "Diziliş kur" },
  { to: "/tahta", ad: "Taktik tahta" },
] as const;

export function UstMenu({ uye }: { uye: Uye | null }) {
  const [acik, setAcik] = useState(false);
  const router = useRouter();

  const cikis = async () => {
    await cikisYap();
    setAcik(false);
    await router.invalidate();
    await router.navigate({ to: "/" });
  };

  const navLink = "text-white/75 transition-colors hover:text-white [&.active]:text-turuncu-acik";

  return (
    <header className="regen-ust sticky top-0 z-50 text-yazi">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6">
        <Link to="/" aria-label="Regen ana sayfa" className="shrink-0">
          <img src="/assets/regen/logo-beyaz.png" alt="Regen" width={104} height={35} className="h-auto w-26" />
        </Link>
        <nav aria-label="Ana menü" className="hidden flex-1 items-center gap-7 text-[15px] font-semibold lg:flex">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={navLink}>
              {n.ad}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-5 text-[15px] font-semibold lg:flex">
          {uye ? (
            <>
              {uye.role === "admin" ? (
                <Link to="/yonetim" className={navLink}>Yönetim</Link>
              ) : null}
              <Link to="/profil" className={`${navLink} flex items-center gap-2`}>
                <FormaAvatar renk={uye.renk} no={uye.forma_no} isim={uye.name} boyut={32} />
                {uye.name.split(" ")[0]}
              </Link>
              <button type="button" onClick={cikis} className="min-h-11 text-white/55 hover:text-white">Çıkış</button>
              <Link to="/yaz" search={{}} className="regen-parlak rounded-full px-5 py-2.5 font-extrabold">
                Yazı yaz
              </Link>
            </>
          ) : (
            <>
              <Link to="/giris" className={navLink}>Giriş</Link>
              <Link to="/kayit" className="regen-parlak rounded-full px-5 py-2.5 font-extrabold">
                Üye ol
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="ml-auto flex size-11 items-center justify-center lg:hidden"
          aria-expanded={acik}
          aria-controls="mobil-menu"
          aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setAcik((a) => !a)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            {acik ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {acik ? (
        <nav id="mobil-menu" aria-label="Mobil menü" className="border-t border-white/10 px-4 pb-6 pt-2 lg:hidden">
          <ul className="flex flex-col text-lg font-bold">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setAcik(false)} className="flex min-h-12 items-center">{n.ad}</Link>
              </li>
            ))}
            {uye ? (
              <>
                <li><Link to="/yaz" search={{}} onClick={() => setAcik(false)} className="flex min-h-12 items-center text-turuncu-acik">Yazı yaz</Link></li>
                <li><Link to="/profil" onClick={() => setAcik(false)} className="flex min-h-12 items-center">Profilim</Link></li>
                {uye.role === "admin" ? (
                  <li><Link to="/yonetim" onClick={() => setAcik(false)} className="flex min-h-12 items-center">Yönetim</Link></li>
                ) : null}
                <li><button type="button" onClick={cikis} className="flex min-h-12 items-center text-white/60">Çıkış</button></li>
              </>
            ) : (
              <>
                <li><Link to="/giris" onClick={() => setAcik(false)} className="flex min-h-12 items-center">Giriş</Link></li>
                <li><Link to="/kayit" onClick={() => setAcik(false)} className="flex min-h-12 items-center text-turuncu-acik">Üye ol</Link></li>
              </>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function Altbilgi() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-white/10 bg-gece text-yazi">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-turuncu/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-5 px-6 pb-10 pt-16 text-center">
        <img src="/assets/regen/logo-beyaz.png" alt="Regen" width={150} height={51} className="h-auto w-36" />
        <span aria-hidden="true" className="regen-karalama mx-auto w-28" />
        <p className="text-lg font-semibold">Psikolojik ve taktik analizler için takip et</p>
        <nav aria-label="Alt menü" className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-[15px] font-semibold text-white/70">
          <Link to="/yazilar" className="hover:text-white">Yazılar</Link>
          <Link to="/konular" className="hover:text-white">Konular</Link>
          <Link to="/dizilis" className="hover:text-white">Diziliş kur</Link>
          <Link to="/tahta" className="hover:text-white">Taktik tahta</Link>
        </nav>
        <p className="mt-4 text-sm text-white/45">© Regen</p>
      </div>
    </footer>
  );
}

export function KonuEtiketi({ baslik, tur }: { baslik: string; tur: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[12px] font-extrabold tracking-wide ${
        tur === "konu" ? "regen-parlak" : "border border-white/15 bg-white/5 text-white/85"
      }`}
    >
      {baslik}
    </span>
  );
}

function tahtaCoz(s: string | null): Tahta | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as Tahta;
  } catch {
    return null;
  }
}

export function YaziKarti({ y, buyuk = false }: { y: YaziKart; buyuk?: boolean }) {
  const tahta = tahtaCoz(y.board_data);
  return (
    <article className="group h-full">
      <Link
        to="/yazilar/$slug"
        params={{ slug: y.slug }}
        className="regen-cam flex h-full flex-col overflow-hidden rounded-3xl text-yazi transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none"
      >
        {tahta ? (
          <div className="pointer-events-none border-b border-white/10">
            <TahtaSvg tahta={tahta} baslik={`${y.title} çizimi`} />
          </div>
        ) : (
          <div aria-hidden="true" className={`regen-kor flex items-end px-6 pb-5 ${buyuk ? "h-44" : "h-28"}`}>
            <span className="font-el text-3xl font-bold text-white/90">{y.topic_title.toLocaleLowerCase("tr")}</span>
          </div>
        )}
        <div className={`flex flex-1 flex-col gap-3 ${buyuk ? "p-7" : "p-5"}`}>
          <span><KonuEtiketi baslik={y.topic_title} tur={y.topic_kind} /></span>
          <h3 className={`font-extrabold leading-tight transition-colors group-hover:text-turuncu-acik ${buyuk ? "text-3xl" : "text-xl"}`}>{y.title}</h3>
          <p className="line-clamp-3 text-[15px] leading-relaxed text-soluk">{y.excerpt}</p>
          <p className="mt-auto pt-2 text-sm text-soluk">
            <span className="font-bold text-yazi">{y.author}</span> · {tarihYaz(y.published_at ?? y.created_at)} · {y.begeni} beğeni · {y.yorum} yorum
          </p>
        </div>
      </Link>
    </article>
  );
}

export function YaziGovdesi({ govde }: { govde: string }) {
  const parcalar = govdeAyristir(govde);
  return (
    <div className="flex flex-col gap-6 text-[19px] leading-[1.8] text-white/90">
      {parcalar.map((p, i) =>
        p.tur === "h2" ? (
          <h2 key={i} className="mt-4 text-3xl font-black leading-tight text-yazi">{p.metin}</h2>
        ) : p.tur === "alinti" ? (
          <blockquote key={i} className="my-2 text-center font-el text-3xl font-bold leading-snug text-turuncu-acik">
            “{p.metin}”
            <span aria-hidden="true" className="regen-karalama mx-auto mt-2" />
          </blockquote>
        ) : (
          <p key={i}>{p.metin}</p>
        ),
      )}
    </div>
  );
}

export function SayfaBasligi({ ust, baslik, alt }: { ust?: string; baslik: string; alt?: string }) {
  return (
    <header className="flex flex-col gap-3">
      {ust ? <span className="font-el text-2xl font-bold text-turuncu-acik">{ust}</span> : null}
      <h1 className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-black leading-[1.05] tracking-tight text-transparent md:text-6xl">{baslik}</h1>
      <span aria-hidden="true" className="regen-karalama" />
      {alt ? <p className="max-w-[60ch] text-lg leading-relaxed text-soluk">{alt}</p> : null}
    </header>
  );
}
