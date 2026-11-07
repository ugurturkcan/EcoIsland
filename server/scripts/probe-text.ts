import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 30000 } });
for (const model of ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']) {
  const t0 = Date.now();
  try {
    const r = await ai.models.generateContent({ model, contents: 'Reply with the single word: tamam' });
    console.log(model, 'OK', Date.now() - t0, 'ms', JSON.stringify(r.text?.trim()));
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    console.log(model, 'ERR', Date.now() - t0, 'ms', m.match(/"code":(\d+)/)?.[1] ?? '', /limit: 0/.test(m) ? 'free-tier limit 0' : m.slice(0, 90));
  }
}
