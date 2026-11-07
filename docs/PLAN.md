# EkoZeka Hackathon: "Adacık", nesnelere ikinci hayat veren mobil uygulama

## Bağlam
24 saatlik EkoZeka hackathon'unun beklentileri şunlar: gerçek bir doğa problemi ele alınacak, yapay zekâ çözümün kalbinde olacak ve kod 24 saat içinde public bir GitHub reposunda yazılacak. İstenen şey altyapı/mühendislik projesi değil; **bireysel davranışı** değiştiren, kreatif ve marka kimliği güçlü bir **mobil ürün**.
Kararlaştırılanlar: React Native + Expo, 3-4 kişilik ekip (yazılım + tasarım), Gemini API (ücretsiz; Claude API anahtarı yok), Claude Design ile tasarım/prototip, "cep ekosistemi" (yaşayan ada) konsepti.

**Problem:** İnsanlar elindeki şişeyi, kavanozu ya da tişörtü atarken bunun bir bedeli olduğunu görmüyor. "Bununla başka ne yapabilirim?" sorusunun cevabını da bilmiyor. Görünmeyen bir etki, davranış değişikliği yaratmıyor.
**Çözüm:** Kullanıcı bir nesnenin fotoğrafını çekiyor. Uygulama ona nesnenin **karbon ve doğa bedelini** gösteriyor, ardından **kaderini seçtiriyor**. Kullanıcı nesneyi geri dönüşüme gönderebiliyor, AI'ın ürettiği kreatif fikirle **yeni bir ürüne dönüştürebiliyor** (ör. şişeyi gece lambası yapmak) ya da çöpe atabiliyor. Her seçimin sonucu bir **simülasyonla** gösteriliyor ve kullanıcının adasında karşılık buluyor.

## Fotoğraftan gerçek etkiye: değer zinciri
Fotoğraf, tek başına bir oyun anı olarak kalmamalı. Ürünün omurgası şu: **her fotoğraf, doğrulanmış bir veri kaydı üretir ve bu kayıt gerçek dünyada üç sonuç doğurur.**

```
📸 Fotoğraf
  └─► ✅ Doğrulanmış Kayıt  {nesne, malzeme, kg, seçilen yol, konum/zaman, AI güveni}
        ├─► 1. FİZİKSEL ETKİ: nesne gerçekten çöpe gitmiyor
        │      • Geri dönüşüm: haritada en yakın Sıfır Atık kutusu/noktası → kutuda 2. fotoğraf (konum + zaman damgası)
        │      • Upcycle: bitmiş ürün fotoğrafı → nesne kullanımda kalıyor
        ├─► 2. ÖLÇÜLEBİLİR KARBON: "kaçınılan emisyon" (aşağıda)
        └─► 3. GERÇEK BAĞIŞ: puan → ada seviyesi → sponsor fonuyla kullanıcı adına gerçek fidan
```

### Karbonu dürüst hesaplamak
Jürinin en çok sorgulayacağı nokta bu, o yüzden hesap net olmalı. **Üretim karbonu bilgi amaçlı gösterilir; kazanılan puan ise yalnızca "kaçınılan emisyon" ile hesaplanır.** Kaçınılan emisyon, bir senaryonun çöp senaryosundan farkıdır:
- **Geri dönüşüm:** `kg × (çöpe gitme EF − geri dönüşüm EF)`. Burada geri dönüştürülmüş hammaddenin yerine geçtiği yeni hammadde dikkate alınır.
- **Upcycle:** Yeni ürün almaktan kaçınılan emisyondur. Kullanıcıya "Bu lamba sayesinde yeni bir lamba almadın mı?" diye sorulur; cevap evet ise ürün karbonu da eklenir, hayır ise yalnızca atık kısmı sayılır.
- Bütün emisyon faktörleri `shared/emissionFactors.ts` içinde kaynaklarıyla (DEFRA, ICE) tutulur ve uygulamada "Bu sayı nereden geliyor?" bağlantısıyla gösterilir.

### Gerçek bağış döngüsü
- Kullanıcı kaçınılan emisyondan **Filiz puanı** kazanır ve bu puanla adası büyür. Ada bir seviye atladığında (ör. 5 kg CO₂e kaçınıldığında) **sponsor fonundan kullanıcı adına gerçek bir fidan bağışlanır.**
- Uygulamada kullanıcının adına düzenlenmiş bağış sertifikası gösterilir. Adada gerçek ağacı temsil eden özel bir ağaç belirir ve üzerine dokununca "Senin gerçek fidanın: X hatıra ormanı" bilgisi çıkar.
- **Bağışı kim öder?** Kullanıcı ödemez; ödeyen sponsorlardır:
  - **Ambalaj üreticileri ve markalar:** Türkiye'deki Genişletilmiş Üretici Sorumluluğu kapsamında geri kazanım verisine ihtiyaç duyuyorlar. Doğrulanmış kayıt başına ödeme yaparlar ("Bu ay markanızın 12.000 şişesi geri dönüştü").
  - **Belediyeler:** Sıfır Atık hedefleri için mahalle bazlı, anonim veri panosu alırlar.
  - Toplanan fonun belli bir yüzdesi fidan bağışına ayrılır.
- **Bağış ortakları:** **TEMA Vakfı** (fidan bağışı programı var) ve OGM / hatıra ormanları en uygun adaylar. ⚠️ **Greenpeace** kurumsal ve sponsor bağışı kabul etmiyor (bağımsızlık politikası), bu yüzden "Greenpeace adınıza bağış yapsın" modeline uymuyor. Ancak kullanıcıya "kendi adına bağış yap" bağlantısı olarak sunulabilir.
- **Hackathon dürüstlüğü:** Ortaklık yokken var gibi anlatılmayacak. Demo'da bağış defteri ve sertifika *sandbox* modunda çalışacak; pitch'te "hedef ortaklar" olarak sunulacak.
- Ortada para olduğu için hile önlemi kritik hale geliyor: konum + zaman damgası, kişi başı günlük puan limiti, sponsor bütçe tavanı ve AI'ın şüpheli işaretlediği kayıtların puan dışı bırakılması.

## Ana kullanıcı akışı
```
📸 Fotoğraf çek ─► 🧾 Nesne Kartı ─► 🔀 Kader Seçimi ─► 🎬 Simülasyon ─► 🏝️ Ada güncellenir
```

### 1. Fotoğraf → Nesne Kartı
Gemini vision nesneyi tanır ve yapılandırılmış bir JSON döndürür:
`{ name, material, est_weight_g, count, condition, recyclable_bin }`.
Karbon değerini **LLM uydurmaz**. AI malzemeyi ve ağırlığı tahmin eder; `shared/emissionFactors.ts` içindeki kaynaklı tablo (DEFRA / ICE veritabanı değerleri) hesabı yapar. Böylece sonuç jüriye karşı savunulabilir olur.

Kartta gösterilenler:
- 🏭 **Üretim karbonu:** "Bu PET şişe ≈ 70 g CO₂e. Bir araba ile 400 m yol kadar."
- ⏳ **Doğada kalma süresi:** "Çöpe giderse ≈ 450 yıl"
- 💧 Ek bilgi olarak su ve enerji karşılığı
- Kart koleksiyon kartı stilinde tasarlanacak (nadirlik, malzeme ikonu); paylaşılabilir olacak.

### 2. Kader Seçimi (3 yol, ödül hiyerarşisi: dönüştür > geri dönüştür > at)
| Seçim | Uygulamanın tepkisi | Ada etkisi |
|---|---|---|
| ✨ **Yeni hayat ver** (upcycle) | Gemini, nesnenin durumuna ve malzemesine göre **3 kreatif fikir** üretir (gece lambası, saksı, kalemlik...). Kullanıcı birini seçer. Görsel üretim modeli, **kullanıcının kendi fotoğrafındaki nesneyi** o ürüne dönüşmüş haliyle gösteren bir önizleme üretir. Ardından adım adım yapım rehberi, gerekli malzemeler ve zorluk/süre bilgisi verilir. | Kullanıcı bitmiş ürünün fotoğrafını çektiğinde AI bunun seçilen fikirle eşleştiğini doğrular. Adaya **nadir bir çiçek** eklenir ve ürün "Atölye" galerisine girer. |
| ♻️ **Geri dönüşüme gönder** | Doğru kutuyu gösterir (Sıfır Atık renkleri: mavi kağıt, sarı plastik, yeşil cam, gri metal) ve nesnenin nasıl hazırlanacağını söyler (kapağını ayır, durula). | Kutuya atarken çekilen fotoğraf doğrulanırsa adada bir **fidan** büyür. |
| 🗑️ **Çöpe at** | Yargılamadan, sadece gösterir: nesnenin çöpten okyanusa uzanan 450 yıllık yolculuğu. | Ada sahilinde küçük bir **çöp** belirir. Sonradan başka bir iyi eylemle temizlenebilir. |

### 3. Simülasyon ekranı ("Ya öyle olsaydı?")
- **Yan yana karşılaştırma:** "Çöpe atsaydın" ile "Senin seçimin" arasında CO₂, doğada kalma yılı ve ada görünümü kıyaslanır.
- **Zaman kaydırıcısı:** Kullanıcı kaydırıcıyı 0'dan 450 yıla sürükler. Atılan şişe senaryosunda şişe parçalanıp mikroplastiğe dönüşür; lamba senaryosunda masada ışık yanmaya devam eder.
- **Ölçek projeksiyonu:** "Türkiye'de yılda ~X milyar PET şişe tüketiliyor; %1'i lambaya dönüşse..."
- Animasyonlar react-native-reanimated + Skia ile yapılacak. Maskot "Zekâ" sonucu yorumlar: "Bu şişe çöpe gitmedi, ormanına bir çiçek geldi 🌸"

### 4. Ada (ana ekran)
Ada, kullanıcının kümülatif seçimlerini görselleştirir: çiçekler dönüştürülen nesneleri, fidan/ağaçlar geri dönüşümü, sahildeki çöpler atılanları temsil eder. Kullanıcı uzun süre hiçbir şey yapmazsa ada hafifçe solar. Maskot koçluk yapar ve günlük görev verir ("Bugün bir kavanoza yeni hayat ver").

## AI neden çekirdekte? (jüri için)
1. **Görmek:** Nesne tanıma, malzeme ve ağırlık tahmini. AI olmadan Nesne Kartı oluşturulamaz.
2. **Hayal etmek:** Nesneye özel kreatif upcycle fikirleri ve kullanıcının kendi nesnesinin dönüşmüş halini gösteren görsel. Ürünün "vay" anı burası.
3. **Doğrulamak:** Bitmiş ürünün seçilen fikre uyduğunu kontrol etmek; ekran fotoğrafı veya tekrar gönderilen fotoğraf gibi hileleri tespit etmek.
4. **Koçluk:** Kişiye göre görev üretmek ve sonuçları yorumlamak.

## Mimari
```
Expo app (TypeScript, expo-router)
 ├─ expo-camera (canlı çekim), react-three-fiber + expo-gl (3D ada & simülasyon), reanimated + Lottie (2D UI & maskot)
 └─ Zustand (yerel durum)
        │ HTTPS
Backend: Hono (Node), Vercel/Render   ← tüm API anahtarları yalnızca burada
 ├─ POST /identify    foto → Gemini Flash (responseSchema ile JSON) → + emissionFactors → Nesne Kartı
 ├─ POST /ideas       nesne kartı → Gemini Flash → 3 upcycle fikri + adımlar
 ├─ POST /visualize   foto + seçilen fikir → Gemini Flash Image → önizleme görseli
 ├─ POST /verify      bitmiş ürün / kutu fotoğrafı → Gemini Flash → {match, confidence, suspicious}
 └─ POST /coach       geçmiş özeti → maskot mesajı + günlük görev
Supabase: anonim auth, items / choices tabloları, foto storage
```
- **Görsel üretim:** Gemini Flash Image, kullanıcının fotoğrafını koruyarak dönüştürür. Ücretsiz kota yetmezse yedek olarak fal.ai FLUX.1 Kontext kullanılacak. Demo riskine karşı 5 demo nesnesinin görselleri önceden üretilip cache'te tutulacak.
- **Hile önlemi:** Yalnızca canlı kamera kullanılacak; perceptual hash ile tekrar gönderilen fotoğraflar engellenecek; prompt'ta "ekran/internet görseli" tespiti yapılacak.

## API anahtarları (hackathon öncesi hazırlanmalı)
- **Karar: Gemini API (Google AI Studio, ücretsiz anahtar, kredi kartı gerekmez).** Ekipte Claude API anahtarı yok. Gemini'nin tek anahtarı her ihtiyacı karşılıyor:
  - **Gemini Flash** (görü + metin) → `/identify`, `/ideas`, `/verify`, `/coach`; JSON çıktısı `responseSchema` ile zorlanacak.
  - **Gemini Flash Image** (görsel düzenleme) → `/visualize`: kullanıcının fotoğrafındaki şişeyi lambaya dönüştürür. Böylece fal.ai'ye gerek kalmaz.
- Hackathon başlamadan şunlar yapılacak: anahtar alınacak, ücretsiz kotanın (dakikalık istek limiti, görsel üretiminin ücretsiz katmanda olup olmadığı) yettiği doğrulanacak, 5 demo nesnesinin görselleri önceden üretilip cache'e konacak.
- Backend'de LLM çağrıları tek bir `server/ai.ts` adaptöründen geçecek. Böylece ileride model değiştirmek (ör. Claude'a geçmek) tek dosyalık bir iş olur.
- Anahtar yalnızca `server/.env` dosyasında tutulacak; mobil uygulamaya asla gömülmeyecek.

## Adım 0: Claude Design ile tasarım + tıklanabilir prototip (ilk 2-3 saat, tasarımcı D)
- Claude Design ile marka kimliği, renk tokenları ve 6 ana ekran üretilecek: Ada, Kamera, Nesne Kartı, Kader Seçimi, Upcycle Rehberi, Simülasyon/Sertifika. Ekranlar tıklanabilir bir prototipe bağlanacak.
- Bu prototipin iki kullanımı var: (1) geliştiriciler (B, C) Expo ekranlarını birebir buna göre kodlar; (2) pitch'te "ürün vizyonu" ve yedek demo olarak gösterilir. Prototipte AI çıktıları sahte veridir; gerçek AI'ı Expo uygulaması gösterir.
- Renk ve font tokenları `brand/tokens.ts` dosyasına aktarılacak ve uygulama ile prototip aynı görünecek.

## 3D görsel tasarım
**Stil:** Low-poly, havada süzülen **diorama ada**. Yumuşak gün ışığı, toon/flat gölgeleme ve izometrik kamera kullanılacak. Kullanıcı adayı parmağıyla döndürebilecek. Koyu lacivert arka plan ve yıldızlar sahneyi markanın geri kalanına (hackathon sunumuna) bağlayacak.

**Teknoloji:** `@react-three/fiber/native` + `expo-gl` + `@react-three/drei`. Modeller `.glb` formatında, Draco ile sıkıştırılmış olacak.

**Varlıklar (24 saatte sıfırdan modellenmeyecek):**
- CC0 lisanslı hazır paketler kullanılacak: **Quaternius** (Ultimate Nature Pack) ve **Kenney** (Nature Kit). Ağaç, çiçek, kaya, su ve çöp öğeleri buradan gelecek; ada tabanı Blender'da 30 dakikada çıkarılabilir.
- Tasarımcı (D) renkleri marka paletine çekecek. Blender'da tek bir gradient texture ile tüm modeller boyanacak.
- **Hızlı alternatif:** Sahne Spline'da kurulup GLB olarak dışa aktarılabilir. Tasarımcı için çok hızlı bir yol ama dosya boyutuna dikkat edilmeli.

**3D nerede, 2D nerede?**
| Ekran | Görsel dil |
|---|---|
| Ada (ana ekran) | **3D:** dönebilen diorama; çiçek/fidan ekleme animasyonu (ölçek + parçacık) |
| Simülasyon | **3D:** zaman kaydırıcısı ile şişe sahilde parçalanır / masada lamba yanar |
| Gerçek fidan anı | **3D:** adada parıldayan özel ağaç, kamera ona doğru zoom yapar |
| Nesne Kartı, fikirler, rehber | **2D:** buzlu cam (glassmorphism) kartlar; hızlı ve okunaklı |
| Maskot "Zekâ" | **2D Lottie** (videodaki karakterle tutarlı, ucuz) |

**Ekstra "vay" anı (zaman kalırsa):** Kullanıcının dönüştürdüğü nesnenin fotoğrafı image-to-3D modeliyle (Meshy/Tripo) 3D'ye çevrilir ve kullanıcının **kendi lambası adasına yerleşir**. Bu işlem yaklaşık 1-2 dk sürdüğü için demo nesneleri önceden üretilip cache'te tutulacak.

**Performans:** Sahne toplamda 50 bin poligonun altında kalacak; instancing kullanılacak; gölge tek bir directional light ile verilecek; ilk açılışta GLB'ler önceden yüklenecek. Expo Go'da orta segment bir Android telefonda 60 fps hedeflenecek.

## Marka kimliği
- **İsim:** *Adacık* (alternatifler: İkinci Hayat, Filiz). Slogan: "Atmadan önce bir bak."
- **Maskot:** Videodaki beyin karakteri "Zekâ"; mutlu, endişeli ve gururlu ruh halleri olacak.
- **Renkler:** Koyu lacivert (#0B1020), doğa yeşili (#5FAF7A), AI moru (#7C6FD6). Tipografi hackathon sunumuyla aynı: grotesk başlık + monospace etiket.
- **Ton:** Suçlayıcı değil, meraklı ve esprili.

## Repo yapısı (public GitHub)
```
adacik/
  app/      ekranlar: island, camera, item-card, fate, simulation, upcycle-guide, workshop
  server/   identify.ts, ideas.ts, visualize.ts, verify.ts, coach.ts, prompts/
  shared/   emissionFactors.ts (kaynaklı), materials.ts, types.ts (AI JSON şemaları)
  brand/    logo, maskot sprite'ları, ada sprite'ları, tokenlar
  README.md problem, demo GIF, kurulum, emisyon kaynakları
```

## 24 saat planı (4 kişi)
| Saat | Backend/AI (A) | Mobil akış (B) | Ada & Simülasyon (C) | Tasarım (D) |
|---|---|---|---|---|
| 0-2 | Repo, Hono, Gemini bağlantısı, emisyon tablosu | Expo iskeleti, kamera | R3F 3D ada prototipi (CC0 modeller) | Claude Design: marka + 6 ekran + prototip |
| 2-8 | `/identify` + `/ideas` prompt'ları, 10 nesneyle test | Kamera → Nesne Kartı → Kader Seçimi | Ada öğeleri (çiçek/fidan/çöp) + animasyon | Kart tasarımı, 6 ekran |
| 8-14 | `/visualize` (görsel modeli), `/verify` | Upcycle rehberi, geri dönüşüm kutusu ekranı | Simülasyon: karşılaştırma + zaman kaydırıcısı | Maskot ruh halleri, sprite'lar |
| 14-18 | `/coach`, hile kontrolleri, demo cache | Atölye galerisi, onboarding | Ölçek projeksiyonu, polisaj | Pitch deck, demo senaryosu |
| 18-22 | **Feature freeze**; prompt ince ayarı, deploy | Hata düzeltme, demo verisi | Performans | README görselleri, prova |
| 22-24 | Demo telefonuna kurulum, yedek video | | | Final pitch |

**MVP (olmazsa olmaz):** foto → Nesne Kartı (üretim CO₂ + doğada kalma süresi) → kader seçimi → upcycle fikri + üretilen görsel → simülasyon (kaçınılan CO₂) → adaya çiçek → seviye atlayınca sandbox fidan sertifikası.
**Zaman kalırsa:** en yakın geri dönüşüm noktası haritası, belediye/sponsor etki panosu (tek web sayfası), koç/günlük görev, Atölye galerisi.
Ek backend: `POST /ledger` uç noktası ve `donations` tablosu (seviye → bağış kaydı → sertifika).

## Demo senaryosu (3 dk)
1. Sahnede boş bir PET şişenin fotoğrafı çekilir. Nesne Kartı gelir: "≈70 g CO₂e, doğada 450 yıl".
2. "Çöpe at" seçeneğine dokunulur ve simülasyon gösterilir: zaman kaydırıcısı 450 yıla sürüklenir, şişe mikroplastiğe dönüşür. Seyirci tepki verir.
3. Geri dönülür ve "Yeni hayat ver" seçilir. AI 3 fikir sunar, "Gece lambası" seçilir. **Ekranda kullanıcının kendi şişesi lamba olarak belirir.**
4. Önceden hazırlanmış gerçek lamba fotoğrafı çekilir. AI "Eşleşti ✓" der, adaya bir çiçek açar ve maskot kutlar.
5. Ada seviye atlar: "🌳 Sponsor fonuyla adına gerçek bir fidan bağışlandı" sertifikası belirir ve adada gerçek ağaç ikonu çıkar.
6. Kapanış: sponsor/belediye panosu ("Bu hafta kampüste 214 şişe doğrulandı, 38 fidan dikildi") ve "Atmadan önce bir bak."

## Doğrulama
- `npm run test:identify` betiği 10 farklı nesne fotoğrafını (PET, cam kavanoz, konserve, karton, tişört...) `/identify` uç noktasına gönderecek; JSON şemaya uygunluğu, malzemenin doğru tanınmasını ve CO₂ değerinin makul aralıkta olmasını kontrol edecek.
- `/verify` için pozitif örnekler, ekran fotoğrafı ve alakasız fotoğraf ile negatif testler yapılacak.
- `/visualize` uç noktasının 5 demo nesnesinde gecikmesi ölçülecek (<15 sn olmalı; değilse cache devreye girecek).
- Expo Go ile gerçek telefonda uçtan uca demo akışı mobil veri üzerinden denenecek.
- Repo'nun public olduğu ve anahtarların commit'lenmediği kontrol edilecek (`.env` dosyası `.gitignore` içinde).

---

## Jüriye kısa özet

**Vurucu versiyon (jüriye verilecek):**
> **Adacık, atılacak eşyaları yapay zekâyla yeni ürünlere dönüştüren ve bunu oyunlaştırarak kullanıcıların karbon emisyonunu hem görünür kılan hem de azaltan bir mobil uygulamadır.** Kullanıcı eşyanın fotoğrafını çeker. Yapay zekâ eşyayı tanır, karbon bedelini hesaplar, eşyaya özel bir dönüşüm fikri üretir ve sonucun nasıl görüneceğini gösterir. Kullanıcı dönüşümü tamamlayıp fotoğrafla kanıtladığında yapay zekâ bunu doğrular; kullanıcının dijital adası büyür ve adına gerçek bir fidan dikilir.

**Eski 2-3 cümlelik versiyon:**
> İnsanlar her gün şişe, kavanoz ve ambalaj atıyor, ama bunun doğaya bedelini görmedikleri için davranışlarını değiştirmiyorlar. Adacık'ta atmak üzere olduğun nesnenin fotoğrafını çekiyorsun. Yapay zekâ nesneyi tanıyıp karbon bedelini ve doğada kalma süresini hesaplıyor, sana o nesneye özel geri dönüşüm ya da yeniden kullanım fikirleri üretiyor ve dönüşmüş halini görsel olarak gösteriyor. Eylemini fotoğrafla kanıtladığında yapay zekâ bunu doğruluyor, dijital adan büyüyor ve sponsor fonuyla adına gerçek bir fidan bağışlanıyor.

**Uzun versiyon:**

**Adacık: Atmadan önce bir bak.**

**Problem:** Her gün attığımız şişe, kavanoz ve ambalajın bir doğa bedeli var, ama bu bedel görünmüyor. Görünmeyen etki davranışı değiştirmiyor. "Bununla başka ne yapabilirim?" sorusunun cevabını da çoğumuz bilmiyoruz.

**Çözüm:** Adacık bir mobil uygulama. Kullanıcı atmak üzere olduğu nesnenin fotoğrafını çekiyor. Yapay zekâ nesneyi ve malzemesini tanıyor; kullanıcıya nesnenin karbon bedelini ve doğada kaç yıl kalacağını gösteriyor. Sonra nesnenin kaderini kullanıcıya seçtiriyor:
- ♻️ **Geri dönüştür:** Doğru kutuyu ve en yakın noktayı gösterir.
- ✨ **Yeni hayat ver:** Yapay zekâ kreatif fikirler üretir ve kullanıcının *kendi şişesini* gece lambasına dönüşmüş olarak gösteren bir görsel oluşturur; adım adım yapım rehberi sunar.
- 🗑️ **Çöpe at:** Nesnenin 450 yıllık yolculuğunu bir simülasyonla gösterir.

Her doğrulanmış iyi seçim, kullanıcının dijital adasına bir çiçek ya da fidan olarak ekleniyor. Ada büyüdükçe **sponsor fonuyla, kullanıcı adına gerçek bir fidan bağışlanıyor** (hedef ortak: TEMA Vakfı).

**Yapay zekâ neden kalpte?** Uygulama nesneyi **görüyor** (tanıma, malzeme, ağırlık), ona yeni bir hayat **hayal ediyor** (fikir + görsel üretimi), yapılan eylemi **doğruluyor** (hile tespiti) ve kullanıcıya **koçluk** yapıyor. Yapay zekâ çıkarılırsa ürün çalışmaz.

**Gerçek etki:** Her fotoğraf doğrulanmış bir veri kaydına dönüşüyor. Kullanıcının puanını, kaynaklı emisyon faktörleriyle hesaplanan **kaçınılan emisyon** belirliyor. Aynı veri, ambalaj üreticilerine (Genişletilmiş Üretici Sorumluluğu) ve belediyelere (Sıfır Atık) anlamlı bir pano sunuyor. Bağışları finanse eden de bu iş modeli.

**Fark:** Bu bir karbon hesaplayıcısı değil. Atmak üzere olduğun nesneyle kurulan duygusal bir bağ, kreatif bir dönüşüm ve sonunda toprağa dikilen gerçek bir ağaç.

**Teknoloji:** React Native (Expo), React Three Fiber (3D ada), Gemini (görü + dil + görsel düzenleme), Supabase. Tasarım ve prototip Claude Design ile yapıldı. Kodun tamamı 24 saat içinde public GitHub reposunda yazıldı.
