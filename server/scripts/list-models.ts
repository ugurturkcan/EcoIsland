import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pager = await ai.models.list({ config: { pageSize: 200 } });
const names: string[] = [];
for await (const m of pager) names.push(`${m.name} ${JSON.stringify(m.supportedActions ?? [])}`);
console.log(names.filter((n) => !/embed|aqa|tts|audio|live|veo|imagen/i.test(n)).join('\n'));
console.log('total', names.length);
