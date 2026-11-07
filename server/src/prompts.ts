import { MATERIALS } from './carbon.js';

export const identifySchema = {
  type: 'object',
  properties: {
    is_object: { type: 'boolean', description: 'Fotoğrafta atılabilecek somut bir eşya var mı' },
    name_tr: { type: 'string', description: 'Eşyanın kısa Türkçe adı, ör. "PET su şişesi"' },
    size_tr: { type: 'string', description: 'Boyut/hacim bilgisi varsa, ör. "0,5 L"; yoksa boş' },
    material: { type: 'string', enum: MATERIALS },
    est_weight_g: { type: 'number', description: 'Tahmini ağırlık, gram' },
    count: { type: 'integer', minimum: 1 },
    condition: { type: 'string', enum: ['sağlam', 'hasarlı', 'kirli'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    suspicious: { type: 'boolean', description: 'Ekran fotoğrafı, basılı görsel veya internetten alınmış görüntü izlenimi' },
    suspicious_reason: { type: 'string' },
  },
  required: ['is_object', 'name_tr', 'material', 'est_weight_g', 'count', 'condition', 'confidence', 'suspicious'],
};

export const identifyPrompt = `Sen Adacık uygulamasının görme modülüsün. Kullanıcı atmak üzere olduğu bir eşyanın fotoğrafını çekti.
Görevin: ana eşyayı tanı, malzemesini listeden seç ve gerçekçi ağırlığını gram olarak tahmin et.
Referans ağırlıklar: 0,5 L PET şişe ~22 g, 1,5 L PET ~38 g, 330 ml alüminyum kutu ~14 g, cam kavanoz ~200 g, cam şişe 0,33 L ~190 g, konserve kutusu ~60 g, karton kutu ~150 g, pamuklu tişört ~180 g.
Karbon hesabı YAPMA; yalnızca istenen alanları doldur.
Fotoğraf bir ekranın, monitörün ya da basılı bir görselin fotoğrafı gibi görünüyorsa (moiré, piksel ızgarası, yansıma, çerçeve) suspicious=true yap.
Eşya yoksa is_object=false döndür.`;

export const ideasSchema = {
  type: 'object',
  properties: {
    ideas: {
      type: 'array', minItems: 3, maxItems: 3,
      items: {
        type: 'object',
        properties: {
          title_tr: { type: 'string', description: 'Kısa ad, ör. "Gece lambası"' },
          pitch_tr: { type: 'string', description: 'Tek cümlelik çekici açıklama' },
          difficulty: { type: 'string', enum: ['çok kolay', 'kolay', 'orta'] },
          minutes: { type: 'integer' },
          materials_tr: { type: 'array', items: { type: 'string' } },
          steps_tr: { type: 'array', minItems: 3, maxItems: 6, items: { type: 'string' } },
          visual_prompt_en: { type: 'string', description: 'Görsel model için İngilizce dönüşüm tarifi' },
        },
        required: ['title_tr', 'pitch_tr', 'difficulty', 'minutes', 'materials_tr', 'steps_tr', 'visual_prompt_en'],
      },
    },
  },
  required: ['ideas'],
};

export const ideasPrompt = (name: string, material: string, condition: string) => `Kullanıcının elinde bir "${name}" var (malzeme: ${material}, durum: ${condition}).
Bu eşyayı evde, ucuz malzemelerle yeni ve kullanışlı bir ürüne dönüştürmek için 3 kreatif upcycling fikri üret.
Fikirler birbirinden farklı olsun (ör. dekor, bitki, düzenleyici). Güvenli olsun: keskin kenar varsa bantlamayı söyle, elektrik için sadece pilli LED öner.
Adımlar kısa ve uygulanabilir olsun. Türkçe yaz. visual_prompt_en alanına, aynı eşyanın bu ürüne dönüşmüş halini fotoğraftaki açıyla tarif eden İngilizce bir cümle yaz.`;

export const visualizePrompt = (visual: string) => `Edit this photo. Keep the same object, its shape, material and the same camera angle and background, and transform it into: ${visual}. Make it look like a realistic, finished DIY upcycled product, warm natural lighting. Do not add text or logos.`;

export const verifySchema = {
  type: 'object',
  properties: {
    match: { type: 'boolean' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    suspicious: { type: 'boolean' },
    reason_tr: { type: 'string', description: 'Kullanıcıya gösterilecek tek cümle' },
  },
  required: ['match', 'confidence', 'suspicious', 'reason_tr'],
};

export const verifyPrompt = (expected: string) => `Kullanıcı şu eylemi yaptığını kanıtlamak için fotoğraf çekti: "${expected}".
Fotoğraf bu eylemi gerçekten gösteriyor mu? Ör. upcycle ise bitmiş ürün görünmeli; geri dönüşüm ise eşya doğru renkteki kutuya atılırken ya da kutunun yanında görünmeli.
Ekran/monitör fotoğrafı, basılı görsel ya da alakasız fotoğraf ise match=false ve suspicious=true. Emin değilsen confidence düşük ver. reason_tr samimi ve kısa olsun.`;

export const coachSchema = {
  type: 'object',
  properties: {
    message_tr: { type: 'string', description: 'Maskot Zekâ\'nın 1-2 cümlelik, yargısız, esprili mesajı' },
    quest_tr: { type: 'string', description: 'Bugün yapılabilecek tek, somut görev' },
  },
  required: ['message_tr', 'quest_tr'],
};

export const coachPrompt = (summary: string) => `Sen Adacık uygulamasının maskotu "Zekâ"sın: meraklı, şefkatli, esprili bir beyin. Kullanıcıyı asla suçlama.
Kullanıcının son eylemleri: ${summary || 'henüz eylem yok'}.
Kısa bir mesaj ve bugün için tek bir somut görev öner (ör. "bir cam kavanoza yeni hayat ver"). Türkçe yaz.`;
