// Karakalem saha ve Regen vurgu dili. Hem düzenleyici hem salt-okunur görünüm kullanır.
import type { PointerEvent as RPointerEvent, Ref } from "react";

import type { Isaret, Oyuncu, Tahta } from "@/lib/regen/board";

export const RENK = {
  turuncu: "#F94B02",
  turuncuKoyu: "#B83600",
  murekkep: "#111111",
  grafit: "#3B3B3B",
  tebesir: "#F6F3EA",
  kagit: "#F9F2D9",
  cim: "#4C9A36",
  cimKoyu: "#2E6E22",
  kaleci: "#1F9E8F",
  rakipKaleci: "#63B3ED",
};

const K = 10; // metre -> svg birimi

type Props = {
  tahta: Tahta;
  svgRef?: Ref<SVGSVGElement>;
  secili?: string | null;
  taslak?: Isaret | null;
  className?: string;
  baslik?: string;
  onSahaDown?: (e: RPointerEvent<SVGSVGElement>) => void;
  onMove?: (e: RPointerEvent<SVGSVGElement>) => void;
  onUp?: (e: RPointerEvent<SVGSVGElement>) => void;
  onOyuncuDown?: (id: string, e: RPointerEvent<SVGGElement>) => void;
  onTopDown?: (e: RPointerEvent<SVGGElement>) => void;
  onIsaretDown?: (id: string, e: RPointerEvent<SVGGElement>) => void;
  imlec?: string;
};

function okBasi(ux: number, uy: number, bx: number, by: number, renk: string, gen: number) {
  const ang = Math.atan2(by - uy, bx - ux);
  const L = 22;
  const a1 = ang + Math.PI - 0.5;
  const a2 = ang + Math.PI + 0.5;
  const d = `M ${bx + Math.cos(a1) * L} ${by + Math.sin(a1) * L} L ${bx} ${by} L ${bx + Math.cos(a2) * L} ${by + Math.sin(a2) * L}`;
  return <path d={d} fill="none" stroke={renk} strokeWidth={gen} strokeLinecap="round" strokeLinejoin="round" />;
}

function IsaretCiz({ m, onDown }: { m: Isaret; onDown?: (id: string, e: RPointerEvent<SVGGElement>) => void }) {
  const [a, b] = [m.p[0], m.p[1] ?? m.p[0]];
  const ax = a[0] * K, ay = a[1] * K, bx = b[0] * K, by = b[1] * K;
  const ortak = {
    onPointerDown: onDown ? (e: RPointerEvent<SVGGElement>) => onDown(m.id, e) : undefined,
    style: onDown ? { cursor: "pointer" } : undefined,
  };

  if (m.tur === "pas" || m.tur === "kosu" || m.tur === "rakip") {
    const renk = m.tur === "rakip" ? RENK.murekkep : RENK.turuncu;
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const cx = (ax + bx) / 2 - (dy / len) * len * 0.12;
    const cy = (ay + by) / 2 + (dx / len) * len * 0.12;
    const kesik = m.tur === "pas" ? undefined : "22 16";
    return (
      <g {...ortak}>
        <path d={`M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`} fill="none" stroke="transparent" strokeWidth={26} />
        <path d={`M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`} fill="none" stroke={renk} strokeWidth={6} strokeDasharray={kesik} strokeLinecap="round" />
        {okBasi(cx, cy, bx, by, renk, 6)}
      </g>
    );
  }
  if (m.tur === "surme") {
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const adim = Math.max(8, Math.floor(len / 8));
    let d = `M ${ax} ${ay}`;
    for (let i = 1; i <= adim; i++) {
      const t = i / adim;
      const s = i === adim ? 0 : Math.sin(t * len / 30 * Math.PI * 2) * 7 * Math.min(1, (1 - t) * 6);
      d += ` L ${ax + dx * t + nx * s} ${ay + dy * t + ny * s}`;
    }
    return (
      <g {...ortak}>
        <path d={d} fill="none" stroke="transparent" strokeWidth={26} />
        <path d={d} fill="none" stroke={RENK.turuncu} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        {okBasi(ax + dx * 0.9, ay + dy * 0.9, bx, by, RENK.turuncu, 5)}
      </g>
    );
  }
  if (m.tur === "cember" || m.tur === "rakip_cember") {
    const renk = m.tur === "cember" ? RENK.turuncu : RENK.murekkep;
    return (
      <g {...ortak}>
        <ellipse cx={ax} cy={ay} rx={34} ry={36} fill="transparent" stroke={renk} strokeWidth={5} strokeDasharray="14 10" />
      </g>
    );
  }
  if (m.tur === "soru") {
    return (
      <g {...ortak}>
        <text x={ax} y={ay} textAnchor="middle" dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={56} fill={RENK.tebesir} stroke={RENK.murekkep} strokeWidth={4} paintOrder="stroke">?</text>
      </g>
    );
  }
  if (m.tur === "etiket") {
    const t = m.metin ?? "Not";
    const w = t.length * 13 + 30;
    return (
      <g {...ortak}>
        <rect x={ax - w / 2} y={ay - 20} width={w} height={40} rx={8} fill={RENK.turuncu} />
        <text x={ax} y={ay + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={21} fill={RENK.tebesir}>{t}</text>
      </g>
    );
  }
  // alan
  const x = Math.min(ax, bx), y = Math.min(ay, by);
  return (
    <g {...ortak}>
      <rect x={x} y={y} width={Math.abs(bx - ax)} height={Math.abs(by - ay)} rx={14} fill={RENK.turuncu} fillOpacity={0.22} stroke={RENK.turuncu} strokeWidth={4} strokeDasharray="16 10" />
    </g>
  );
}

function OyuncuPul({ o, secili, onDown }: { o: Oyuncu; secili: boolean; onDown?: (id: string, e: RPointerEvent<SVGGElement>) => void }) {
  const dolgu =
    o.takim === "biz" ? RENK.turuncu : o.takim === "rakip" ? RENK.murekkep : o.takim === "kaleci" ? RENK.kaleci : RENK.rakipKaleci;
  const yazi = o.takim === "rakip" ? RENK.tebesir : RENK.murekkep;
  const x = o.x * K, y = o.y * K;
  return (
    <g
      onPointerDown={onDown ? (e) => onDown(o.id, e) : undefined}
      style={onDown ? { cursor: "grab", touchAction: "none" } : undefined}
    >
      <circle cx={x + 2} cy={y + 4} r={20} fill={RENK.cimKoyu} opacity={0.55} />
      {secili ? <circle cx={x} cy={y} r={30} fill="none" stroke={RENK.tebesir} strokeWidth={4} strokeDasharray="10 7" /> : null}
      <circle cx={x} cy={y} r={20} fill={dolgu} stroke={o.takim === "rakip" ? RENK.tebesir : RENK.grafit} strokeWidth={3} />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontWeight={800} fontSize={17} fill={yazi}>{o.no}</text>
      {o.not ? (
        <g>
          <title>{`${o.ad || o.no}: ${o.not}`}</title>
          <circle cx={x + 17} cy={y - 17} r={9} fill={RENK.turuncu} stroke={RENK.tebesir} strokeWidth={2.5} />
          <text x={x + 17} y={y - 16} textAnchor="middle" dominantBaseline="middle" fontFamily="Montserrat, sans-serif" fontWeight={900} fontSize={12} fill="#FFFFFF">i</text>
        </g>
      ) : null}
      {o.ad ? (
        <text x={x} y={y + 44} textAnchor="middle" fontFamily="Kalam, cursive" fontWeight={700} fontSize={23} fill={RENK.murekkep} stroke={RENK.tebesir} strokeWidth={5} paintOrder="stroke">{o.ad}</text>
      ) : null}
    </g>
  );
}

export function SahaCizgileri() {
  const W = 1050, H = 680;
  const c = { fill: "none", stroke: RENK.tebesir, strokeWidth: 3.5, strokeLinecap: "round" as const };
  const ceza = (sol: boolean) => {
    const x0 = sol ? 0 : W;
    const s = sol ? 1 : -1;
    return (
      <g>
        <rect x={sol ? 0 : W - 165} y={138.4} width={165} height={403.2} {...c} />
        <rect x={sol ? 0 : W - 55} y={248.4} width={55} height={183.2} {...c} />
        <circle cx={x0 + s * 110} cy={340} r={4} fill={RENK.tebesir} />
        <path d={`M ${x0 + s * 165} ${340 - 73} A 91.5 91.5 0 0 ${sol ? 1 : 0} ${x0 + s * 165} ${340 + 73}`} {...c} />
        <rect x={sol ? -20 : W} y={303.4} width={20} height={73.2} {...c} />
      </g>
    );
  };
  return (
    <g filter="url(#regen-titrek)">
      <rect x={0} y={0} width={W} height={H} {...c} />
      <line x1={W / 2} y1={0} x2={W / 2} y2={H} {...c} />
      <circle cx={W / 2} cy={H / 2} r={91.5} {...c} />
      <circle cx={W / 2} cy={H / 2} r={4} fill={RENK.tebesir} />
      {ceza(true)}
      {ceza(false)}
    </g>
  );
}

export function TahtaSvg(p: Props) {
  const { tahta } = p;
  return (
    <svg
      ref={p.svgRef}
      viewBox="-40 -40 1130 760"
      className={p.className}
      role="img"
      aria-label={p.baslik ?? (tahta.tur === "dizilis" ? `Diziliş ${tahta.dizilis}` : "Taktik çizim")}
      onPointerDown={p.onSahaDown}
      onPointerMove={p.onMove}
      onPointerUp={p.onUp}
      onPointerCancel={p.onUp}
      style={{ touchAction: p.onSahaDown ? "none" : undefined, cursor: p.imlec, display: "block", width: "100%", height: "auto", userSelect: "none" }}
    >
      <defs>
        <filter id="regen-titrek" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} />
          <feDisplacementMap in="SourceGraphic" scale={4} />
        </filter>
        <pattern id="regen-tarama" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={RENK.cimKoyu} strokeWidth={2.2} opacity={0.35} />
        </pattern>
      </defs>
      <rect x={-40} y={-40} width={1130} height={760} fill={RENK.cim} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 105} y={0} width={105} height={680} fill={i % 2 ? RENK.cimKoyu : "transparent"} opacity={0.28} />
      ))}
      <rect x={-40} y={-40} width={1130} height={760} fill="url(#regen-tarama)" />
      <SahaCizgileri />
      {tahta.isaretler.filter((m) => m.tur === "alan").map((m) => (
        <IsaretCiz key={m.id} m={m} onDown={p.onIsaretDown} />
      ))}
      {tahta.isaretler.filter((m) => m.tur !== "alan" && m.tur !== "etiket" && m.tur !== "soru").map((m) => (
        <IsaretCiz key={m.id} m={m} onDown={p.onIsaretDown} />
      ))}
      {tahta.oyuncular.map((o) => (
        <OyuncuPul key={o.id} o={o} secili={p.secili === o.id} onDown={p.onOyuncuDown} />
      ))}
      {tahta.top ? (
        <g onPointerDown={p.onTopDown} style={p.onTopDown ? { cursor: "grab" } : undefined}>
          <circle cx={tahta.top.x * K} cy={tahta.top.y * K} r={9} fill="#FFFFFF" stroke={RENK.murekkep} strokeWidth={2.5} />
          <circle cx={tahta.top.x * K} cy={tahta.top.y * K} r={3.5} fill={RENK.murekkep} />
        </g>
      ) : null}
      {tahta.isaretler.filter((m) => m.tur === "etiket" || m.tur === "soru").map((m) => (
        <IsaretCiz key={m.id} m={m} onDown={p.onIsaretDown} />
      ))}
      {p.taslak ? <g opacity={0.8}><IsaretCiz m={p.taslak} /></g> : null}
    </svg>
  );
}
