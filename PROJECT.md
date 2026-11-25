# Didi Home — Proje Dokümanı

> **Bu dosya projenin tek kaynağıdır.** Projeye yeni katılan bir geliştirici ya da yapay zekâ asistanı
> çalışmaya buradan başlar. Kod değiştiren herkes, işi bitirdiğinde bu dosyadaki
> **Süreç Günlüğü** ve **Aşama Planı** bölümlerini günceller.

Son güncelleme: 2026-11-25

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
├─ api/                         Vercel sunucu fonksiyonları (gizli anahtarlar yalnızca burada)
│  ├─ keepalive.ts              Supabase'in uykuya dalmasını önler (3 günde bir, vercel.json → crons)
│  └─ translate.ts              Otomatik İngilizce çeviri (OpenRouter, yalnızca yönetici)
├─ backups/                     Canlı veri yedekleri (git'e gönderilmez)
├─ docs/
│  └─ glossary.md               Çeviri sözlüğü (shared/ceviriSozlugu.ts'ten üretilir)
├─ public/
│  ├─ images/                   Statik görseller (ilk ürünler ve varsayılan kapaklar)
│  ├─ robots.txt
│  └─ sitemap.xml               Her derlemede otomatik üretilir
├─ scripts/
│  ├─ run-sql.mjs               SQL dosyası çalıştırıcı (Supabase paneline girmeden)
│  ├─ migrate-store-data.mjs    [tamamlandı] Eski tek-JSON → tablolar
│  ├─ migrate-images-to-storage.mjs  [tamamlandı] Base64 fotoğraflar → Storage
│  ├─ generate-sitemap.mjs      Site haritası üretici (npm run build öncesi otomatik)
│  └─ generate-glossary-doc.ts  docs/glossary.md üretici
├─ shared/                      Tarayıcı ve sunucunun ortak kullandığı kod
│  ├─ yoneticiler.ts            Yönetici e-posta listesi (TEK KAYNAK)
│  └─ ceviriSozlugu.ts          Marka terimleri ve çeviri üslubu (TEK KAYNAK)
├─ sql/                         Veritabanı değişiklikleri, numara sırasıyla
├─ src/
│  ├─ components/
│  │  ├─ AdminPanel.tsx         Yönetim paneli (ayrı dosya olarak tembel yüklenir)
│  │  ├─ AdminLogin.tsx         Yönetici girişi / hesap oluşturma / şifre sıfırlama
│  │  ├─ AdminOrders.tsx        Siparişler sekmesi
│  │  └─ ...                    Mağaza bileşenleri (tasarım korunuyor)
│  ├─ context/LanguageContext   TR/EN arayüz metinleri; ürün EN metinleri veritabanından
│  ├─ hooks/useModalBehavior    Pencerelerde ESC ve arka plan kaydırma kilidi
│  ├─ auth.ts                   Supabase Auth işlemleri
│  ├─ images.ts                 Görsel küçültme (1200×1600) ve Storage'a yükleme
│  ├─ orders.ts                 Sipariş: WhatsApp mesajı + veritabanı kaydı
│  ├─ store.ts                  Veri erişim katmanı (TÜM okuma/yazma buradan)
│  ├─ supabase.ts               Supabase istemcisi
│  ├─ translate.ts              Çeviri istemcisi (api/translate'i çağırır)
│  └─ types.ts                  Tip tanımları
├─ vercel.json                  Yönlendirmeler, zamanlanmış görev, önbellek başlıkları
├─ PROJECT.md                   ← bu dosya
└─ README.md                    Kısa kurulum notu
```

---

## 5. Kurulum ve çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000  (api/ fonksiyonları yerelde ÇALIŞMAZ; çeviri yalnızca yayında)
npm run build    # önce site haritasını üretir, sonra derler
npm run lint     # TypeScript tip kontrolü

# Veritabanı (gerekli: .env.local → SUPABASE_DB_URL)
node scripts/run-sql.mjs --test              # bağlantı testi, tabloları listeler
node scripts/run-sql.mjs sql/DOSYA.sql       # SQL dosyası çalıştır
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

| Tablo | İçerik | Not |
|---|---|---|
| `products` | Ürün başına bir satır | `status`: taslak / yayinda / satildi · `deleted_at`: çöp kutusu · `sort_order` · `*_en` İngilizce alanlar · `images[]`: Storage adresleri |
| `categories` | Kategori başına bir satır | `image`: ana sayfa vitrin görseli (**tek kaynak**) · `subcategories[]` |
| `orders` | Siparişler | `siparis_no` (DH-YYYYAAGG-XXX, WhatsApp mesajıyla aynı) · `status` |
| `revisions` | Otomatik sürüm geçmişi | products/categories her güncellenip silindiğinde **önceki hal** buraya yazılır |
| `settings` | Genel ayarlar | `covers` anahtarı artık kullanılmıyor (vitrin görselleri categories.image'a taşındı) |
| `store_data` | ARŞİV | Eski tek-JSON yapı; API erişimi kapalı, yedek olarak duruyor |

**Fotoğraflar:** Supabase Storage → `gorseller` deposu.
Klasörler: `urunler/YYYY-AA/`, `vitrin/YYYY-AA/`, `tasima-2026-09-16/` (eski base64'lerden taşınanlar).
Veritabanında yalnızca herkese açık adresleri durur. Panel yüklemeden önce görseli en fazla
1200 × 1600 piksele (3:4) küçültür.

**Sürüm geçmişinden geri dönmek** (şimdilik panelde yok, SQL ile):
```sql
-- Bir ürünün geçmiş halleri, en yenisi üstte
select id, action, changed_at, data->>'title' as baslik, data->>'price' as fiyat
from revisions where table_name = 'products' and row_id = 'URUN_ID' order by changed_at desc;
```

### Güvenlik kuralları özeti (`sql/02_security.sql`)

| Kim | Ürün / Kategori / Ayar | Sipariş | Sürüm geçmişi |
|---|---|---|---|
| Ziyaretçi | Yalnızca yayındakileri **okur** | **Ekler**, okuyamaz | Erişemez |
| Yönetici (`is_admin()`) | Okur, ekler, günceller | Okur, günceller | Okur |
| Herkes | **Kalıcı silme yok** (DELETE kuralı tanımlı değil) | Silme yok | — |

Depo (`gorseller`): herkes görüntüler, yalnızca yönetici yükler, API'den silme yok.

Yönetici listesi iki yerde tutulur ve **ikisi birlikte** güncellenmelidir:
`shared/yoneticiler.ts` (arayüz + çeviri fonksiyonu) ve `sql/02_security.sql → is_admin()` (asıl koruma;
değiştirdikten sonra `node scripts/run-sql.mjs sql/02_security.sql`).

### SQL dosyaları (sırayla)

| Dosya | Ne yapar | Durum |
|---|---|---|
| `sql/01_schema.sql` | Tablolar, tetikleyiciler, sürüm geçmişi | ✅ Çalıştırıldı |
| `sql/02_security.sql` | RLS kuralları, `is_admin()` | ✅ Çalıştırıldı |
| `sql/03_archive_store_data.sql` | Eski tabloyu API'ye tamamen kapatır | ⏳ Yeni kod yayına alınınca **tekrar** çalıştırılacak |
| `sql/03b_store_data_readonly_until_deploy.sql` | GEÇİCİ: canlı eski kod için salt okuma | ⏳ Yayından sonra 03 ile kaldırılacak |
| `sql/04_unify_showcase_images.sql` | Vitrin görselini categories.image'da topladı | ✅ Çalıştırıldı |
| `sql/05_storage.sql` | `gorseller` deposu ve kuralları | ✅ Çalıştırıldı |
| `sql/06_orders_no.sql` | Siparişlere `siparis_no` sütunu | ✅ Çalıştırıldı |

**Yeni SQL eklerken:** bir sonraki numarayla dosya oluşturun, tekrar çalıştırılabilir yazın
(`if not exists`, `drop policy if exists`), çalıştırın ve bu tabloya ekleyin.

Çalıştırma: `node scripts/run-sql.mjs sql/DOSYA.sql` (`.env.local` içinde `SUPABASE_DB_URL` gerekir).

---

## 7. Aşama planı

- [x] **Aşama 0 — Güvenlik ve acil düzeltmeler**
- [x] **Aşama 1 — Veri modeli ve veri kaybı korumaları**
- [x] **Aşama 2 — Gerçek yönetici girişi (Supabase Auth + RLS)** — kod hazır; yönetici hesabı yayından sonra oluşturulacak
- [x] **Aşama 3 — Fotoğraf altyapısı (Storage) ve panel ölçü rehberi**
- [x] **Aşama 4 — Sipariş akışı (WhatsApp + kayıt + panelde Siparişler)**
- [x] **Aşama 5 — Otomatik İngilizce çeviri** — altyapı hazır; OpenRouter anahtarı eklenince etkinleşir
- [x] **Aşama 6 — Hız, SEO, Supabase uyku önleyici, kod temizliği**
- [x] **Yayın** — 2026-11-16'da yapıldı; kullanıcının yapacakları için bkz. Bölüm 11

### Gelecekte değerlendirilebilecekler

- Paylaşılan ürün bağlantılarında ürüne özel önizleme görseli (WhatsApp/Instagram tarayıcıları
  JavaScript çalıştırmaz; Vercel Middleware ile sunucu tarafında meta etiketi gerekir).
- Sürüm geçmişinden panelden tek tıkla geri dönme ekranı.
- Ödeme altyapısı gerekirse satışın ikas / Shopier / Shopify'a taşınması; bu site vitrin olarak kalır.
- Yeni sipariş gelince e-posta bildirimi (şu an WhatsApp mesajı bildirim görevi görüyor).

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

### 2026-09-16 — Kategori pürüzleri, Aşama 3, 4, 5, 6

**Kategori pürüzleri**
- Ana sayfa vitrin görseli `settings.covers`'tan, panel ise `categories.image`'dan okuyordu;
  3 kategoriden 2'sinde değerler farklıydı. `sql/04` ile tek kaynak `categories.image` yapıldı
  (değer olarak ziyaretçinin o an gördüğü görsel alındı; eski değerler revisions'a yazıldı).
  "Kapak Fotoğrafları" sekmesi artık kategorilerden üretiliyor.
- Ana sayfa ızgarası kategori sayısına göre: 4 → 2×2 / 4 sütun; diğerlerinde son satır ortalanıyor.
- Ürün sayfasında yeni kategoriler kod yerine adla görünüyor.

**Aşama 3 — Storage**
- `gorseller` deposu (`sql/05`), `src/images.ts` ile yüklemeler depoya gidiyor.
- `scripts/migrate-images-to-storage.mjs`: 19 kullanımdaki 14 benzersiz gömülü görsel orijinal
  baytlarıyla yüklendi, adreslerinden indirilip birebir doğrulandı, veritabanı tek transaction'da
  güncellendi. Servis anahtarı kullanmamak için yalnızca taşıma klasörüne ekleme izni veren
  geçici bir kural açılıp hemen kaldırıldı.
- **Ölçüm:** ziyaretçinin indirdiği veri 5.636.327 bayt → ~10 KB; süre 3,9 sn → 0,5 sn.

**Aşama 4 — Siparişler sekmesi**
- `sql/06`: `siparis_no` sütunu. `AdminOrders.tsx`: liste, durum filtresi, durum güncelleme,
  müşteriye telefon / e-posta / WhatsApp bağlantısı, yeni sipariş rozeti.

**Aşama 6 — Hız ve SEO**
- Yönetim paneli ayrı dosyaya bölündü (ziyaretçi 97 KB daha az indiriyor).
- Görsellerde tembel yükleme; sekme başlığı ve meta açıklama ürüne/kategoriye göre.
- Her derlemede `public/sitemap.xml` üretiliyor.
- `api/keepalive.ts` + Vercel cron (3 günde bir): Supabase ücretsiz paketinde 7 günlük
  hareketsizlikte proje uyutulmasın.
- Kullanılmayan `HomeDesignModal.tsx` silindi.

**Aşama 5 — Çeviri**
- `api/translate.ts` (yalnızca yönetici, anahtar sunucuda), `shared/ceviriSozlugu.ts` (47 terim),
  panelde EN alanları, "Türkçeden çevir", kaydederken otomatik çeviri, toplu "EN çevirisi eksik".
- Koda gömülü eski ürün çeviri tablosu kaldırıldı (panel düzenlemelerini eziyordu).
  **Not:** mevcut ürünlerin İngilizce metinleri anahtar eklenince toplu çeviriyle oluşturulacak;
  o zamana kadar İngilizce seçen ziyaretçi ürünlerin Türkçesini görür.
- Yerel testler: anahtar yok → 503, giriş yok → 401, sahte oturum → 401.

**Araç notu:** Tarayıcı paneli arka planda kaldığında animasyon kareleri durduğu için sayfa
boş görünebiliyor (`requestAnimationFrame` 0 kare). Bu bir kod hatası değil; doğrulamalar
DOM ve ağ üzerinden yapıldı.

### 2026-10-03 — Fotoğraf köşelerindeki buğulanma giderildi

**Şikâyet:** Bazı ürün fotoğraflarının köşelerinde buğulanma/leke var.

**Teşhis:** Sitede görsellere uygulanan bir CSS efekti YOK (yalnızca hafif doygunluk ve
vitrin kartlarında alt gradyan). Buğu dosyaların içine işlenmiş. Geçmişte (bu çalışmadan önce)
fotoğrafların sağ alt köşesindeki yapay zekâ aracı filigranını (küçük yıldız) silmek için
o bölgeye bulanıklık/doldurma uygulanmış. Sonuç, filigrandan çok daha göze batan ~160×160
piksellik bir leke olmuş. Ölçüm: her dosyada değişen bölge aynı yerde, sağ alt köşede.

**Yapılan:** 8 statik fotoğraf (green_kaftan_1-4, black_peacock_1-2, teal_peacock_1-2)
ilk committeki (f1fc7b7) lekesiz hâlleriyle geri yüklendi. Sağ alt köşe keskinliği geri geldi
(ör. black_peacock_2 köşe/merkez oranı 0.02 → 3.52).

**Not 1:** Geri yüklenen dosyalarda aracın küçük yıldız işareti yine görünür durumda.
Bilerek silinmedi; bu bir kaynak/üretim işareti ve silinmesi kullanıcının kararı.
**Not 2:** Panelden yüklenen (Storage) fotoğraflarda da aynı leke var — özellikle
"Ev Renovasyon" ürününün fotoğrafları. Bunların lekesiz kopyası depoda/geçmişte yok;
çözüm, yeni panelden (artık hiçbir efekt uygulamıyor) yeniden yüklemek.
**Not 3:** teal_peacock_1 için geçmişte iki farklı sürüm vardı; c3c891f sürümü yanlış
fotoğraf (çerçeveli tablo). Doğrusu ilk committeki kaftan fotoğrafı.

Görsellerin tam envanteri (hangisi temiz, hangisinde yıldız var, hangisi yalnızca lekeli):
**docs/gorsel-envanteri.md**

Ölçüm aracı kalıcı hale getirildi: `python scripts/kose-bulaniklik-olc.py` (parametresiz
çalıştırılınca public/images/products altındaki tüm fotoğrafları ölçer).

### 2026-11-16 — Yeni fotoğraflar yerleştirildi, site portfolyo moduna alındı

**İstek:** Paylaşılan Drive klasöründeki ("Didi Home": Ana Sayfa Foto, Sabahlık Fotolar, Seramik,
Ev, Kilim) yeni fotoğrafların siteye yerleştirilmesi; aynı ürünün eskisi varsa yenisiyle
değiştirilmesi; sipariş/alışveriş kısmının şimdilik görünmez olması.

**Görseller** (`scripts/yeni-gorseller-2026-11.mjs`, önce yedek: `backups/yeni-gorseller-oncesi-2026-11-16-11-53.json`):
- 110 dosya incelendi, 55 görsel seçildi. Panelin yaptığı gibi en fazla 1200×1600'e küçültüldü
  (JPEG 86); oranı 3:4'e çok yakın olanlar birkaç pikselle tam 3:4'e kırpıldı. Hiçbir efekt yok.
  Sağ alt köşeler tek tek kontrol edildi: filigran ya da leke yok.
- Storage'a yüklendi (`gorseller/urunler/2026-11/`, `gorseller/vitrin/2026-11/`), her dosya
  adresinden indirilip birebir doğrulandı. Geçici yükleme kuralı betik sonunda kaldırıldı.
- **Vitrin:** Haute Couture ve Ev kategorilerinin kapağı değişti (Seramik kapağı aynı kaldı).
- **Görselleri değişen 6 ürün:** Sarı İşlemeli Kaftan, Zümrüt Yeşili Nakışlı Kaftan, Siyah
  Tavuskuşlu Nakışlı Kaftan, Petrol Yeşili Tavuskuşu Sabahlık, Mor Çiçek İşlemeli Kimono,
  Ev Renovasyon. Böylece envanterdeki lekeli ve yıldızlı fotoğrafların hepsi siteden kalktı.
- **23 yeni ürün:** 3 kıyafet (Hardal Sarısı İşlemeli Kaban, Siyah Kare İşlemeli Kaftan,
  Şal Desenli Kaftan), 1 kilim, 19 seramik. Başlık ve hikâyeler fotoğraflara bakılarak yazıldı;
  **fiyatları 0** (sitede fiyat gösterilmiyor), ölçü/malzeme ayrıntıları ve İngilizce çevirileri
  boş. Yönetici panelden düzeltebilir.
- Kullanılmayanlar: "orjinal eski", "Orjinal JPG", "orjinal", "Behram" klasörlerindeki ham
  fotoğraflar ve video.
- Eski dosyalar silinmedi (depodan silme zaten kapalı; `public/images/products` altındakiler
  artık kullanılmıyor ama duruyor). Eski değerler `revisions` tablosunda.

**Portfolyo modu:** `src/ozellikler.ts` → `SIPARIS_AKTIF = false`. Sepet düğmesi, "Sepete Ekle",
kargo notu, sepet çekmecesi, fiyatlar ve fiyata göre sıralama gizlendi. Kod silinmedi; değer
`true` yapılınca hepsi geri gelir. **Yeniden açmadan önce yeni ürünlere fiyat girilmeli.**

### 2026-11-17 → 2026-11-25 — Küçük işler ve Antigravity'ye devir

- 2026-11-17: "Wabi-Sabi Ham Kum Vazo" (`ser-1`) çöp kutusuna taşındı; `prod_img_15.jpg` ve paneldeki
  hazır seçeneği kaldırıldı (yedek: `backups/ser-1-kaldirmadan-once-2026-11-17-08-31.json`).
- 2026-11-18: Seramik kategorisi vitrin görseliyle ilgili veritabanı işlemi (yedek:
  `backups/seramik-vitrin-oncesi-2026-11-18.json`).
- 2026-11-24: Footer'a "Yönetici Paneli" bağlantısı (`9ce69ff`, devir anında push edilmemişti).
- 2026-11-25: Proje Antigravity'ye taşınıyor. Taşınma kontrol listesi, git durumu ve devir notları:
  **[ANTIGRAVITY-DEVIR.md](ANTIGRAVITY-DEVIR.md)**.

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
| 2026-09-16 | Vitrin görselinin tek kaynağı categories.image | İki ayrı kaynak, panel değişikliğinin siteye yansımamasına yol açıyordu |
| 2026-09-16 | Görseller yüklenmeden önce 1200×1600'e küçültülür | Hız; 3:4 standardı; depolama kotası |
| 2026-09-16 | Depodan API ile dosya silinemez | Silinen ürün çöp kutusundan geri geldiğinde fotoğrafı da yerinde olsun |
| 2026-09-16 | Çeviri yalnızca yönetici oturumuyla çağrılabilir | Herkese açık uç noktada başkaları OpenRouter kredisini harcayabilirdi |
| 2026-09-16 | Yönetici listesi ve çeviri sözlüğü shared/ klasöründe tek kaynak | Tarayıcı ve sunucu aynı listeyi kullansın |
| 2026-10-03 | Filigran silme amaçlı bulanıklaştırma yapılmayacak | Lekesi filigrandan daha kötü; işaretin kalıp kalmayacağı kullanıcının kararı |
| 2026-11-16 | Site şimdilik portfolyo: sipariş ve fiyat gizli (`SIPARIS_AKTIF`) | Kullanıcı kararı; alışveriş sonra eklenecek. Altyapı silinmedi, tek değerle geri açılır |

---

## 10. Yeni bir geliştirici / asistan için hızlı başlangıç

0. Antigravity'de çalışıyorsan önce **[ANTIGRAVITY-DEVIR.md](ANTIGRAVITY-DEVIR.md)** dosyasını oku.
1. Bu dosyanın tamamını oku; özellikle **Altın kurallar** (Bölüm 2).
2. `npm install && npm run dev` ile projeyi ayağa kaldır.
3. Veritabanı işi için `.env.local` içinde `SUPABASE_DB_URL` gerekir; bağlantıyı
   `node scripts/run-sql.mjs --test` ile doğrula.
4. Canlı veriyi değiştiren bir işe başlamadan önce `backups/` klasörüne yedek al.
5. **Canlı sitenin hangi kod sürümünde olduğunu kontrol etmeden** onun kullandığı bir
   tabloya/kurala dokunma (2026-09-16'daki olaydan ders).
6. Tasarıma (renk, yazı tipi, düzen, animasyon) dokunma. Görseller dikey 3:4.
7. Kod değiştirdikten sonra: `npm run lint` ve `npm run build` temiz olmalı.
8. İşi bitirince **Süreç günlüğü**, **Aşama planı** ve gerekirse **SQL dosyaları** tablosunu
   güncelle, açıklayıcı bir commit at.

---

## 11. Yayın (deploy) ve sonrası kontrol listesi

Yayın, GitHub'daki `main` dalına gönderilen commit'lerle Vercel tarafından otomatik yapılır.

**Yayından hemen sonra**
Yayın 2026-11-16'da yapıldı (commit `d73f0e2`).

- [x] didihome.store açılıyor (HTTP 200); herkese açık API 30 ürün döndürüyor
- [x] `/api/keepalive` → `{"tamam":true}`
- [x] `/sitemap.xml` açılıyor (34 adres)
- [x] Canlıdaki kod yeni sürüm (canlı pakette `store_data` geçmiyor)
- [x] `node scripts/run-sql.mjs sql/03_archive_store_data.sql` → geçici okuma izni kaldırıldı;
      tablo silinmedi (3 satır arşivde), API ile okunamıyor

**Kullanıcının yapacakları**
- [ ] Supabase → Authentication → URL Configuration: Site URL `https://didihome.store`,
      Redirect URLs `https://didihome.store/**` ve `http://localhost:3000/**`
- [ ] `didihome.store/admin` → "Hesap oluşturun" → e-postadaki onay bağlantısı
- [ ] Panelde bir ürünü düzenleyip kaydederek yazma yetkisini doğrulama
- [ ] OpenRouter anahtarı: Vercel → Settings → Environment Variables → `OPENROUTER_API_KEY`
      (+ isteğe bağlı `OPENROUTER_MODEL`), ardından Vercel'de yeniden yayın (Redeploy)
- [ ] Panelde "EN çevirisi eksik" düğmesiyle mevcut ürünleri çevirme
- [ ] Sohbette paylaşılan veritabanı şifresini sıfırlama ve `.env.local`'ı güncelleme

## 12. Günlük kullanım (yönetici için)

| İş | Nerede |
|---|---|
| Ürün ekle / düzenle | Panel → Ürün Yönetimi → Yeni Ürün Ekle / kalem simgesi |
| Ürünü gizle ama silme | Ürün formu → Yayın durumu → **Taslak** |
| Satılan ürünü işaretle | Ürün formu → Yayın durumu → **Satıldı** |
| Silinen ürünü geri getir | Panel → **Çöp Kutusu** → Geri Getir |
| Sıralamayı değiştir | Ürün listesinde sürükle-bırak ya da oklar |
| Kategori / alt başlık ekle | Panel → Kategori Yönetimi |
| Ana sayfa vitrin görseli | Panel → Kapak Fotoğrafları (ya da kategori düzenleme penceresi — aynı değer) |
| Siparişleri takip et | Panel → **Siparişler** (WhatsApp'a gelen DH-... numarasıyla eşleşir) |
| Tüm kataloğun yedeği | Panel üst çubuk → **Yedek İndir** |
| Görsel ölçüsü | Dikey **3:4**, ideal 1200 × 1600 piksel |
