import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { AiError, askJson, editImage, IMAGE_MODEL, TEXT_MODEL } from './ai.js';
import { carbonCard, decompositionLabel, FACTORS, type Material } from './carbon.js';
import * as P from './prompts.js';

const app = new Hono();
app.use('*', cors());

const image = z.object({ data: z.string().min(100), mimeType: z.string().regex(/^image\//) });
const recent = new Map<string, number>(); // tekrar gönderilen fotoğraf önlemi (basit)

function fingerprint(b64: string) {
  let h = 0;
  for (let i = 0; i < b64.length; i += 97) h = (h * 31 + b64.charCodeAt(i)) | 0;
  return `${b64.length}:${h}`;
}

app.get('/health', (c) => c.json({ ok: true, textModel: TEXT_MODEL, imageModel: IMAGE_MODEL, hasKey: !!process.env.GEMINI_API_KEY }));

app.post('/identify', async (c) => {
  const { image: img } = z.object({ image }).parse(await c.req.json());
  const fp = fingerprint(img.data);
  const duplicate = recent.has(fp);
  recent.set(fp, Date.now());
  type R = { is_object: boolean; name_tr: string; size_tr?: string; material: Material; est_weight_g: number; count: number; condition: string; confidence: number; suspicious: boolean; suspicious_reason?: string };
  const r = await askJson<R>(P.identifyPrompt, P.identifySchema, [img]);
  if (!r.is_object) return c.json({ error: 'Fotoğrafta bir eşya bulamadım. Eşyayı çerçevenin ortasına al.' }, 422);
  const weight = r.est_weight_g * Math.max(1, r.count);
  const card = carbonCard(r.material, weight);
  return c.json({
    item: { name: r.name_tr, size: r.size_tr || '', material: r.material, weightG: Math.round(weight), count: r.count, condition: r.condition, confidence: r.confidence },
    carbon: { ...card, decompositionLabel: decompositionLabel(card.decompositionYears) },
    flags: { suspicious: r.suspicious || duplicate, reason: duplicate ? 'Bu fotoğraf daha önce gönderilmiş.' : r.suspicious_reason || '' },
  });
});

app.post('/ideas', async (c) => {
  const body = z.object({ name: z.string(), material: z.string(), condition: z.string().default('sağlam') }).parse(await c.req.json());
  const label = FACTORS[body.material as Material]?.label ?? body.material;
  const r = await askJson<{ ideas: unknown[] }>(P.ideasPrompt(body.name, label, body.condition), P.ideasSchema);
  return c.json(r);
});

app.post('/visualize', async (c) => {
  const body = z.object({ image, visualPrompt: z.string().min(5) }).parse(await c.req.json());
  const out = await editImage(P.visualizePrompt(body.visualPrompt), body.image);
  return c.json({ image: out });
});

app.post('/verify', async (c) => {
  const body = z.object({ image, expected: z.string().min(3) }).parse(await c.req.json());
  const fp = fingerprint(body.image.data);
  const duplicate = recent.has(fp);
  recent.set(fp, Date.now());
  const r = await askJson<{ match: boolean; confidence: number; suspicious: boolean; reason_tr: string }>(P.verifyPrompt(body.expected), P.verifySchema, [body.image]);
  const accepted = r.match && !r.suspicious && !duplicate && r.confidence >= 0.6;
  return c.json({ ...r, duplicate, accepted, reason_tr: duplicate ? 'Bu fotoğraf daha önce gönderilmiş, yeni bir fotoğraf çek.' : r.reason_tr });
});

app.post('/coach', async (c) => {
  const body = z.object({ summary: z.string().max(2000).default('') }).parse(await c.req.json());
  return c.json(await askJson(P.coachPrompt(body.summary), P.coachSchema));
});

app.onError((err, c) => {
  if (err instanceof z.ZodError) return c.json({ error: 'Geçersiz istek', details: err.issues.slice(0, 3) }, 400);
  if (err instanceof AiError) return c.json({ error: err.message }, err.status as 429 | 500 | 502);
  console.error(err);
  return c.json({ error: 'Sunucu hatası' }, 500);
});

const port = Number(process.env.PORT || 8787);
serve({ fetch: app.fetch, port, hostname: '0.0.0.0' }, () => console.log(`Adacık API http://localhost:${port}  (text: ${TEXT_MODEL}, image: ${IMAGE_MODEL})`));
