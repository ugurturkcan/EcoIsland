// Uçtan uca test: çalışan sunucuya gerçek isteklerle akışı dener.
// Kullanım: npm run test:e2e   (sunucu http://localhost:8787 üzerinde çalışıyor olmalı)
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const API = process.env.API_URL || 'http://localhost:8787';
const FIX = new URL('../fixtures/', import.meta.url);
mkdirSync(FIX, { recursive: true });
const argPath = process.argv[2];
const bottlePath = argPath ? pathToFileURL(argPath) : new URL('pet-bottle.png', FIX);

async function post(path: string, body: unknown) {
  const t0 = Date.now();
  const res = await fetch(API + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const json = await res.json();
  console.log(`${path} → ${res.status} in ${Date.now() - t0}ms`);
  if (!res.ok) throw new Error(`${path}: ${JSON.stringify(json)}`);
  return json;
}

if (!existsSync(bottlePath)) {
  console.log('Test fotoğrafı üretiliyor…');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image',
    contents: 'A realistic smartphone photo of an empty 0.5 liter clear plastic PET water bottle with a blue cap standing on a wooden kitchen table, natural daylight, no text.',
    config: { responseModalities: ['IMAGE'] },
  });
  const part = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData?.data) throw new Error('Test fotoğrafı üretilemedi');
  writeFileSync(bottlePath, Buffer.from(part.inlineData.data, 'base64'));
}

const ext = bottlePath.pathname.split('.').pop()?.toLowerCase();
const image = { data: readFileSync(bottlePath).toString('base64'), mimeType: ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png' };

const scan = await post('/identify', { image });
console.log('  ', scan.item.name, scan.item.material, `${scan.item.weightG} g`, '→', `${scan.carbon.productionG} g CO2e`, scan.carbon.decompositionLabel, 'suspicious:', scan.flags.suspicious);

const { ideas } = await post('/ideas', { name: scan.item.name, material: scan.item.material, condition: scan.item.condition });
console.log('  ideas:', ideas.map((i: { title_tr: string }) => i.title_tr).join(' | '));

let viz: { image: { data: string; mimeType: string } } | null = null;
try {
  viz = await post('/visualize', { image, visualPrompt: ideas[0].visual_prompt_en });
  writeFileSync(new URL('preview.png', FIX), Buffer.from(viz!.image.data, 'base64'));
  console.log('   preview saved → fixtures/preview.png');
} catch (e) { console.log('   visualize atlandı:', (e as Error).message.slice(0, 160)); }

if (viz) {
const ok = await post('/verify', { image: viz.image, expected: `"${scan.item.name}" eşyası "${ideas[0].title_tr}" ürününe dönüştürüldü` });
console.log('   verify (dönüşmüş görsel):', ok.accepted, ok.confidence, ok.reason_tr);
}

const bad = await post('/verify', { image, expected: `"${scan.item.name}" eşyası "${ideas[0].title_tr}" ürününe dönüştürüldü` });
console.log('   verify (dönüşmemiş şişe, red beklenir):', bad.accepted, bad.reason_tr);

const coach = await post('/coach', { summary: `${scan.item.name} → yeni hayat` });
console.log('  ', coach.quest_tr);
