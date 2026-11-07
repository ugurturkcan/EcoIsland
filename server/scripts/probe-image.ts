import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
for (const model of ['gemini-nano-banana-2.1', 'gemini-2.5-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3-pro-image']) {
  try {
    const r = await ai.models.generateContent({ model, contents: 'A small green leaf icon on white background.', config: { responseModalities: ['IMAGE'] } });
    const ok = r.candidates?.[0]?.content?.parts?.some((p) => p.inlineData?.data);
    console.log(model, ok ? 'OK (image returned)' : 'no image');
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    const code = m.match(/"code":(\d+)/)?.[1];
    const limit0 = /limit: 0/.test(m);
    console.log(model, 'ERROR', code, limit0 ? '(free tier limit 0)' : m.slice(0, 120));
  }
}
