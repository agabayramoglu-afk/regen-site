// Profil görsel öğeleri: forma avatarı, kapak bandı, sosyal bağlantılar.
import { basHarfler, formaRengi, kapakGecerli } from "@/lib/regen/profil";

export function FormaAvatar({
  renk,
  no,
  isim,
  boyut = 96,
  className = "",
}: {
  renk: string;
  no?: string;
  isim: string;
  boyut?: number;
  className?: string;
}) {
  const r = formaRengi(renk);
  const metin = no && no.trim() ? no.trim() : basHarfler(isim) || "R";
  const kucuk = metin.length > 2;
  return (
    <svg
      width={boyut}
      height={boyut}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${isim} forması`}
      className={className}
    >
      <circle cx="50" cy="50" r="49" fill="#15120F" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
      <path
        d="M33 18 L43 13 Q50 19 57 13 L67 18 L84 30 L77 44 L69 40 L69 84 L31 84 L31 40 L23 44 L16 30 Z"
        fill={r.dolgu}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M43 13 Q50 21 57 13" fill="none" stroke={r.yazi} strokeOpacity="0.55" strokeWidth="2.5" />
      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Montserrat, sans-serif"
        fontWeight={900}
        fontSize={kucuk ? 18 : 26}
        fill={r.yazi}
      >
        {metin}
      </text>
    </svg>
  );
}

export function KapakBandi({ kapak, className = "" }: { kapak: string; className?: string }) {
  return <div aria-hidden="true" className={`regen-kapak regen-kapak-${kapakGecerli(kapak)} ${className}`} />;
}

const SOSYAL = [
  { alan: "instagram", ad: "Instagram", url: (k: string) => `https://instagram.com/${k}` },
  { alan: "x_hesabi", ad: "X", url: (k: string) => `https://x.com/${k}` },
  { alan: "youtube", ad: "YouTube", url: (k: string) => `https://youtube.com/@${k}` },
] as const;

export function SosyalBaglantilar({ p }: { p: { instagram: string; x_hesabi: string; youtube: string } }) {
  const dolu = SOSYAL.filter((s) => p[s.alan]);
  if (dolu.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {dolu.map((s) => (
        <li key={s.alan}>
          <a
            href={s.url(p[s.alan])}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-bold hover:border-white/40"
          >
            {s.ad}
            <span className="text-soluk">@{p[s.alan]}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
