# Didi Home — Proje Dokümanı

> **Bu dosya projenin tek kaynağıdır.** Projeye yeni katılan bir geliştirici ya da yapay zekâ asistanı
> çalışmaya buradan başlar. Kod değiştiren herkes, işi bitirdiğinde bu dosyadaki
> **Süreç Günlüğü** ve **Aşama Planı** bölümlerini günceller.

Son güncelleme: 2026-09-16

---

## 1. Proje nedir?

Didi Home, el yapımı seramik, özel tasarım nakışlı kıyafet ve vintage ev objelerinin
sergilendiği bir vitrin + sipariş sitesidir. Ürünler tek parça ya da limitli üretimdir;
her ürünün bir "hikâyesi" vardır. Marka dili sade, sıcak ve doğal tonludur
(bej / kum / terracotta, wabi-sabi estetiği).

**Siteyi kim yönetiyor?** Teknik bilgisi olmayan bir kullanıcı, tarayıcıdan `/admin`
paneline girerek ürün, kategori ve kapak fotoğraflarını kendisi yönetir.
Bu yüzden panelin sade, affedici ve veri kaybına karşı korumalı olması
teknik zarafetten daha önemlidir.

**Tasarım kuralı:** Sitenin görsel tasarımı beğenilmiştir ve **değiştirilmeyecektir.**
Renkler, yazı tipleri, boşluklar, animasyonlar ve sayfa düzeni korunur.
Yapılan işler işlevsellik, güvenlik, performans ve veri güvenliği üzerinedir.

---

## 2. Altın kurallar (veri kaybını önleyen kurallar)

Bu projede geçmişte veri kaybı riski yaşandı. Aşağıdakiler tartışmaya kapalıdır:

1. **Canlı veriye dokunmadan önce yedek al.** Yedekler `backups/` klasörüne tarihli
   olarak yazılır (bu klasör git'e gönderilmez).
2. **Toplu üzerine yazma yok.** Bir ürün güncellenirken yalnızca o ürünün satırı yazılır.
   Tüm kataloğu tek seferde gönderen bir kod yazılmaz.
3. **Veri gelmeden kayıt yapılmaz.** Bulut verisi henüz yüklenmemişken kayıt
   işlemi engellenir. (Aksi halde boş/demo veri gerçek kataloğun üzerine yazılır.)
4. **Örnek/demo ürün listesi yedek plan olarak kullanılmaz.** Veri gelmezse boş
   ekran ve hata mesajı gösterilir; sahte ürün gösterilmez.
5. **Silme işlemi geri alınabilir olmalı.** Silinen kayıt `deleted_at` ile işaretlenir ve
   süresiz olarak çöp kutusunda bekler. API üzerinden kalıcı silme veritabanı kurallarıyla
   tamamen kapalıdır; gerekirse yalnızca doğrudan veritabanı bağlantısıyla, yedek alınarak yapılır.
6. **"Hepsini sıfırla" türünde toplu yıkıcı buton bulunmaz.**
7. **Başarı mesajı ancak kayıt gerçekten doğrulandıktan sonra gösterilir.**

---

## 3. Teknoloji yığını

| Katman | Teknoloji |
|---|---|
| Arayüz | React 19 + TypeScript, Vite 6 |
| Stil | Tailwind CSS 4 (`@theme` ile marka renkleri, `src/index.css`) |
| Animasyon | Motion (`motion/react`) |
| İkonlar | lucide-react |
| Veri / kimlik doğrulama / dosya | Supabase (PostgreSQL + Auth + Storage) |
| Sunucu fonksiyonları | Vercel Serverless (`api/` klasörü) |
| Yayın | Vercel |

---

## 4. Dizin yapısı

```
didi-home/
├─ api/                    Vercel sunucu fonksiyonları (API anahtarları burada kalır)
├─ backups/                Canlı veri yedekleri (git'e gönderilmez)
├─ docs/
│  └─ glossary.md          Marka terim sözlüğü (çeviri ve metinler için)
├─ public/images/          Statik görseller (kapaklar, ilk ürün fotoğrafları)
├─ scripts/                Tek seferlik bakım/taşıma betikleri
├─ sql/                    Supabase şema ve güvenlik kuralları (sırayla çalıştırılır)
├─ src/
│  ├─ components/          Arayüz bileşenleri (AdminLogin.tsx: yönetici girişi)
│  ├─ context/             Dil (TR/EN) sağlayıcısı
│  ├─ hooks/               Ortak davranışlar (useModalBehavior: ESC, kaydırma kilidi)
│  ├─ auth.ts              Yönetici girişi (Supabase Auth)
│  ├─ orders.ts            Sipariş akışı (WhatsApp + veritabanı kaydı)
│  ├─ store.ts             Veri erişim katmanı (tüm okuma/yazma buradan)
│  ├─ supabase.ts          Supabase istemcisi
│  └─ types.ts             Tip tanımları
├─ PROJECT.md              ← bu dosya
└─ README.md               Kısa kurulum notu
```

---

## 5. Kurulum ve çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # üretim derlemesi
npm run lint     # TypeScript tip kontrolü
```

### Ortam değişkenleri

Yerelde `.env.local`, yayında Vercel → Settings → Environment Variables.
**Hiçbir anahtar kod dosyasına yazılmaz.**

| Değişken | Nerede kullanılır | Gizli mi? |
|---|---|---|
| `VITE_SUPABASE_URL` | Tarayıcı | Hayır (herkese açık) |
| `VITE_SUPABASE_ANON_KEY` | Tarayıcı | Hayır (RLS kuralları korur) |
| `VITE_WHATSAPP_NUMBER` | Tarayıcı, sipariş yönlendirmesi | Hayır |
| `SUPABASE_DB_URL` | Yalnızca yerel betikler (`scripts/`) — **Vercel'e eklenmez** | **Evet** |
| `OPENROUTER_API_KEY` | Yalnızca sunucu (`api/translate`) | **Evet** |
| `OPENROUTER_MODEL` | Sunucu, çeviri modeli adı | Hayır |

---

## 6. Veri modeli

### Eski yapı (ARŞİV — 2026-09-16'ya kadar)

`store_data` adlı tek tabloda üç satır: `products`, `categories`, `covers`.
Her satırın `value` sütununda tüm liste tek bir JSON olarak durur.
Sorunları: her kayıtta tüm katalog üzerine yazılır, eşzamanlı düzenlemede
son yazan kazanır, fotoğraflar JSON içine base64 olarak gömülüdür (5,6 MB indirme).
Tablo **silinmedi**, arşiv olarak duruyor (bkz. Süreç günlüğü).

### Güncel yapı (2026-09-16'dan itibaren)

- `products` — ürün başına bir satır (`id`, `title`, `category_id`, `price`,
  `story`, `images[]`, `status` (taslak/yayında/satıldı), `sort_order`,
  `deleted_at`, `updated_at`, İngilizce alanlar)
- `categories` — kategori başına bir satır
- `settings` — kapak görselleri gibi genel ayarlar
- `orders` — gelen siparişler
- `revisions` — her değişiklikten önceki hali saklayan otomatik sürüm geçmişi
- Fotoğraflar (Aşama 3 hedefi) `product-images` adlı Supabase Storage klasöründe;
  veritabanında yalnızca adresleri durur. **Şu an** eski ürünlerin bir kısmının
  fotoğrafları hâlâ base64 olarak `images` sütununda.

### Güvenlik kuralları özeti (`sql/02_security.sql`)

| Kim | Ürün / Kategori / Ayar | Sipariş | Sürüm geçmişi |
|---|---|---|---|
| Ziyaretçi | Yalnızca yayındakileri **okur** | **Ekler**, okuyamaz | Erişemez |
| Yönetici (`is_admin()`) | Okur, ekler, günceller | Okur, günceller | Okur |
| Herkes | **Kalıcı silme yok** (DELETE kuralı tanımlı değil) | Silme yok | — |

Yönetici listesi iki yerde tutulur ve **ikisi birlikte** güncellenmelidir:
`src/auth.ts → YONETICI_EPOSTALARI` (arayüz) ve `sql/02_security.sql → is_admin()` (asıl koruma).

### SQL dosyaları (sırayla)

| Dosya | Ne yapar | Durum |
|---|---|---|
| `sql/01_schema.sql` | Tablolar, tetikleyiciler, sürüm geçmişi | ✅ Çalıştırıldı |
| `sql/02_security.sql` | RLS kuralları, `is_admin()` | ✅ Çalıştırıldı |
| `sql/03_archive_store_data.sql` | Eski tabloyu API'ye tamamen kapatır | ⏳ Yeni kod yayına alınınca **tekrar** çalıştırılacak |
| `sql/03b_store_data_readonly_until_deploy.sql` | GEÇİCİ: canlı eski kod için salt okuma | ✅ Şu an etkin |

Çalıştırma: `node scripts/run-sql.mjs sql/DOSYA.sql` (`.env.local` içinde `SUPABASE_DB_URL` gerekir).

---

## 7. Aşama planı

- [x] **Aşama 0 — Güvenlik ve acil düzeltmeler** _(tamamlandı: 2026-09-16)_
- [x] **Aşama 1 — Veri modeli ve veri kaybı korumaları** _(tamamlandı: 2026-09-16)_
- [~] **Aşama 2 — Gerçek yönetici girişi (Supabase Auth + RLS)** — kod ve RLS hazır; yönetici hesabı oluşturulacak, yeni kod yayına alınacak
- [ ] **Aşama 3 — Fotoğraf altyapısı (Storage) ve panel ölçü rehberi**
- [~] **Aşama 4 — Sipariş akışı (kayıt + WhatsApp)** — WhatsApp tarafı çalışıyor, kayıt tabloyu bekliyor
- [ ] **Aşama 5 — Otomatik İngilizce çeviri (OpenRouter + terim sözlüğü)**
- [ ] **Aşama 6 — SEO, performans ve kod temizliği**

Her aşamanın ayrıntısı ve sonucu aşağıdaki günlükte.

---

## 8. Süreç günlüğü

### 2026-09-16 — Başlangıç: mevcut durumun tespiti

Tüm kod tabanı incelendi. Öne çıkan bulgular:

- Yönetici şifresi koda gömülüydü ve giriş ekranında yazıyordu.
- Veritabanı herkese açık yazılabilir durumdaydı (anon anahtarla yazma izni).
- Verilen siparişler hiçbir yere kaydedilmiyordu.
- Her ziyaretçi 5,6 MB veri indiriyordu (fotoğraflar JSON'a gömülü).
- Bulut verisi gelmeden önce koddaki demo ürünler gösteriliyor ve bu sırada
  yapılan bir kayıt gerçek kataloğu silebiliyordu.
- Tarayıcı depolama kotası aşıldığı için önbellek çalışmıyordu.

Canlı verinin tam yedeği alındı: `backups/supabase-full-2026-09-16_1038.json`
(products 7 kayıt, categories 3 kayıt, covers 4 alan).

### 2026-09-16 — Aşama 0 tamamlandı

**Güvenlik**
- Giriş ekranındaki "Giriş şifresi: didi" ipucu ve hatalı şifre mesajındaki ipucu kaldırıldı.
- Footer'daki herkese görünen "YÖNETİCİ GİRİŞİ" bağlantısı kaldırıldı. Panele artık yalnızca
  adres çubuğuna `/admin` yazılarak ulaşılıyor. (Gerçek koruma Aşama 2'de Supabase Auth ile gelecek.)

**Veri kaybı korumaları**
- `src/data.ts` içine anahtar bazlı "bulut verisi yüklendi" bayrağı eklendi. Bulut verisi
  inmeden yapılan kayıt denemeleri `CloudNotReadyError` ile engelleniyor. Bu, açılışın ilk
  saniyelerinde panelde yapılan bir işlemin gerçek kataloğu silmesi riskini ortadan kaldırdı.
- Supabase katmanındaki otomatik "tohumlama" kaldırıldı. Önceden kayıt okunamadığında
  koddaki örnek veri buluta yazılıyordu; artık yazılmıyor.
- `App.tsx` içine `persist()` yardımcısı eklendi: kayıt başarısız olursa ekrandaki liste
  değişmiyor ve kullanıcı gerçek durumu görüyor (önceden her koşulda "yayına alındı" deniyordu).
- Geri tuşu (`popstate`) ve panelden çıkış artık listeyi localStorage'dan yeniden okumuyor.
  Önbellek kota nedeniyle yazılamadığında geri tuşuna basan ziyaretçiye örnek ürünler
  gösteriliyordu; bu hata giderildi.
- localStorage'a çift yazma kaldırıldı (`didi_products`, `didi_covers`, `didi_categories`
  eski anahtarları). Kota tüketimi yarıya indi.
- Geliştirme sunucusuna özel `/api/*` çağrıları yalnızca yerelde çalışacak şekilde sınırlandı.
- Yıkıcı toplu butonlar kaldırıldı: "Kataloğu Sıfırla", "Kategorileri Sıfırla",
  "Tüm Kapakları Varsayılana Döndür". Tek tek kapak sıfırlama (zararsız) korundu.

**Proje kimliği ve temizlik**
- Devralınan şablon kalıntıları silindi: `metadata.json`, eski README, `scripts/__pycache__`,
  yapılandırma dosyalarındaki eski yorumlar. Paket adı `react-example` → `didi-home`.
- Kullanılmayan bağımlılıklar kaldırıldı: `@google/genai`, `express`, `dotenv`, `tsx`,
  `@types/express`, `autoprefixer`.
- `@types/react` ve `@types/react-dom` eklendi, `tsconfig` sıkı moda alındı.
  Tip kontrolü önce 3 hata veriyordu, artık **0 hata**.
- `index.html`: sayfa başlığı "Didi Home · El Yapımı Seramik, Nakışlı Kaftan ve Vintage Ev
  Objeleri" oldu, `lang="tr"`, açıklama, Open Graph etiketleri, favicon ve font ön bağlantıları
  eklendi. (Paylaşım görselinin tam adresi, alan adı belli olunca Aşama 6'da güncellenecek.)
- `.gitignore`: `backups/` ve `__pycache__` eklendi.

**İçerik düzeltmeleri**
- "her bir parça tekil" → "her bir parça tek".
- Kargo çelişkisi giderildi: ürün sayfası da sepetle aynı kuralı söylüyor
  ("3.000 TL ve üzeri siparişlerde ücretsiz kargo").
- Sipariş formundaki gerçek kişi adı örneği nötr bir örnekle değiştirildi.

**Doğrulama**
- `npm run lint` (tsc): 0 hata.
- `npm run build`: başarılı (JS 710,80 kB → 705,78 kB).
- Geliştirme sunucusunda ana sayfa, kategori sayfası ve yönetici girişi açıldı;
  tarayıcı konsolunda hata yok, tasarımda değişiklik yok.

**Aşama 1'e devredilenler**
- Kayıt işlemi hâlâ "gönder ve unut" mantığıyla çalışıyor; bulut kaydının gerçekten
  tamamlandığı beklenmiyor. Aşama 1'de kayıt `await` edilip sonucuna göre mesaj gösterilecek.
- Koddaki örnek ürün listesi (`INITIAL_PRODUCTS`) hâlâ ilk açılışta görünüyor.
  Aşama 1'de yerini yükleniyor durumuna bırakacak.
- Silinen kaydın geri getirilmesi (çöp kutusu) Aşama 1'de gelecek.

---


### 2026-09-16 — Aşama 1 (kısmi) ve Aşama 4 (kısmi)

Supabase paneline erişim beklenirken, veritabanı gerektirmeyen işler yapıldı.

**Aşama 1 — hazırlık (tablolar oluşturulunca devreye girecek)**
- `sql/01_schema.sql`: products / categories / settings / orders / revisions tabloları.
- `scripts/migrate-store-data.mjs`: eski tek-JSON yapısından yeni tablolara taşıma.
  Varsayılan olarak deneme modunda çalışır, önce yedek alır, sonunda doğrular.
  Deneme sonucu: 7 ürün + 3 kategori sorunsuz eşleşti.
- `scripts/run-sql.mjs`: `.env.local` içindeki `SUPABASE_DB_URL` ile doğrudan
  veritabanına bağlanıp SQL çalıştırır. Böylece şema değişiklikleri için
  Supabase panelini açmak gerekmez.
- `src/store.ts`: yeni veri katmanı (henüz uygulamaya bağlanmadı).

**Aşama 4 — sipariş akışı (çalışır durumda)**
- `src/orders.ts` eklendi. Tasarım kararı: **WhatsApp asıl kanal, veritabanı ikinci
  kanaldır.** Veritabanına ulaşılamasa bile sipariş kaybolmaz.
- Sepetteki "SİPARİŞİ VER" butonu artık gerçekten iş yapıyor: müşterinin bilgileri
  ve sepeti `DH-20260916-XXX` biçiminde bir sipariş numarasıyla hazır WhatsApp
  mesajına dönüşüyor ve 0505 632 73 23 numarasına yönlendiriliyor.
- Onay ekranındaki "e-postanıza kargo kodu gönderilecek" ifadesi kaldırıldı;
  yerine sipariş numarası, ne yapılacağı ve açılır pencere engellenirse diye
  yedek bir WhatsApp bağlantısı kondu.
- Sipariş ayrıca tarayıcıda yerel olarak yedekleniyor (son çare).
- `orders` tablosuna kayıt kodu yazıldı; tablo oluşunca ek bir işlem gerekmeden
  çalışmaya başlayacak.

**Panel iyileştirmeleri**
- Ürün formuna **ideal fotoğraf ölçüleri rehberi** eklendi (dikey 4:5, ~1200×1500 px,
  kadraj, ışık, ilk fotoğrafın kapak olması, ürün başına 3-6 fotoğraf).
- Kapak yönetimi sekmesine vitrin görseli için ölçü notu eklendi (dikey 3:4, 1200×1600 px).
- Yeni kategori eklendiğinde ürün formunu çökerten hata giderildi: hazır görseli
  olmayan kategorilerde artık bilgilendirme ve "fotoğraf yükle" yönlendirmesi çıkıyor.

**Doğrulama**
- `tsc`: 0 hata, `build`: başarılı.
- Tarayıcıda uçtan uca sipariş denemesi yapıldı; üretilen WhatsApp mesajı,
  numara ve sipariş numarası kontrol edildi.
- Panelde rehber kutusu ve ürün formu ekran görüntüsüyle doğrulandı.

**Bekleyen (Supabase erişimi gerekiyor)**
1. `sql/01_schema.sql` çalıştırılacak
2. `node scripts/migrate-store-data.mjs --apply` ile veri taşınacak
3. Uygulama `src/store.ts` katmanına geçirilecek
4. Panele çöp kutusu, taslak/satıldı durumu ve JSON yedek butonu eklenecek


### 2026-09-16 — Görsel oranları standartlaştırıldı

Görseller yapay zekâ araçlarıyla üretildiği için sitedeki tüm oranlar, o araçların
sunduğu standart seçeneklere (16:9 / 4:3 / 1:1 / 3:4 / 9:16) hizalandı.

**Karar: sitenin görsel dili dikey 3:4 üzerine kuruludur.**

| Alan | Önceki | Şimdi |
|---|---|---|
| Ürün kartları (kategori sayfası) | 4:5 | **3:4** |
| Ana sayfa vitrin kartları | 3:4 | 3:4 (değişmedi) |
| Panel önizlemeleri ve hazır görseller | 4:5 | **3:4** |
| Sepet ve tablo küçük görselleri | 4:5 / 5:6 | **3:4** |
| Sıkıştırma sınırı | 1200 × 1500 | **1200 × 1600** (tam 3:4) |

- Ürün sayfasında görsel tam olarak (kırpılmadan) gösterildiği için 1:1 ve 4:3 fotoğraflar
  da kırpılmadan görünür; yalnızca kartlarda 3:4 çerçeveye kırpılırlar.
- Panele görsel bir **oran rehberi** eklendi: beş oran küçük kutucuklar hâlinde
  gösteriliyor, 3:4 önerilen olarak vurgulanıyor, 16:9 ve 9:16 kaçınılacak olarak işaretli.
- Aynı rehber kapak yönetimi sekmesine de kondu.


### 2026-09-16 — Mobil deneyim ve gezinme hataları

**Yeni: `src/hooks/useModalBehavior.ts`** — ürün detayı, sepet ve Hikâyemiz pencereleri için ortak davranış:
- Pencere açıkken arka plandaki sayfa kaymıyor.
- ESC yalnızca en üstteki pencereyi kapatıyor (ürün detayının üstünde sepet açıksa önce sepet kapanır).
- Yönetim panelindeki formlarda **bilerek kullanılmadı**: yanlışlıkla basılan ESC yarım formu kapatıp girilen bilgiyi kaybettirmesin.

**Ürün detay penceresi**
- Fotoğraf okları telefonda artık görünüyor (masaüstünde eskisi gibi fare üzerine gelince beliriyor; tasarım aynı).
- Parmakla sağa/sola kaydırarak fotoğraf değiştirme eklendi (45 px eşik; kısa dokunuş fotoğrafı değiştirmez).
- Klavyede sağ/sol ok tuşlarıyla fotoğraf değiştirme eklendi.

**Düzeltilen gezinme hataları**
- Doğrudan bağlantıyla açılan ürün sayfası (ör. Instagram/WhatsApp'ta paylaşılan link) kapatılınca ziyaretçi
  **sitenin dışına** atılıyordu. Artık kategori sayfasında kalıyor. Aynı düzeltme `/admin` için de yapıldı
  (footer bağlantısı kaldırıldığından panelden "Mağazaya dön" siteden çıkarıyordu).
  Çözüm: site içinden eklenen geçmiş kayıtları `pushed: true` ile işaretleniyor; yalnızca bunlarda `history.back()` kullanılıyor.
- Bulut verisi geç geldiğinde, kullanıcının çoktan kapattığı ürün penceresi yeniden açılıyordu. Düzeltildi.

**Doğrulama (375×812 mobil görünümde):** arka plan kilidi, kaydırma (0→1→2→1), kısa dokunuşun etkisizliği,
klavye okları, ESC ile kapanma, doğrudan bağlantıda sitede kalma, 16 sn sonra gelen verinin pencereyi
yeniden açmaması ve site içi akışta geri gitme tek tek test edildi.

### 2026-09-16 — Aşama 1 tamamlandı, Aşama 2 büyük ölçüde tamamlandı

**Veritabanı erişimi**
- `.env.local` içine `SUPABASE_DB_URL` (Session pooler) eklendi. Artık şema değişiklikleri
  Supabase paneline girmeden `scripts/run-sql.mjs` ile yapılıyor.

**Şema ve taşıma**
- `sql/01_schema.sql` çalıştırıldı: products, categories, settings, orders, revisions.
- İlk taşıma denemesi Supabase API'sinin süre sınırına takıldı (5,6 MB tek JSON satırı);
  **hiçbir şey yazılmadan** durdu. Betik doğrudan veritabanı bağlantısına ve
  **tek transaction**'a çevrildi: doğrulama başarısız olursa her şey geri alınıyor.
- Taşıma başarılı: 3 kategori, 7 ürün, kapak ayarları. Tüm fotoğraflar (base64 dahil)
  byte byte karşılaştırılarak doğrulandı. "Ev Renevasyon" → "Ev Renovasyon", 9.999 TL.
- Taşıma öncesi yedek: `backups/store_data-tasima-oncesi-2026-09-16-10-18.json`.

**Güvenlik bulgusu ve düzeltmesi**
- Yeni tablolarda RLS kapalıydı; anon anahtarla okunup yazılabiliyordu (siparişlerdeki
  müşteri bilgileri dahil). `sql/02_security.sql` ile kapatıldı.
- Eski `store_data` tablosunda **"Allow public read-write on store_data"** adlı, herkese
  okuma-yazma veren bir kural bulundu. Projenin başındaki güvenlik açığının asıl kaynağı buydu.
  Kural kaldırıldı.
- ⚠️ **Yaşanan olay:** Kural kaldırıldığında canlı site (hâlâ eski kodda, `store_data`'dan
  okuyor) yaklaşık 1-2 dakika veri okuyamadı. Fark edilince `sql/03b_...` ile **salt okuma**
  izni geri verildi; canlı sitenin 5/1/1 ürünle doğru çalıştığı tarayıcıda doğrulandı.
  Yazma kapalı kaldı. **Ders:** canlı sitenin kullandığı bir kaynağa dokunmadan önce hangi
  kod sürümünün yayında olduğu kontrol edilmeli.
- Dışarıdan (ziyaretçi olarak) 6 test yapıldı: ürün okuma ✓, sipariş okuma engelli ✓,
  sipariş ekleme ✓, fiyat değiştirme engelli ✓, silme engelli ✓, geçmiş okuma engelli ✓.
- Yönetici yetkileri, geri alınan bir transaction içinde JWT simülasyonuyla doğrulandı:
  yönetici güncelleyip çöp kutusuna taşıyabiliyor, sürüm geçmişi otomatik yazılıyor;
  başka bir hesap hiçbir şeyi değiştiremiyor.

**Uygulama yeni yapıya bağlandı**
- `src/data.ts`, `src/data/*.json` ve geliştirme sunucusundaki dosya-API eklentisi **silindi**.
- `App.tsx` artık `src/store.ts` kullanıyor. Her kayıt beklenip doğrulanıyor; hata olursa
  ekrandaki liste değişmiyor.
- Ürünler tarayıcıda **önbelleğe alınmıyor** (yalnızca küçük kategori/kapak verisi).
  Eski büyük önbellek anahtarları ilk açılışta temizleniyor.
- Veri yüklenirken kategori sayfasında tasarımla uyumlu iskelet kartlar, veri gelmezse
  sahte ürün yerine "Koleksiyon şu an yüklenemedi" mesajı gösteriliyor.
- Ana sayfa kartlarında yüklenirken "0 Parça" yazmıyor.
- Footer'daki kategori bağlantıları dinamik (yeni kategoriler otomatik görünür;
  ilk üç kategorinin mevcut metinleri korundu).

**Yönetim paneli**
- Şifre "didi" sistemi tamamen kaldırıldı. Yeni `AdminLogin` bileşeni: e-posta + şifre,
  ilk kurulum için "Hesap oluşturun", "Şifremi unuttum", e-postadan gelinince "Yeni şifre belirle".
  Görünüm önceki giriş kartıyla aynı. Supabase hata mesajları Türkçeye çevriliyor.
- **Çöp Kutusu** sekmesi: silinen ürünler listelenir, tek tıkla geri getirilir.
  Silinen ürünler süresiz saklanır (otomatik temizleme yok — daha güvenli).
- **Yedek İndir** butonu: tüm katalog JSON dosyası olarak bilgisayara iner.
- Ürün formuna **Yayın durumu**: Yayında / Taslak (sitede görünmez) / Satıldı
  (görünür, "Satıldı" etiketi alır, sepete eklenemez).
- Silme onayı artık "çöp kutusuna taşınsın mı?" diye soruyor.

**Doğrulama:** tsc 0 hata, build başarılı; ana sayfa yeni veritabanından 5/1/1 ürünle
açıldı; yeni giriş ekranında hatalı giriş Türkçe hata verdi.

**Bekleyenler**
1. Kullanıcı: Supabase → Authentication → URL Configuration (Site URL + Redirect URLs).
2. Kullanıcı: `/admin` → "Hesap oluşturun" → e-postadaki onay bağlantısı.
3. Yeni kodun yayına alınması (GitHub'a push → Vercel). **O zamana kadar canlı sitedeki
   eski yönetim panelinden yapılan değişiklikler KAYDEDİLMEZ** (yazma kapalı).
4. Yayından sonra `sql/03_archive_store_data.sql` tekrar çalıştırılacak.
5. Veritabanı şifresi sohbet kaydında geçtiği için, veritabanı işleri bitince sıfırlanacak
   ve `.env.local` güncellenecek.

---

## 9. Alınan kararlar

| Tarih | Karar | Gerekçe |
|---|---|---|
| 2026-09-16 | Tasarım değiştirilmeyecek | Marka görünümü beğeniliyor |
| 2026-09-16 | Sipariş: Supabase kaydı + WhatsApp yönlendirmesi | Sipariş kaybı biter; ödeme altyapısı ve yasal yük gerekmez |
| 2026-09-16 | Yönetici girişi: Supabase Auth (e-posta + şifre) | Tarayıcıdaki şifre kontrolü güvenlik sağlamıyor |
| 2026-09-16 | Hiçbir ürün silinmeyecek | Canlı kayıtlar gerçek ürünler; yalnızca hatalı kayıt düzeltilecek |
| 2026-09-16 | "Kataloğu sıfırla" kaldırılacak | Tek tıkla tüm kataloğu yok etme riski |
| 2026-09-16 | Çeviri: OpenRouter, sunucu tarafında, kayıt anında bir kez | Anahtar tarayıcıya sızmaz, ziyaretçi başına maliyet oluşmaz |
| 2026-09-16 | Fotoğraflar Supabase Storage'a taşınacak | 5,6 MB indirme ve depolama kotası sorunlarının kaynağı |
| 2026-09-16 | Şema değişiklikleri `scripts/run-sql.mjs` ile yapılacak | Supabase paneline girmeden, tek bağlantı bilgisiyle |
| 2026-09-16 | Siparişte WhatsApp asıl, veritabanı ikinci kanal | Veritabanı erişilemezse bile sipariş kaybolmasın |
| 2026-09-16 | Tüm görseller dikey 3:4 standardında | Üretim araçlarının hazır oranlarıyla birebir uyum |
| 2026-09-16 | Veri taşıma API yerine doğrudan bağlantı + tek transaction ile | API süre sınırı; yarım taşıma riskini sıfırlamak |
| 2026-09-16 | API üzerinden kalıcı silme tamamen kapalı | Altın kural 5'i veritabanı seviyesinde garanti etmek |
| 2026-09-16 | Çöp kutusu süresiz saklar | Otomatik temizleme, fark edilmeyen veri kaybına yol açabilir |
| 2026-09-16 | Ürünler tarayıcıda önbelleğe alınmaz | Kota dolunca sahte ürün gösterme hatasının kökünü kesmek |

---

## 10. Yeni bir geliştirici / asistan için hızlı başlangıç

1. Bu dosyanın tamamını oku; özellikle **Altın kurallar** bölümünü.
2. `npm install && npm run dev` ile projeyi ayağa kaldır.
3. Canlı veriyi değiştiren bir işe başlamadan önce `backups/` klasörüne yedek al.
4. Tasarıma (renk, yazı tipi, düzen, animasyon) dokunma.
5. İşi bitirince **Süreç günlüğü** ve **Aşama planı** bölümlerini güncelle,
   sonra tek ve açıklayıcı bir commit at.
