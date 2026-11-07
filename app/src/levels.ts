export const LEVELS = [
  { n: 1, name: 'Atık Kıran', minKg: 0 },
  { n: 2, name: 'Yol Açıcı', minKg: 0.3 },
  { n: 3, name: 'Yuva Kuran', minKg: 1.5 },
  { n: 4, name: 'Yaban Koruyucusu', minKg: 5 },
  { n: 5, name: 'Ada Bilgesi', minKg: 10 },
];

/** Her 5 kg kaçınılan CO2e için sponsor fonuyla bir gerçek fidan (demo modunda). */
export const KG_PER_SAPLING = 5;

export function levelFor(avoidedG: number) {
  const kg = avoidedG / 1000;
  let cur = LEVELS[0];
  for (const l of LEVELS) if (kg >= l.minKg) cur = l;
  const next = LEVELS.find((l) => l.minKg > kg) ?? null;
  const progress = next ? (kg - cur.minKg) / (next.minKg - cur.minKg) : 1;
  return { ...cur, next, progress: Math.max(0, Math.min(1, progress)), kg };
}

export function saplingsFor(avoidedG: number) {
  return Math.floor(avoidedG / 1000 / KG_PER_SAPLING);
}

export function fmtKg(g: number) {
  return (g / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: g < 10000 ? 1 : 0 });
}
