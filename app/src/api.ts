// Backend adresi: app/.env içinde EXPO_PUBLIC_API_URL (telefonun erişebileceği LAN IP'si ya da deploy URL'si).
const BASE = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787').replace(/\/$/, '');

export interface Img { data: string; mimeType: string }

export interface IdentifyResult {
  item: { name: string; size: string; material: string; weightG: number; count: number; condition: string; confidence: number };
  carbon: {
    materialLabel: string; bin: string; productionG: number; carMeters: number;
    decompositionYears: number; decompositionLabel: string;
    avoided: { recycleG: number; upcycleG: number; trashG: number };
    water: { productionL: number; savedRecycleL: number; savedUpcycleL: number; source: string | null; estimated: boolean };
    source: { carbon: string; water: string };
  };
  flags: { suspicious: boolean; reason: string };
}

export interface Idea {
  title_tr: string; pitch_tr: string; difficulty: string; minutes: number;
  materials_tr: string[]; steps_tr: string[]; visual_prompt_en: string;
}

export interface VerifyResult { match: boolean; confidence: number; suspicious: boolean; duplicate: boolean; accepted: boolean; reason_tr: string }

async function post<T>(path: string, body: unknown, timeoutMs = 45000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Sunucu hatası (${res.status})`);
    return json as T;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') throw new Error('Sunucu yanıt vermedi. Bağlantını kontrol et.');
    if (e instanceof TypeError) throw new Error(`Sunucuya ulaşılamadı (${BASE}). EXPO_PUBLIC_API_URL ayarını kontrol et.`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  identify: (image: Img) => post<IdentifyResult>('/identify', { image }),
  ideas: (name: string, material: string, condition: string) => post<{ ideas: Idea[] }>('/ideas', { name, material, condition }),
  visualize: (image: Img, visualPrompt: string) => post<{ image: Img }>('/visualize', { image, visualPrompt }, 90000),
  verify: (image: Img, expected: string) => post<VerifyResult>('/verify', { image, expected }),
  coach: (summary: string) => post<{ message_tr: string; quest_tr: string }>('/coach', { summary }),
};
