# EcoIsland · Atmadan önce bir bak

> EkoZeka hackathon projesi. Bu repodaki kodun tamamı hackathon'un 24 saati içinde yazıldı.

**Adacık, atılacak eşyaları yapay zekâyla yeni ürünlere dönüştüren ve bunu oyunlaştırarak kullanıcıların karbon emisyonunu hem görünür kılan hem de azaltan bir mobil uygulamadır.** Kullanıcı eşyanın fotoğrafını çeker. Yapay zekâ eşyayı tanır, karbon bedelini hesaplar, eşyaya özel bir dönüşüm fikri üretir ve sonucun nasıl görüneceğini gösterir. Kullanıcı dönüşümü tamamlayıp fotoğrafla kanıtladığında yapay zekâ bunu doğrular; kullanıcının 3D adası büyür ve her 5 kg kaçınılan CO₂e için adına gerçek bir fidan dikilir (sponsor modeli, demoda sandbox).

## Akış

```
📸 Fotoğraf → 🧾 Nesne Kartı (üretim CO₂ + su + doğada kalma süresi) → 🔀 Kader seçimi
   ├─ ✨ Yeni hayat ver → AI 3 fikir + adımlar (+ "senin eşyan dönüşmüş haliyle" görsel) → "Yaptım"
   ├─ ♻️ Geri dönüştür → doğru kutu + hazırlık → "Kutuya attım"
   └─ 🗑️ Çöpe at → 450 yıllık yolculuk simülasyonu
→ 🎬 Simülasyon ("Ya çöpe atsaydın?") → 🏝️ 3D ada büyür (5 seviye) → 🌳 eşik aşılınca gerçek fidan
```

Uygulama sekmeleri: **Ada** (tam ekran 3D dünya) · **Etki** (kaçınılan karbon ve su, geçmiş) · **Ekle** (kamera) · **Profil**.

```
```

## Yapay zekâ nerede?

| Görev | Model | Uç nokta |
|---|---|---|
| Eşyayı, malzemeyi, ağırlığı tanıma; ekran fotoğrafı hilesini yakalama | Gemini Flash (görü, JSON şema) | `POST /identify` |
| Eşyaya özel 3 upcycle fikri + adımlar | Gemini Flash | `POST /ideas` |
| Kullanıcının kendi fotoğrafını dönüşmüş ürün olarak düzenleme | Gemini Flash Image | `POST /visualize` |
| (İsteğe bağlı) bitmiş ürün / kutu fotoğrafını doğrulama — şu an uygulamada kapalı | Gemini Flash (görü) | `POST /verify` |
| Maskot "Zekâ"nın kişisel görevi | Gemini Flash | `POST /coach` |

**Karbonu AI uydurmaz.** Model yalnızca malzemeyi ve ağırlığı tahmin eder; karbon, su ve doğada kalma süresi [`server/src/carbon.ts`](server/src/carbon.ts) içindeki tabloyla hesaplanır: karbon UK DESNZ/DEFRA 2025 dönüşüm faktörleri (IPCC AR5 GWP100); su Water Footprint Network ve EPA değerleri, kaynağı olmayanlar "tahmini" olarak işaretli. Puan, seçilen yolun çöp senaryosuna göre **kaçınılan** emisyonudur.

## Yapı

```
server/   Hono + @google/genai API (Node, TypeScript)
app/      Expo SDK 58 + expo-router mobil uygulama
  src/island/   three.js 3D ada (WebView içinde; dokunarak döndür, iki parmakla yakınlaş)
docs/     Plan ve jüri özeti
```

## Çalıştırma

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # GEMINI_API_KEY'i yaz (https://aistudio.google.com/apikey, ücretsiz)
npm run dev            # http://0.0.0.0:8787
```

Kontrol: `curl http://localhost:8787/health` → `hasKey: true` görmelisin.

### 2. Mobil uygulama

```bash
cd app
npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL = bilgisayarının yerel IP'si, ör. http://192.168.1.42:8787
npx expo start
```

Telefonda **Expo Go** ile QR kodu okut. Telefon ve bilgisayar aynı Wi-Fi'da olmalı (ya da backend'i deploy edip o URL'yi yaz). 3D ada three.js'i cdnjs'ten yüklediği için telefonun internete erişmesi gerekir.

### Testler

```bash
cd server && npm run test:carbon && npm run typecheck
cd app && npx tsc --noEmit && npx expo lint
```

## Notlar

- Sadece canlı kamera kullanılır (galeri yok); aynı fotoğrafın tekrar gönderilmesi ve ekran fotoğrafları puan almaz.
- Bağış ortaklığı (hedef: TEMA Vakfı) henüz yoktur; uygulamada "demo modu" olarak gösterilir.
- Görsel üretimin ücretsiz kotası değişebilir; kota dolarsa uygulama fikirleri ve adımları göstermeye devam eder, önizleme için tekrar dene butonu çıkar.

## Lisanslar

three.js (MIT), Expo/React Native (MIT). Ada seviye görselleri ve tasarım prototipi ekip tarafından üretildi.
