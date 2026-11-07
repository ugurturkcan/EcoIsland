import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ReactNode } from 'react';
import { AdaScreen, CameraScreen, CardScreen, ImpactScreen, SH, SW, UpcycleScreen } from './Screens';
import { C, fontFamily } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

type Scene = { id: string; from: number; dur: number; eyebrow: string; title: [string, string]; sub: string; card: number };

const SCENES: Scene[] = [
  { id: 'ada', from: 0, dur: 150, eyebrow: 'Sıfır Atık Ustası', title: ['Atmadan önce', 'bir bak.'], sub: 'Eşyalarının karbon bedelini öğren, onlara yeni bir hayat ver ve kendi adanı büyüt.', card: 0 },
  { id: 'camera', from: 150, dur: 135, eyebrow: 'Yapay zekâ ile tanıma', title: ['Fotoğrafını çek.', 'Gerisi bizde.'], sub: 'Eşya, malzeme ve ağırlık saniyeler içinde tanınır.', card: 1 },
  { id: 'card', from: 285, dur: 135, eyebrow: 'Görünmeyen bedel', title: ['Bedelini', 'gör.'], sub: 'Tek bir pet şişe: 85 g CO₂e, 5,2 L su ve 450 yıl.', card: 2 },
  { id: 'upcycle', from: 420, dur: 150, eyebrow: 'Eşyana özel fikir', title: ['Ona yeni bir', 'hayat ver.'], sub: 'Çöp olacak şişe, masanda bir gece lambası olsun.', card: 3 },
  { id: 'impact', from: 570, dur: 135, eyebrow: 'Ölçülebilir etki', title: ['Etkini', 'ölç.'], sub: 'Kaçınılan karbon ve su, DEFRA 2025 faktörleriyle hesaplanır.', card: 4 },
  { id: 'outro', from: 705, dur: 135, eyebrow: 'EkoZeka 2026', title: ['Eco', 'Island'], sub: 'Atmadan önce bir bak.', card: -1 },
];
export const TOTAL = 840;

const CARDS = [
  { t: 'Ada', d: 'Her iyi seçimle büyüyen 3D dünyan', color: C.moss },
  { t: 'Gör', d: 'Yapay zekâ eşyayı fotoğraftan tanır', color: C.skyInk },
  { t: 'Öğren', d: 'Karbon, su ve doğada kalma süresi', color: C.brown },
  { t: 'Dönüştür', d: 'Eşyana özel yeni hayat fikri', color: C.moss },
  { t: 'Etki', d: 'Kaçınılan karbon ve su panosu', color: C.water },
];

function Icon({ i, color }: { i: number; color: string }) {
  const p = { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: ReactNode[] = [
    <><path d="M3 15l9-5 9 5-9 5z" /><path d="M12 10V4l4 3" /></>,
    <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
    <><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><circle cx="12" cy="12" r="5" /></>,
    <><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></>,
    <><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /></>,
  ];
  return <svg {...p}>{paths[i]}</svg>;
}

/** Bir sahnenin giriş/çıkış ilerlemesi. */
function useScene(s: Scene) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - s.from, fps, config: { damping: 200, mass: 0.8 } });
  const exit = s.from + s.dur >= TOTAL ? 0 : spring({ frame: frame - (s.from + s.dur - 6), fps, config: { damping: 200, mass: 0.8 } });
  return { frame, enter, exit, local: frame - s.from };
}

function LeftText({ s }: { s: Scene }) {
  const { frame, enter, exit } = useScene(s);
  const { fps } = useVideoConfig();
  if (frame < s.from - 2 || exit > 0.99) return null;
  const line = (k: number) => spring({ frame: frame - s.from - k * 5, fps, config: { damping: 16, mass: 0.7 } });
  const outro = s.id === 'outro';
  return (
    <div style={{ position: 'absolute', left: 120, top: 0, bottom: 0, width: 600, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26, opacity: 1 - exit, transform: `translateY(${-exit * 30}px)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: enter }}>
        <span style={{ width: 34, height: 4, borderRadius: 2, background: C.lime }} />
        <span style={{ fontSize: 28, fontWeight: 600, color: C.moss }}>{s.eyebrow}</span>
      </div>
      <div style={{ fontSize: outro ? 150 : 96, fontWeight: 700, letterSpacing: outro ? -6 : -3.5, lineHeight: 1.02, color: C.ink }}>
        {s.title.map((t, k) => (
          <div key={t} style={{ overflow: 'hidden', paddingBottom: 6 }}>
            <div style={{ transform: `translateY(${(1 - line(k)) * 110}%)`, color: k === 1 ? C.moss : C.ink }}>{t}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: outro ? 44 : 32, lineHeight: 1.4, color: outro ? C.moss : C.inkSoft, fontWeight: outro ? 700 : 400, maxWidth: 560, opacity: line(2), transform: `translateY(${(1 - line(2)) * 20}px)` }}>{s.sub}</div>
    </div>
  );
}

function PhoneScreens() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {SCENES.map((s) => {
        if (frame < s.from - 1 || frame > s.from + s.dur + 20) return null;
        const enter = s.from === 0 ? 1 : spring({ frame: frame - s.from, fps, config: { damping: 200, mass: 0.9 } });
        const exit = s.from + s.dur >= TOTAL ? 0 : spring({ frame: frame - (s.from + s.dur), fps, config: { damping: 200, mass: 0.9 } });
        const local = frame - s.from;
        const x = (1 - enter) * 100 - exit * 35;
        const screen =
          s.id === 'ada' ? <AdaScreen local={local} /> :
          s.id === 'camera' ? <CameraScreen local={local} /> :
          s.id === 'card' ? <CardScreen local={local} /> :
          s.id === 'upcycle' ? <UpcycleScreen local={local} /> :
          s.id === 'impact' ? <ImpactScreen local={local} /> :
          <AdaScreen local={local} celebrate />;
        return (
          <div key={s.id} style={{ position: 'absolute', inset: 0, transform: `translateX(${x}%) scale(${1 - exit * 0.06})`, opacity: 1 - exit * 0.6, filter: `brightness(${1 - exit * 0.25})` }}>
            {screen}
          </div>
        );
      })}
    </>
  );
}

function Phone() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = spring({ frame, fps, config: { damping: 18, mass: 1.1 } });
  const outroK = interpolate(frame, [705, 740], [0, 1], clamp);
  const rotY = Math.sin(frame / 45) * 7 * (1 - outroK) + (1 - intro) * -25;
  const rotZ = Math.sin(frame / 70) * 1.6;
  const y = Math.sin(frame / 32) * 10 + (1 - intro) * 120;
  const W = 400, H = 840, B = 13;
  const scale = (W - 2 * B) / SW;
  return (
    <div style={{ position: 'absolute', left: 960 - W / 2 + outroK * 230, top: 540 - H / 2, width: W, height: H, perspective: 1600 }}>
      <div style={{ width: W, height: H, transform: `translateY(${y}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${0.9 + intro * 0.1})`, transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 66, background: C.ink, boxShadow: '0 50px 90px rgba(24,32,27,0.35), 0 12px 24px rgba(24,32,27,0.2), inset 0 0 0 2px #3A4540' }} />
        <div style={{ position: 'absolute', left: B, top: B, width: W - 2 * B, height: H - 2 * B, borderRadius: 54, overflow: 'hidden', background: C.paper }}>
          <div style={{ width: SW, height: SH, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', fontFamily }}>
            <PhoneScreens />
          </div>
          <div style={{ position: 'absolute', top: 12, left: '50%', marginLeft: -55, width: 110, height: 32, borderRadius: 20, background: '#0B0F0C' }} />
        </div>
      </div>
    </div>
  );
}

function Cards() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const active = [...SCENES].reverse().find((s) => frame >= s.from)!;
  const hide = interpolate(frame, [700, 730], [0, 1], clamp);
  return (
    <div style={{ position: 'absolute', right: 110, top: 0, bottom: 0, width: 520, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, opacity: 1 - hide, transform: `translateX(${hide * 80}px)` }}>
      {CARDS.map((c, i) => {
        const appear = spring({ frame: frame - 10 - i * 5, fps, config: { damping: 18 } });
        const on = active.card === i;
        const since = on ? frame - active.from : 0;
        const k = on ? spring({ frame: since, fps, config: { damping: 14 } }) : 0;
        return (
          <div key={c.t} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderRadius: 26, background: on ? '#FFFFFF' : 'rgba(248,245,238,0.65)', border: `2.5px solid ${on ? c.color : 'transparent'}`, boxShadow: on ? '0 18px 40px rgba(24,32,27,0.12)' : 'none', transform: `translateX(${(1 - appear) * 60 - k * 14}px) scale(${1 + k * 0.03})`, opacity: appear * (on ? 1 : 0.55) }}>
            <div style={{ width: 62, height: 62, borderRadius: 18, background: on ? C.lime : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon i={i} color={C.ink} /></div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, color: C.ink }}>{c.t}</div>
              <div style={{ fontSize: 21, color: C.muted, marginTop: 2 }}>{c.d}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Backdrop() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <div style={{ position: 'absolute', left: 960 - 470, top: 540 - 470, width: 940, height: 940, borderRadius: 999, background: 'radial-gradient(circle, rgba(212,227,154,0.55) 0%, rgba(212,227,154,0.18) 45%, rgba(242,238,229,0) 70%)' }} />
      <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`rotate(${frame * 0.08} 960 540)`}>
          <circle cx="960" cy="540" r="560" fill="none" stroke={C.lineStrong} strokeWidth="2" strokeDasharray="2 14" strokeLinecap="round" />
          <circle cx="1520" cy="540" r="9" fill={C.moss} />
        </g>
        <g transform={`rotate(${-frame * 0.05} 960 540)`}>
          <circle cx="960" cy="540" r="760" fill="none" stroke={C.line} strokeWidth="2" strokeDasharray="2 18" strokeLinecap="round" />
          <circle cx="960" cy="-220" r="7" fill={C.brown} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 120, top: 70, display: 'flex', alignItems: 'center', gap: 14 }}>
        <Img src={staticFile('island-bowl.png')} style={{ width: 54, height: 54 }} />
        <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1, color: C.ink }}>Eco Island</span>
      </div>
    </AbsoluteFill>
  );
}

function Progress() {
  const frame = useCurrentFrame();
  return <div style={{ position: 'absolute', left: 0, bottom: 0, height: 6, width: `${(frame / TOTAL) * 100}%`, background: C.moss }} />;
}

export function Promo() {
  return (
    <AbsoluteFill style={{ fontFamily, color: C.ink }}>
      <Backdrop />
      {SCENES.map((s) => <LeftText key={s.id} s={s} />)}
      <Cards />
      <Phone />
      <Progress />
    </AbsoluteFill>
  );
}
