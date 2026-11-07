// Uygulamanın ekranları (Expo uygulamasıyla aynı tasarım), 390×852 mantıksal boyutta çizilir.
import type { CSSProperties, ReactNode } from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, fontFamily } from './theme';

export const SW = 390;
export const SH = 852;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const fmt = (n: number, d = 1) => n.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });

function Status({ dark }: { dark?: boolean }) {
  const c = dark ? C.onInk : C.ink;
  return (
    <div style={{ position: 'absolute', top: 14, left: 28, right: 28, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, color: c, zIndex: 5 }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ width: 17, height: 11, borderRadius: 2, border: `1.5px solid ${c}`, position: 'relative' }}><span style={{ position: 'absolute', inset: 1.5, right: 4, background: c, borderRadius: 1 }} /></span>
      </span>
    </div>
  );
}

function TabBar({ active }: { active: number }) {
  const items = ['Ada', 'Etki', '', 'Profil'];
  return (
    <div style={{ position: 'absolute', left: 23, right: 23, bottom: 22, height: 64, borderRadius: 999, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
      {items.map((t, i) =>
        t ? (
          <div key={t} style={{ fontSize: 11, fontWeight: 500, color: i === active ? C.onInk : '#8F9891', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 20, height: 3, borderRadius: 2, background: i === active ? C.lime : 'transparent' }} />
            {t}
          </div>
        ) : (
          <div key="add" style={{ width: 52, height: 52, borderRadius: 26, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
          </div>
        ),
      )}
    </div>
  );
}

const Label = ({ children, color = C.muted, style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div style={{ fontSize: 12, fontWeight: 600, color, ...style }}>{children}</div>
);

function Bottle({ w = 40 }: { w?: number }) {
  return (
    <svg width={w} height={w * 2.1} viewBox="0 0 40 84">
      <rect x="14" y="2" width="12" height="9" rx="2" fill="#3D7FBF" />
      <path d="M12 11h16c3 7 9 12 9 24v40c0 5-3 7-7 7H10c-4 0-7-2-7-7V35c0-12 6-17 9-24z" fill="#FFFFFF" opacity="0.75" />
      <rect x="3" y="44" width="34" height="18" fill={C.moss} opacity="0.85" />
    </svg>
  );
}

/* ---------- 1. Ada: Sıfır Atık Ustası ---------- */
export function AdaScreen({ local, celebrate }: { local: number; celebrate?: boolean }) {
  const { fps } = useVideoConfig();
  const float = Math.sin(local / 22) * 8;
  const pop = celebrate ? spring({ frame: local - 20, fps, config: { damping: 11 } }) : 0;
  const zoom = celebrate ? interpolate(local, [0, 120], [1, 1.12], clamp) : 1;
  const prog = interpolate(local, [10, 50], [0.6, 1], clamp);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#8CCDEB 0%,#D7F0F7 46%,#7FCBDD 60%,#2C88B8 100%)', overflow: 'hidden' }}>
      <Status />
      <div style={{ position: 'absolute', left: -60, top: -40, width: 260, height: 260, borderRadius: 999, background: 'radial-gradient(circle,#FFF6D2 0%,rgba(255,246,210,0) 70%)' }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', top: 110 + i * 26, left: ((local * (0.6 + i * 0.25) + i * 140) % 520) - 80, width: 90 - i * 18, height: 22 - i * 4, borderRadius: 999, background: '#FFFFFF', opacity: 0.7, filter: 'blur(4px)' }} />
      ))}
      <Img src={staticFile('island-bowl.png')} style={{ position: 'absolute', left: 25, top: 150, width: 340, height: 340, transform: `translateY(${float}px) scale(${zoom})` }} />
      <div style={{ position: 'absolute', top: 54, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.paper, borderRadius: 999, padding: '6px 12px 6px 6px' }}>
          <Img src={staticFile('island-bowl.png')} style={{ width: 26, height: 26 }} />
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>Eco Island</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, background: C.paper, borderRadius: 999, padding: '7px 11px' }}>3D dünya</span>
      </div>
      {celebrate && (
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${pop})` }}>
          <span style={{ background: C.lime, color: C.ink, fontWeight: 700, fontSize: 14, borderRadius: 999, padding: '8px 14px' }}>Seviye atladın!</span>
        </div>
      )}
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 98, background: C.paper, borderRadius: 26, padding: 18 }}>
        <Label>Seviye 5 / 5 · şu an</Label>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, marginTop: 3 }}>Sıfır Atık Ustası</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>12,4 kg CO₂e · 46 eşya · 2 gerçek fidan</div>
        <div style={{ height: 6, background: C.line, borderRadius: 3, marginTop: 11, overflow: 'hidden' }}>
          <div style={{ width: `${prog * 100}%`, height: 6, background: C.moss, borderRadius: 3 }} />
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 13 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} style={{ flex: 1, height: 38, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, background: n === 5 ? C.ink : 'transparent', color: n === 5 ? C.onInk : C.ink, border: `1px solid ${n === 5 ? C.ink : C.lineStrong}` }}>{n}</div>
          ))}
        </div>
      </div>
      <TabBar active={0} />
    </div>
  );
}

/* ---------- 2. Kamera ---------- */
export function CameraScreen({ local }: { local: number }) {
  const { fps } = useVideoConfig();
  const scanY = interpolate(local % 60, [0, 60], [150, 520]);
  const found = spring({ frame: local - 45, fps, config: { damping: 14 } });
  const shutter = 1 + Math.max(0, Math.sin(local / 6)) * 0.04;
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.ink, color: C.onInk }}>
      <Status dark />
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.onInkMuted }}>Yeni eşya</div>
      <div style={{ position: 'absolute', top: 84, left: 14, right: 14, height: 600, borderRadius: 30, background: '#2A332D', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: '#3B3328' }} />
        <div style={{ position: 'absolute', left: 123, top: 170 }}><Bottle w={115} /></div>
        {[['left', 'top'], ['right', 'top'], ['left', 'bottom'], ['right', 'bottom']].map(([h, v]) => (
          <div key={h + v} style={{ position: 'absolute', [h]: 44, [v]: 60, width: 30, height: 30, borderColor: C.lime, borderStyle: 'solid', borderWidth: 0, [`border${v === 'top' ? 'Top' : 'Bottom'}Width`]: 3, [`border${h === 'left' ? 'Left' : 'Right'}Width`]: 3, borderRadius: 6 } as CSSProperties} />
        ))}
        <div style={{ position: 'absolute', left: 50, right: 50, top: scanY, height: 2, background: C.lime, boxShadow: `0 0 18px 4px ${C.lime}`, opacity: 1 - found * 0.9 }} />
        <div style={{ position: 'absolute', top: 110, left: 70, transform: `scale(${found})`, background: C.paper, color: C.ink, borderRadius: 999, padding: '6px 12px 6px 9px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: C.moss }} /> PET şişe · %94
        </div>
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, background: C.ink, borderRadius: 18, padding: 13 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.sky }}>{found > 0.5 ? 'Tanındı · PET plastik · ~22 g' : 'Yapay zekâ bakıyor…'}</div>
          <div style={{ fontSize: 12.5, color: C.onInkMuted, marginTop: 4 }}>Malzeme, ağırlık ve güven skoru saniyeler içinde.</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 54, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 74, height: 74, borderRadius: 37, border: `3px solid ${C.onInk}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${shutter})` }}>
          <div style={{ width: 58, height: 58, borderRadius: 29, background: C.lime }} />
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Nesne kartı ---------- */
export function CardScreen({ local }: { local: number }) {
  const g = interpolate(local, [10, 55], [0, 85], { ...clamp });
  const l = interpolate(local, [18, 60], [0, 5.2], { ...clamp });
  const t = interpolate(local, [30, 70], [0, 1], clamp);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.paper, color: C.ink }}>
      <Status />
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.muted }}>Nesne kartı</div>
      <div style={{ position: 'absolute', top: 86, left: 18, right: 18 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ width: 86, height: 108, borderRadius: 18, background: C.sky, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bottle w={38} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label color={C.skyInk}>AI tanıdı · %94</Label>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15 }}>PET su şişesi 0,5 L</div>
            <div style={{ display: 'flex', gap: 5 }}>
              {['PET plastik', '~22 g'].map((s) => <span key={s} style={{ fontSize: 11, fontWeight: 500, border: `1px solid ${C.line}`, borderRadius: 999, padding: '4px 8px' }}>{s}</span>)}
              <span style={{ fontSize: 11, fontWeight: 600, background: '#F3D96B', borderRadius: 999, padding: '4px 8px' }}>sarı kutu</span>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: C.line, margin: '22px 0 16px' }} />
        <Label>Üretim bedeli</Label>
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 50, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{Math.round(g)}<span style={{ fontSize: 17, fontWeight: 500, letterSpacing: 0 }}> g CO₂e</span></div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>≈ arabayla 491 m</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 50, fontWeight: 700, letterSpacing: -2, lineHeight: 1, color: C.water }}>{fmt(l)}<span style={{ fontSize: 17, fontWeight: 500, letterSpacing: 0 }}> L su</span></div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4 }}>üretimde kullanılan</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 9, marginTop: 20, opacity: t, transform: `translateY(${(1 - t) * 20}px)` }}>
          <div style={{ flex: 1, background: C.ink, color: C.onInk, borderRadius: 22, padding: 15 }}>
            <div style={{ fontSize: 23, fontWeight: 700 }}>450 yıl</div>
            <div style={{ fontSize: 11.5, color: C.onInkMuted, marginTop: 4 }}>çöpe giderse doğada kalma süresi</div>
          </div>
          <div style={{ flex: 1, background: C.sand, borderRadius: 22, padding: 15 }}>
            <div style={{ fontSize: 23, fontWeight: 700 }}>85 g</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4 }}>yeni hayat verirsen kaçınılır · 5,2 L su</div>
          </div>
        </div>
        <div style={{ marginTop: 14, background: C.raised, border: `1px solid ${C.line}`, borderRadius: 12, padding: 11, fontSize: 11, color: C.inkSoft, opacity: t }}>
          Karbon: DEFRA/DESNZ 2025 · IPCC AR5 GWP100<br />Su: Water Footprint Network
        </div>
      </div>
      <div style={{ position: 'absolute', left: 18, right: 18, bottom: 34, height: 56, borderRadius: 999, background: C.ink, color: C.onInk, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 7px 0 22px', fontSize: 15, fontWeight: 600 }}>
        Kaderini sen seç
        <span style={{ width: 42, height: 42, borderRadius: 21, background: C.lime, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>→</span>
      </div>
    </div>
  );
}

/* ---------- 4. Yeni hayat ---------- */
export function UpcycleScreen({ local }: { local: number }) {
  const { fps } = useVideoConfig();
  const steps = ['Şişeyi yıka, etiketini sök, kurut.', 'Kapağa küçük bir delik aç.', 'Pilli LED peri ışığını içine yerleştir.', 'Pil kutusunu kapağa sabitle, ışığı yak.'];
  const glow = 0.45 + 0.25 * Math.sin(local / 7);
  const press = spring({ frame: local - 118, fps, config: { damping: 12 } });
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.paper, color: C.ink }}>
      <Status />
      <div style={{ position: 'absolute', top: 52, left: 0, right: 0, textAlign: 'center', fontSize: 12, fontWeight: 600, color: C.muted }}>Yeni hayat ver</div>
      <div style={{ position: 'absolute', top: 82, left: 18, right: 18 }}>
        <Label color={C.skyInk}>Yapay zekâ 3 fikir üretti</Label>
        <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
          {['Gece lambası', 'Mini saksı', 'Kalemlik'].map((s, i) => (
            <span key={s} style={{ fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: '9px 13px', background: i === 0 ? C.ink : 'transparent', color: i === 0 ? C.onInk : C.ink, border: `1px solid ${i === 0 ? C.ink : C.lineStrong}`, opacity: interpolate(local, [i * 6, i * 6 + 12], [0, 1], clamp) }}>{s}</span>
          ))}
        </div>
        <div style={{ marginTop: 14, height: 236, borderRadius: 26, background: C.sky, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <Img src={staticFile('lamba.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 58%', transform: `scale(${1.08 - interpolate(local, [0, 150], [0, 0.08], clamp)})`, opacity: interpolate(local, [4, 16], [0, 1], clamp), filter: `brightness(${1 + glow * 0.12})` }} />
          <span style={{ position: 'absolute', top: 12, left: 12, background: C.raised, color: C.skyInk, fontSize: 11, fontWeight: 600, borderRadius: 999, padding: '5px 9px' }}>AI önizleme · senin şişen</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginTop: 14 }}>Şişeden gece lambası</div>
        <div style={{ marginTop: 6 }}>
          {steps.map((s, i) => {
            const a = interpolate(local, [30 + i * 12, 44 + i * 12], [0, 1], clamp);
            return (
              <div key={s} style={{ display: 'flex', gap: 12, padding: '8px 0', borderTop: `1px solid ${C.line}`, fontSize: 13, color: C.inkSoft, opacity: a, transform: `translateX(${(1 - a) * 24}px)` }}>
                <span style={{ fontWeight: 700, color: C.moss, width: 12 }}>{i + 1}</span>{s}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 18, right: 18, bottom: 34, height: 56, borderRadius: 999, background: C.ink, color: C.onInk, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 7px 0 22px', fontSize: 15, fontWeight: 600, transform: `scale(${1 - press * 0.04 + press * 0.04 * Math.min(1, Math.max(0, (local - 128) / 6))})` }}>
        Yaptım, adama ekle
        <span style={{ width: 42, height: 42, borderRadius: 21, background: C.lime, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>✓</span>
      </div>
    </div>
  );
}

/* ---------- 5. Etki ---------- */
export function ImpactScreen({ local }: { local: number }) {
  const kg = interpolate(local, [8, 60], [12.3, 12.4], clamp);
  const water = interpolate(local, [8, 60], [0, 168], clamp);
  const bar = interpolate(local, [20, 70], [0, 1], clamp);
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.paper, color: C.ink }}>
      <Status />
      <div style={{ position: 'absolute', top: 54, left: 18, right: 18 }}>
        <Label>Etkin</Label>
        <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.12, marginTop: 4 }}>Bugüne kadar <span style={{ color: C.moss }}>kurtardıkların.</span></div>
        <div style={{ marginTop: 14, background: C.ink, color: C.onInk, borderRadius: 22, padding: 17 }}>
          <Label color={C.lime}>Kaçınılan karbon</Label>
          <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -1.8, lineHeight: 1.05, marginTop: 4 }}>{fmt(kg)}<span style={{ fontSize: 19, fontWeight: 500, letterSpacing: 0 }}> kg CO₂e</span></div>
          <div style={{ fontSize: 12, color: C.onInkMuted, marginTop: 5 }}>Bir arabayla 72 km yol gitmemek kadar.</div>
          <div style={{ height: 1, background: '#3A4540', margin: '13px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div><div style={{ fontSize: 16, fontWeight: 600 }}>2 gerçek fidan</div><div style={{ fontSize: 11, color: C.onInkMuted }}>Sonrakine 2,6 kg · demo</div></div>
            <span style={{ fontSize: 11, color: C.lime }}>Hedef ortak: TEMA</span>
          </div>
          <div style={{ height: 5, background: '#3A4540', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}><div style={{ width: `${48 * bar}%`, height: 5, background: C.lime }} /></div>
        </div>
        <div style={{ display: 'flex', gap: 9, marginTop: 9 }}>
          <div style={{ flex: 1, background: C.sky, borderRadius: 22, padding: 14 }}>
            <Label color={C.skyInk}>Kaçınılan su</Label>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{Math.round(water)}<span style={{ fontSize: 15, fontWeight: 500 }}> L</span></div>
            <div style={{ fontSize: 11, color: C.skyInk }}>≈ {Math.round(water / 0.5)} pet şişe su</div>
          </div>
          <div style={{ flex: 1, background: C.sand, borderRadius: 22, padding: 14 }}>
            <Label>Kurtarılan eşya</Label>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>46</div>
            <div style={{ fontSize: 11, color: C.muted }}>51 eşya tarandı</div>
          </div>
        </div>
        <Label style={{ marginTop: 18 }}>Seçimlerin</Label>
        <div style={{ display: 'flex', gap: 2, height: 9, borderRadius: 5, overflow: 'hidden', marginTop: 8 }}>
          <div style={{ flex: 18 * bar + 0.01, background: C.moss }} /><div style={{ flex: 28 * bar + 0.01, background: C.water }} /><div style={{ flex: 5 * bar + 0.01, background: C.clay }} /><div style={{ flex: 51 * (1 - bar) + 0.01, background: C.line }} />
        </div>
        {[['Yeni hayat', '18 eşya', C.moss], ['Geri dönüşüm', '28 eşya', C.water], ['Çöp', '5 eşya', C.clay]].map(([a, b, c]) => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 0', borderBottom: `1px solid ${C.line}`, fontSize: 13.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: c }} /><span style={{ flex: 1 }}>{a}</span><span style={{ fontWeight: 600 }}>{b}</span>
          </div>
        ))}
      </div>
      <TabBar active={1} />
    </div>
  );
}

export const screenStyle = { fontFamily };
