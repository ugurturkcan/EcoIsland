// Karbon ve su hesabı. Yapay zekâ yalnızca malzemeyi ve ağırlığı tahmin eder; sayılar bu tablodan gelir.
//
// KARBON — UK DESNZ/DEFRA "Greenhouse gas reporting: conversion factors 2025" (condensed set, 10 Haziran 2025),
//   "Material use" ve "Waste disposal" sayfaları. CO2e, IPCC AR5 GWP100 değerleriyle hesaplanmıştır.
//   https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025
//   Değerler kg CO2e / kg malzeme (tablodaki kg CO2e / ton ÷ 1000).
//
// SU — tek bir resmi tablo yoktur. Kaynağı olan değerler `waterSource` ile işaretlidir; diğerleri tahminidir
//   ve uygulamada "tahmini" diye gösterilir.
//   - PET: Water Footprint Network (2011), petrolden PET'e mavi+gri su ayak izi ≈ 235 L/kg.
//   - Kağıt/karton: EPA'nın sık atıf yapılan rakamı — 1 ton kağıdı geri dönüştürmek ≈ 7.000 galon (≈26.500 L) su tasarrufu.
//   - Pamuk: Water Footprint Network / Chapagain & Hoekstra — ≈ 10.000 L/kg (250 g tişört ≈ 2.700 L).
//   - Alüminyum: Aluminum Association — geri dönüşüm, birincil üretimin suyunun %95'ine kadarını tasarruf eder.

export type Material =
  | 'PET' | 'HDPE' | 'PP' | 'mixed_plastic' | 'glass' | 'aluminium' | 'steel'
  | 'paper' | 'cardboard' | 'cotton' | 'polyester' | 'wood' | 'other';

export const MATERIALS: Material[] = ['PET', 'HDPE', 'PP', 'mixed_plastic', 'glass', 'aluminium', 'steel', 'paper', 'cardboard', 'cotton', 'polyester', 'wood', 'other'];

type Bin = 'sarı (plastik)' | 'yeşil (cam)' | 'gri (metal)' | 'mavi (kağıt)' | 'tekstil kumbarası' | 'evsel atık';

interface Factor {
  label: string;
  defraRow: string;
  production: number;     // birincil malzeme üretimi, kg CO2e/kg
  recycledSource: number; // geri dönüştürülmüş kaynaktan üretim (kapalı döngü / yeniden kullanım), kg CO2e/kg
  landfill: number;       // düzenli depolama, kg CO2e/kg
  decompositionYears: number;
  bin: Bin;
  waterL: number;         // üretimin su kullanımı, L/kg
  recycleWaterSavedL: number; // geri dönüşümle kaçınılan su, L/kg
  waterSource: string | null; // null => tahmini
}

const RECYCLING_DISPOSAL = 0.00469; // DEFRA 2025 closed-loop disposal, kg CO2e/kg

export const FACTORS: Record<Material, Factor> = {
  PET:           { label: 'PET plastik', defraRow: 'Plastics: PET (incl. forming)', production: 3.864, recycledSource: 2.214, landfill: 0.00898, decompositionYears: 450, bin: 'sarı (plastik)', waterL: 235, recycleWaterSavedL: 118, waterSource: 'Water Footprint Network (2011)' },
  HDPE:          { label: 'HDPE plastik', defraRow: 'Plastics: HDPE (incl. forming)', production: 3.095, recycledSource: 1.771, landfill: 0.00898, decompositionYears: 500, bin: 'sarı (plastik)', waterL: 200, recycleWaterSavedL: 100, waterSource: null },
  PP:            { label: 'PP plastik', defraRow: 'Plastics: PP (incl. forming)', production: 2.578, recycledSource: 1.313, landfill: 0.00898, decompositionYears: 450, bin: 'sarı (plastik)', waterL: 200, recycleWaterSavedL: 100, waterSource: null },
  mixed_plastic: { label: 'Karışık plastik', defraRow: 'Plastics: average plastics', production: 3.172, recycledSource: 1.575, landfill: 0.00898, decompositionYears: 450, bin: 'sarı (plastik)', waterL: 220, recycleWaterSavedL: 110, waterSource: null },
  glass:         { label: 'Cam', defraRow: 'Glass', production: 1.403, recycledSource: 0.823, landfill: 0.00898, decompositionYears: 1000000, bin: 'yeşil (cam)', waterL: 20, recycleWaterSavedL: 8, waterSource: null },
  aluminium:     { label: 'Alüminyum', defraRow: 'Metal: aluminium cans and foil', production: 9.116, recycledSource: 0.995, landfill: 0.00898, decompositionYears: 200, bin: 'gri (metal)', waterL: 1200, recycleWaterSavedL: 1140, waterSource: 'Aluminum Association (%95 tasarruf)' },
  steel:         { label: 'Teneke / çelik', defraRow: 'Metal: steel cans', production: 2.864, recycledSource: 1.824, landfill: 0.00898, decompositionYears: 50, bin: 'gri (metal)', waterL: 40, recycleWaterSavedL: 16, waterSource: null },
  paper:         { label: 'Kağıt', defraRow: 'Paper and board: paper', production: 1.345, recycledSource: 1.050, landfill: 1.164, decompositionYears: 0.2, bin: 'mavi (kağıt)', waterL: 54, recycleWaterSavedL: 26.5, waterSource: 'EPA (7.000 galon/ton)' },
  cardboard:     { label: 'Karton', defraRow: 'Paper and board: board', production: 1.200, recycledSource: 1.098, landfill: 1.164, decompositionYears: 0.2, bin: 'mavi (kağıt)', waterL: 54, recycleWaterSavedL: 26.5, waterSource: 'EPA (7.000 galon/ton)' },
  cotton:        { label: 'Pamuk tekstil', defraRow: 'Clothing', production: 22.31, recycledSource: 0.152, landfill: 0.497, decompositionYears: 0.5, bin: 'tekstil kumbarası', waterL: 10000, recycleWaterSavedL: 10000, waterSource: 'Water Footprint Network' },
  polyester:     { label: 'Polyester tekstil', defraRow: 'Clothing', production: 22.31, recycledSource: 0.152, landfill: 0.497, decompositionYears: 200, bin: 'tekstil kumbarası', waterL: 60, recycleWaterSavedL: 60, waterSource: null },
  wood:          { label: 'Ahşap', defraRow: 'Wood', production: 0.270, recycledSource: 0.0385, landfill: 0.925, decompositionYears: 15, bin: 'evsel atık', waterL: 30, recycleWaterSavedL: 10, waterSource: null },
  other:         { label: 'Diğer', defraRow: 'Plastics: average plastics (yaklaşık)', production: 3.172, recycledSource: 1.575, landfill: 0.00898, decompositionYears: 100, bin: 'evsel atık', waterL: 100, recycleWaterSavedL: 30, waterSource: null },
};

export const CAR_KG_PER_KM = 0.17304; // DEFRA 2025 "Average car", kg CO2e/km

export function carbonCard(material: Material, weightG: number) {
  const f = FACTORS[material] ?? FACTORS.other;
  const kg = Math.max(0, weightG) / 1000;
  const g = (kgCo2PerKg: number) => Math.max(0, Math.round(kg * kgCo2PerKg * 1000));
  const productionG = g(f.production);
  return {
    materialLabel: f.label,
    bin: f.bin,
    productionG,
    carMeters: Math.round((productionG / 1000 / CAR_KG_PER_KM) * 1000),
    decompositionYears: f.decompositionYears,
    // Kaçınılan emisyon = seçilen yol ile "çöpe at" (düzenli depolama + yeniden yeni malzeme üretimi) arasındaki fark.
    avoided: {
      // Kapalı döngü: yeni ürün geri dönüştürülmüş kaynaktan üretilir + depolama emisyonu önlenir.
      recycleG: g(f.production - f.recycledSource + f.landfill - RECYCLING_DISPOSAL),
      // Yeniden kullanım: eşya yeni bir ürünün yerine geçer + depolama emisyonu önlenir.
      upcycleG: g(f.production + f.landfill),
      trashG: 0,
    },
    water: {
      productionL: Math.round(kg * f.waterL * 10) / 10,
      savedRecycleL: Math.round(kg * f.recycleWaterSavedL * 10) / 10,
      savedUpcycleL: Math.round(kg * f.waterL * 10) / 10,
      source: f.waterSource,
      estimated: f.waterSource === null,
    },
    source: { carbon: `DEFRA/DESNZ 2025 · ${f.defraRow} · IPCC AR5 GWP100`, water: f.waterSource ?? 'Tahmini değer' },
  };
}

export function decompositionLabel(years: number) {
  if (years >= 100000) return '1 milyon yıl';
  if (years >= 1) return `${Math.round(years)} yıl`;
  const weeks = Math.max(1, Math.round(years * 52));
  return `${weeks} hafta`;
}
