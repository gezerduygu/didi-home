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
5. **Silme işlemi geri alınabilir olmalı.** Silinen kayıt `deleted_at` ile işaretlenir,
   30 gün çöp kutusunda bekler; kalıcı silme ayrı ve bilinçli bir işlemdir.
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
│  ├─ components/          Arayüz bileşenleri
│  ├─ context/             Dil (TR/EN) sağlayıcısı
│  ├─ data.ts              Veri erişim katmanı
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
| `OPENROUTER_API_KEY` | Yalnızca sunucu (`api/translate`) | **Evet** |
| `OPENROUTER_MODEL` | Sunucu, çeviri modeli adı | Hayır |

---

## 6. Veri modeli

### Mevcut durum (devralınan yapı — Aşama 1'de değişecek)

`store_data` adlı tek tabloda üç satır: `products`, `categories`, `covers`.
Her satırın `value` sütununda tüm liste tek bir JSON olarak durur.
Sorunları: her kayıtta tüm katalog üzerine yazılır, eşzamanlı düzenlemede
son yazan kazanır, fotoğraflar JSON içine base64 olarak gömülüdür (5,6 MB indirme).

### Hedef yapı

- `products` — ürün başına bir satır (`id`, `title`, `category_id`, `price`,
  `story`, `images[]`, `status` (taslak/yayında/satıldı), `sort_order`,
  `deleted_at`, `updated_at`, İngilizce alanlar)
- `categories` — kategori başına bir satır
- `settings` — kapak görselleri gibi tekil ayarlar
- `orders` — gelen siparişler
- `revisions` — her değişiklikten önceki hali saklayan otomatik sürüm geçmişi
- Fotoğraflar `product-images` adlı Supabase Storage klasöründe; veritabanında
  yalnızca adresleri durur.

---

## 7. Aşama planı

- [x] **Aşama 0 — Güvenlik ve acil düzeltmeler** _(tamamlandı: 2026-09-16)_
- [ ] **Aşama 1 — Veri modeli ve veri kaybı korumaları**  ← sıradaki
- [ ] **Aşama 2 — Gerçek yönetici girişi (Supabase Auth + RLS)**
- [ ] **Aşama 3 — Fotoğraf altyapısı (Storage) ve panel ölçü rehberi**
- [ ] **Aşama 4 — Sipariş akışı (kayıt + WhatsApp)**
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

---

## 10. Yeni bir geliştirici / asistan için hızlı başlangıç

1. Bu dosyanın tamamını oku; özellikle **Altın kurallar** bölümünü.
2. `npm install && npm run dev` ile projeyi ayağa kaldır.
3. Canlı veriyi değiştiren bir işe başlamadan önce `backups/` klasörüne yedek al.
4. Tasarıma (renk, yazı tipi, düzen, animasyon) dokunma.
5. İşi bitirince **Süreç günlüğü** ve **Aşama planı** bölümlerini güncelle,
   sonra tek ve açıklayıcı bir commit at.
