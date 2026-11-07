// Tüm model çağrıları bu adaptörden geçer; sağlayıcı değiştirmek tek dosyalık iştir.
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
export const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash';
export const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';

// Bir model meşgul (503/504), kotası dolu (429) ya da kapalıysa (404) sıradakine geçilir.
const TEXT_CHAIN = unique([TEXT_MODEL, 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-flash-lite']);
const IMAGE_CHAIN = unique([IMAGE_MODEL, 'gemini-nano-banana-2.1', 'gemini-2.5-flash-image', 'gemini-3.1-flash-lite-image']);

let client: GoogleGenAI | null = null;
function ai() {
  if (!apiKey) throw new AiError('GEMINI_API_KEY tanımlı değil. server/.env dosyasına ekleyin.', 500);
  client ??= new GoogleGenAI({ apiKey, httpOptions: { timeout: 25000 } });
  return client;
}

export class AiError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

export interface ImageInput { data: string; mimeType: string }

/** Görsel(ler) + metin istemi gönderir, JSON şemasına uyan nesne döndürür. */
export async function askJson<T>(prompt: string, schema: object, images: ImageInput[] = []): Promise<T> {
  return withFallback(TEXT_CHAIN, async (model) => {
    const res = await ai().models.generateContent({
      model,
      contents: [{ role: 'user', parts: [...images.map((i) => ({ inlineData: i })), { text: prompt }] }],
      config: { responseMimeType: 'application/json', responseJsonSchema: schema, temperature: 0.4 },
    });
    const text = res.text;
    if (!text) throw new AiError('Model boş yanıt döndürdü.');
    return JSON.parse(text) as T;
  });
}

/** Fotoğrafı ve dönüşüm tarifini verip düzenlenmiş görseli (base64) döndürür. */
export async function editImage(prompt: string, image: ImageInput): Promise<ImageInput> {
  return withFallback(IMAGE_CHAIN, async (model) => {
    const res = await ai().models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ inlineData: image }, { text: prompt }] }],
      config: { responseModalities: ['IMAGE', 'TEXT'] },
    });
    const parts = res.candidates?.[0]?.content?.parts ?? [];
    const img = parts.find((p) => p.inlineData?.data);
    if (!img?.inlineData?.data) throw new AiError('Model görsel üretmedi.');
    return { data: img.inlineData.data, mimeType: img.inlineData.mimeType || 'image/png' };
  });
}

async function withFallback<T>(chain: string[], call: (model: string) => Promise<T>): Promise<T> {
  let last: unknown;
  for (const model of chain) {
    try {
      const t0 = Date.now();
      const out = await call(model);
      console.log(`[ai] ${model} ok ${Date.now() - t0}ms`);
      return out;
    } catch (err) {
      last = err;
      const msg = err instanceof Error ? err.message : String(err);
      const retryable = /\b(503|504|429|404|500)\b|UNAVAILABLE|DEADLINE_EXCEEDED|RESOURCE_EXHAUSTED|NOT_FOUND|no longer available|timed? ?out|aborted/i.test(msg);
      console.warn(`[ai] ${model} failed: ${msg.slice(0, 160)}`);
      if (!retryable) break;
    }
  }
  throw toAiError(last);
}

function unique(xs: string[]) { return [...new Set(xs.filter(Boolean))]; }

function toAiError(err: unknown): AiError {
  if (err instanceof AiError) return err;
  const msg = err instanceof Error ? err.message : String(err);
  if (/429|quota|RESOURCE_EXHAUSTED/i.test(msg)) return new AiError('Ücretsiz kota doldu, biraz sonra tekrar deneyin.', 429);
  if (/503|UNAVAILABLE|high demand/i.test(msg)) return new AiError('Yapay zekâ şu an çok yoğun, birkaç saniye sonra tekrar dene.', 503);
  return new AiError(`AI hatası: ${msg.slice(0, 300)}`, 502);
}
