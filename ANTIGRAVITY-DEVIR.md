# Didi Home — Antigravity'ye Devir Dosyası

> **Antigravity'deki yapay zekâ asistanına:** Bu projede çalışmaya başlamadan önce bu dosyanın
> tamamını, ardından [`PROJECT.md`](./PROJECT.md) dosyasını oku. Bu dosya, Claude Code ile
> yapılan tüm çalışmanın özeti ve devir notudur. `PROJECT.md` projenin ayrıntılı tek kaynağıdır;
> bu dosya ise taşınma anındaki durumu, açık işleri ve çalışma kurallarını tek yerde toplar.

Devir tarihi: **2026-11-25**

---

## 0. Taşınma kontrol listesi (önce bunu yap)

Proje klasörü zaten `D:\CODING TOOLS\ANTIGRAVITY\didi-home` konumunda. **En kolay ve en güvenli yol,
Antigravity'de bu klasörü olduğu gibi açmaktır** (File → Open Folder). Böylece git'e girmeyen
gizli dosyalar ve yedekler de yerinde kalır.

| # | Adım | Durum |
|---|---|---|
| 1 | Antigravity'de `D:\CODING TOOLS\ANTIGRAVITY\didi-home` klasörünü aç | ☐ |
| 2 | **Push edilmemiş 1 commit var** (`9ce69ff`, footer'a "Yönetici Paneli" bağlantısı). Yayına almak istiyorsan `git push origin main` (push = Vercel'de otomatik yayın). İstemiyorsan bekletebilirsin; yerelde güvende. | ☐ |
| 3 | Bu devir dosyasını (`ANTIGRAVITY-DEVIR.md`) commit et; push ile birlikte GitHub'a gider (bkz. Bölüm 2) | ☐ |
| 4 | `npm install` (node_modules zaten var; yeni bir klasöre klonladıysan gerekli) | ☐ |
| 5 | `npm run lint` → 0 hata, `npm run dev` → http://localhost:3000 açılıyor mu | ☐ |
| 6 | `node scripts/run-sql.mjs --test` → veritabanı bağlantısı çalışıyor mu (`.env.local` gerekir) | ☐ |
| 7 | Antigravity asistanına ilk mesaj olarak: *"ANTIGRAVITY-DEVIR.md ve PROJECT.md dosyalarını oku, kurallara uy."* | ☐ |

### Git'e GİRMEYEN, elle korunması gereken dosyalar

Projeyi **başka bir klasöre / bilgisayara** taşıyacaksan (ör. `git clone` ile), aşağıdakiler
GitHub'da yoktur; elle kopyalanmazsa kaybolur:

| Dosya / klasör | İçerik | Neden önemli |
|---|---|---|
| `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Site yerelde veriye bağlanamaz |
| `.env.local` | `SUPABASE_DB_URL` (veritabanı şifresi içerir — **GİZLİ**) | `scripts/run-sql.mjs` ve taşıma betikleri çalışmaz |
| `backups/` | 7 adet canlı veri yedeği (JSON) | Geri dönüş için tek kopya |
| `scratch/`, `.antigravity/`, `.vscode/` | Yerel araç dosyaları | Önemsiz |

`.env.example` git'tedir ve tüm değişken adlarını açıklar. Hiçbir anahtar kod dosyasına veya
bu belgeye yazılmaz.

Mevcut yedekler (`backups/`):
```
supabase-full-2026-09-16_1038.json              ilk tam yedek (eski yapı)
store_data-tasima-oncesi-2026-09-16-08-19.json  veri modeli taşıması öncesi
store_data-tasima-oncesi-2026-09-16-10-18.json  veri modeli taşıması öncesi (asıl)
gorseller-tasima-oncesi-2026-09-16-16-06.json   fotoğrafların Storage'a taşınması öncesi
yeni-gorseller-oncesi-2026-11-16-11-53.json     55 yeni fotoğraf yerleştirilmeden önce
ser-1-kaldirmadan-once-2026-11-17-08-31.json    "Wabi-Sabi Ham Kum Vazo" çöpe taşınmadan önce
seramik-vitrin-oncesi-2026-11-18.json           Seramik kategori satırı, vitrin işleminden önce
```

---

## 1. Proje kimliği

| | |
|---|---|
| Ad | **Didi Home** |
| Canlı adres | https://didihome.store |
| Yönetim paneli | https://didihome.store/admin (Supabase Auth, e-posta + şifre) |
| Ne yapar | El yapımı seramik, nakışlı kıyafet (kaftan, kimono, sabahlık) ve vintage ev objeleri vitrini |
| Şu anki mod | **Portfolyo modu** — sepet, sipariş ve fiyatlar gizli (`src/ozellikler.ts` → `SIPARIS_AKTIF = false`) |
| Yönetici | Teknik bilgisi olmayan bir kullanıcı; panel sade, affedici ve veri kaybına karşı korumalı olmalı |
| Yönetici e-postası | `shared/yoneticiler.ts` ve `sql/02_security.sql → is_admin()` içinde (ikisi birlikte güncellenir) |
| Dil | Arayüz ve tüm dokümanlar **Türkçe**; kullanıcıyla Türkçe konuşulur |

---

## 2. Git ve yayın bilgileri

| | |
|---|---|
| Uzak depo | `https://github.com/gezerduygu/didi-home.git` (`origin`) |
| Ana dal | `main` (tek dal; başka dal yok) |
| Yayın | `main`'e push → **Vercel otomatik deploy** (ayrı bir yayın komutu yok) |
| Commit yazarı | `Didi Home <admin@didihome.com>` (yerel `git config`) |
| Commit sayısı | 42 (devir anında) |
| Commit mesaj dili | Türkçe, ASCII (ör. "Gorsel envanteri: ...") |

**Taşınma anındaki durum (2026-11-25):**
```
origin/main  = 8307d63  Generik Wabi-Sabi vazo sistemden kaldirildi   ← CANLIDA olan
main (yerel) = 9ce69ff  Ana sayfa alt bilgisine Yonetici Paneli baglantisi eklendi  ← PUSH EDİLMEDİ
ANTIGRAVITY-DEVIR.md     = yeni dosya, henüz commit edilmedi
Bu dosya dışında commit edilmemiş değişiklik yok.
```

> ⚠️ Push etmek = siteyi yayına almak. `9ce69ff` footer'a herkese görünür bir "Yönetici Paneli"
> bağlantısı ekler. Aşama 0'da güvenlik için bu bağlantı kaldırılmıştı; artık asıl koruma
> Supabase Auth + RLS olduğundan bağlantının görünmesi güvenlik açığı değildir, ama yayına
> almadan önce kullanıcıyla teyit et.

Son commitler:
```
9ce69ff Ana sayfa alt bilgisine Yonetici Paneli baglantisi eklendi      (2026-11-24, push edilmedi)
8307d63 Generik Wabi-Sabi vazo sistemden kaldirildi                    (2026-11-17)
95e023b PROJECT.md: yayin ve arsivleme kontrol listesi tamamlandi       (2026-11-17)
d73f0e2 Yeni fotograflar yerlestirildi, site portfolyo moduna alindi   (2026-11-16, YAYIN)
756a912 Expand CLAUDE.md with full project context and rules
1bcc6d2 Add CLAUDE.md for continuing work with Claude Code
08fb576 Gorsel envanteri: her fotografin durumu belgelendi
dd3053d Fotograf koselerindeki bugulanma giderildi (8 statik fotograf)
bfd73b0 Yayin oncesi: paylasilan baglantida ana sayfa titremesi giderildi
1737fd1 Asama 5: otomatik Ingilizce ceviri altyapisi (OpenRouter)
a6ae835 Asama 6: hiz, SEO ve Supabase uyku onleyici
18599ec Asama 4 tamamlandi: yonetim panelinde Siparisler sekmesi
b8affac Asama 3: fotograflar Supabase Storage'a tasindi (5,6 MB -> ~10 KB)
e05b8ca Kategori puruzleri: vitrin gorseli tek kaynakta, 4+ kategori duzeni, urun etiketi
083ca1a Asama 1 ve 2: yeni veri yapisina gecis, gercek yonetici girisi, cop kutusu
...     (daha eskileri: devralınan kod ve Aşama 0 hazırlıkları)
```

---

## 3. Teknoloji yığını ve ortam

| Katman | Teknoloji |
|---|---|
| Arayüz | React 19 + TypeScript 5.8, Vite 6 |
| Stil | Tailwind CSS 4 (`src/index.css` içinde `@theme` marka renkleri) |
| Animasyon / ikon | Motion (`motion/react`), `lucide-react` |
| Veri / Auth / Dosya | Supabase (PostgreSQL + Auth + Storage, `gorseller` deposu) |
| Sunucu fonksiyonları | Vercel Serverless (`api/keepalive.ts`, `api/translate.ts`) |
| Zamanlanmış görev | `vercel.json` → `/api/keepalive`, 3 günde bir 06:00 (Supabase uyumasın) |
| Yerel geliştirme makinesi | Windows 11, Node 24.12, npm 11.6 |

### Komutlar
```bash
npm install
npm run dev        # http://localhost:3000  (api/ fonksiyonları yerelde ÇALIŞMAZ)
npm run lint       # tsc --noEmit → her değişiklikten sonra 0 hata olmalı
npm run build      # prebuild: sitemap.xml üretir, sonra vite build
npm run preview    # derlemeyi yerelde önizleme

node scripts/run-sql.mjs --test            # veritabanı bağlantı testi
node scripts/run-sql.mjs sql/DOSYA.sql     # SQL dosyası çalıştır
python scripts/kose-bulaniklik-olc.py      # fotoğraf köşe bulanıklığı ölçümü
```

`.claude/launch.json` önizleme yapılandırmaları: `didi-home` (npm run dev, 3000) ve
`didi-home-uretim` (vite preview, 4173). Antigravity bunları kullanmaz; bilgi amaçlı.

### Ortam değişkenleri

| Değişken | Nerede | Gizli mi? |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` / Vercel | Hayır |
| `VITE_SUPABASE_ANON_KEY` | `.env` / Vercel | Hayır (RLS korur) |
| `VITE_WHATSAPP_NUMBER` | Vercel (yoksa koddaki varsayılan) | Hayır |
| `VITE_SITE_URL` | Vercel | Hayır |
| `SUPABASE_DB_URL` | **Yalnızca** `.env.local` — Vercel'e eklenmez | **Evet** |
| `OPENROUTER_API_KEY` | **Yalnızca** Vercel | **Evet** |
| `OPENROUTER_MODEL` | Vercel (boşsa `anthropic/claude-sonnet-4`) | Hayır |

---

## 4. Değiştirilemez kurallar

### Tasarım
- Renkler (bej / kum / terracotta, wabi-sabi), yazı tipleri, boşluklar, animasyonlar ve sayfa
  düzeni **korunur**. Yapılan işler işlevsellik, güvenlik, performans ve veri güvenliği üzerinedir.
- Tüm ürün ve vitrin görselleri dikey **3:4**, ideal **1200 × 1600 px**.

### Altın kurallar (veri kaybını önleme)
1. **Canlı veriye dokunmadan önce yedek al** → `backups/` (git'e girmez).
2. **Toplu üzerine yazma yok.** Bir ürün güncellenirken yalnızca o ürünün satırı yazılır.
3. **Veri gelmeden kayıt yapılmaz.** Bulut verisi yüklenmeden kayıt engellenir.
4. **Demo/sahte ürün fallback'i yok.** Veri gelmezse boş ekran + hata mesajı.
5. **Geri alınabilir silme.** `deleted_at` ile çöp kutusu, süresiz. API'den kalıcı silme
   veritabanı kurallarıyla kapalı; Storage'dan da API ile dosya silinemez.
6. **"Hepsini sıfırla" türü toplu yıkıcı buton yok.**
7. **Başarı mesajı ancak kayıt doğrulandıktan sonra.**
8. **Görsellere bulanıklaştırma yok** (filigran silmek için köşe bulanıklaştırma yapılmaz).
9. **Canlı sitenin hangi kod sürümünde olduğunu kontrol etmeden** onun kullandığı tabloya/kurala
   dokunma (2026-09-16'da 1-2 dakikalık kesinti yaşandı).

### Çalışma alışkanlıkları
- Her iş sonunda: `npm run lint` + `npm run build` temiz → `PROJECT.md` Süreç günlüğü / Aşama planı /
  SQL tablosu güncellenir → açıklayıcı Türkçe commit.
- Yeni SQL: bir sonraki numarayla (`sql/07_...sql`), tekrar çalıştırılabilir yazılır
  (`if not exists`, `drop policy if exists`), çalıştırılır, `PROJECT.md` Bölüm 6 tablosuna eklenir.
- Canlı veriyi değiştiren betikler (`scripts/`) önce yedek alır, deneme modunda çalışır,
  doğrudan DB bağlantısı + **tek transaction** kullanır ve sonunda doğrular.
- Storage'a betikle yükleme gerekirse: servis anahtarı kullanılmaz; geçici bir yükleme kuralı açılır,
  iş bitince kaldırılır (`scripts/yeni-gorseller-2026-11.mjs` örnek).
- Yönetim paneli formlarında ESC ile kapanma **bilerek yok** (yarım form kaybolmasın).

---

## 5. Mimari özet

```
api/            keepalive.ts (cron), translate.ts (OpenRouter, yalnızca yönetici oturumu)
shared/         yoneticiler.ts (yönetici listesi), ceviriSozlugu.ts (47 marka terimi) — TEK KAYNAK
sql/            01_schema … 06_orders_no (hepsi çalıştırıldı)
scripts/        run-sql.mjs, generate-sitemap.mjs, generate-glossary-doc.ts,
                migrate-*.mjs [tamamlandı], yeni-gorseller-2026-11.mjs [tamamlandı],
                kose-bulaniklik-olc.py
src/store.ts    TÜM veri okuma/yazma
src/auth.ts     Supabase Auth
src/images.ts   1200×1600'e küçültme + Storage yükleme
src/orders.ts   Sipariş: WhatsApp (asıl kanal) + DB kaydı (ikinci kanal), DH-YYYYAAGG-XXX
src/translate.ts  api/translate istemcisi
src/ozellikler.ts SIPARIS_AKTIF bayrağı
src/hooks/useModalBehavior.ts  pencerelerde ESC + arka plan kilidi
src/context/LanguageContext    TR/EN arayüz metinleri
src/components/ AdminPanel, AdminLogin, AdminOrders, CartDrawer, ProductDetailModal, ...
docs/           glossary.md (üretilir), gorsel-envanteri.md
```

**Veritabanı tabloları:** `products` (status: taslak/yayinda/satildi, deleted_at, sort_order, *_en,
images[]), `categories` (image = vitrin görselinin tek kaynağı), `orders` (siparis_no), `revisions`
(her güncelleme/silmede önceki hal otomatik yazılır), `settings`, `store_data` (ARŞİV, API'ye kapalı).

**Güvenlik (RLS):** ziyaretçi yalnızca yayındakileri okur ve sipariş ekler; yönetici (`is_admin()`)
okur/ekler/günceller; kalıcı silme kimse için tanımlı değil.

---

## 6. Bugüne kadar yapılanlar (kronolojik özet)

Ayrıntılar `PROJECT.md` Bölüm 8'de.

| Tarih | İş |
|---|---|
| 2026-09-16 | **Aşama 0:** koda gömülü şifre ve ipuçları kaldırıldı, veri kaybı korumaları, yıkıcı butonlar kaldırıldı, şablon kalıntıları ve gereksiz bağımlılıklar temizlendi, tsc 0 hata |
| 2026-09-16 | **Aşama 1:** tek-JSON `store_data` → ayrı tablolar; tek transaction ile taşıma; uygulama `src/store.ts`'e bağlandı; demo ürün fallback'i kaldırıldı |
| 2026-09-16 | **Aşama 2:** Supabase Auth ile gerçek yönetici girişi, RLS, çöp kutusu, Taslak/Yayında/Satıldı, Yedek İndir |
| 2026-09-16 | Görsel oranları 3:4 standardına; mobil kaydırma/ESC/arka plan kilidi; gezinme hataları |
| 2026-09-16 | **Aşama 3:** fotoğraflar Storage'a (ziyaretçi indirmesi 5,6 MB → ~10 KB) |
| 2026-09-16 | **Aşama 4:** WhatsApp + DB sipariş akışı, panelde Siparişler sekmesi |
| 2026-09-16 | **Aşama 5:** OpenRouter ile otomatik İngilizce çeviri altyapısı |
| 2026-09-16 | **Aşama 6:** panel ayrı pakete, tembel görsel yükleme, SEO, sitemap, keepalive cron |
| 2026-10-03 | Fotoğraf köşelerindeki buğulanma giderildi (8 statik foto); `docs/gorsel-envanteri.md` |
| 2026-11-16 | Drive'dan 55 yeni foto: 6 ürün yenilendi, 23 yeni ürün (fiyat 0), 2 vitrin değişti; **portfolyo modu**; **YAYIN** (`d73f0e2`); `sql/03_archive_store_data.sql` çalıştırıldı |
| 2026-11-17 | "Wabi-Sabi Ham Kum Vazo" (`ser-1`) çöp kutusuna taşındı (geri getirilebilir), `prod_img_15.jpg` ve paneldeki hazır seçeneği kaldırıldı |
| 2026-11-18 | Seramik kategorisinin vitrin görseliyle ilgili veritabanı işlemi yapıldı (öncesinin yedeği: `backups/seramik-vitrin-oncesi-2026-11-18.json`; kod değişikliği yok) |
| 2026-11-24 | Footer'a "Yönetici Paneli" bağlantısı (`9ce69ff`, **henüz push edilmedi**) |
| 2026-11-25 | Bu devir dosyası oluşturuldu; proje Antigravity'ye taşınıyor |

---

## 7. Açık işler ve bekleyenler

### Kullanıcının yapması gerekenler (`PROJECT.md` Bölüm 11 — hâlâ işaretlenmemiş)
Antigravity'de yeni bir işe başlamadan önce bunların durumunu kullanıcıya sor:
- [ ] Supabase → Authentication → URL Configuration: Site URL `https://didihome.store`,
      Redirect URLs `https://didihome.store/**` ve `http://localhost:3000/**`
- [ ] `didihome.store/admin` → "Hesap oluşturun" → e-postadaki onay bağlantısı
- [ ] Panelde bir ürünü düzenleyip kaydederek yazma yetkisini doğrulama
- [ ] Vercel → Environment Variables → `OPENROUTER_API_KEY` (+ isteğe bağlı `OPENROUTER_MODEL`), sonra Redeploy
- [ ] Panelde "EN çevirisi eksik" ile mevcut ürünleri çevirme
- [ ] Sohbet kayıtlarında geçen **veritabanı şifresini sıfırlama** ve `.env.local`'ı güncelleme
      (Supabase → Project Settings → Database → Reset password; yeni bağlantı adresi `.env.local`'a)

### Geliştirme tarafında bekleyenler
- Devir dosyasının commit'i ve `9ce69ff` ile birlikte push edilmesi (kullanıcı onayıyla).
- 23 yeni ürünün **fiyatı 0**, ölçü/malzeme ve İngilizce metinleri boş. Sipariş açılmadan önce
  fiyatlar girilmeli; sonra `SIPARIS_AKTIF = true` yapılır.
- `public/images/products` altındaki eski statik fotoğraflar artık kullanılmıyor ama duruyor
  (silinmedi, bilerek).

### Gelecekte değerlendirilebilecekler
- Paylaşılan ürün bağlantılarında ürüne özel önizleme görseli (Vercel Middleware ile sunucu tarafı meta).
- Panelden sürüm geçmişine tek tıkla geri dönme ekranı (şimdilik SQL ile: bkz. `PROJECT.md` Bölüm 6).
- Ödeme gerekirse satışın ikas / Shopier / Shopify'a taşınması; bu site vitrin kalır.
- Yeni siparişte e-posta bildirimi.

---

## 8. Bilinen tuzaklar

- `api/` fonksiyonları `npm run dev` ile yerelde çalışmaz; çeviri yalnızca yayında test edilir.
- Tarayıcı önizlemesi arka planda kalınca `requestAnimationFrame` durur ve sayfa boş görünebilir;
  kod hatası değildir.
- Yönetici eklemek için **iki yer** güncellenir: `shared/yoneticiler.ts` ve `sql/02_security.sql`
  (sonra `node scripts/run-sql.mjs sql/02_security.sql`).
- `docs/glossary.md` elle düzenlenmez; `shared/ceviriSozlugu.ts` düzenlenip
  `scripts/generate-glossary-doc.ts` ile üretilir.
- `public/sitemap.xml` her `npm run build`'de yeniden üretilir.
- `teal_peacock_1` için geçmişte yanlış sürüm (`c3c891f`, çerçeveli tablo) vardı; doğrusu ilk commit'teki.
- Repoda `CLAUDE.md` (Claude Code'a özel rehber) de var; içeriği bu dosya ve `PROJECT.md` ile aynı
  kuralları anlatır. Silmeye gerek yok, zararsız.

---

## 9. Antigravity asistanı için başlangıç talimatı (kopyala-yapıştır)

```
Bu proje Claude Code'dan devralındı. Önce ANTIGRAVITY-DEVIR.md, sonra PROJECT.md dosyasını
baştan sona oku. Kurallar:
- Tasarıma (renk, yazı tipi, boşluk, animasyon, düzen) dokunma; görseller dikey 3:4.
- Canlı veriye dokunmadan önce backups/ klasörüne yedek al; toplu üzerine yazma yapma;
  kalıcı silme yapma (deleted_at ile çöp kutusu).
- main'e push = Vercel'de otomatik yayın; push etmeden önce bana sor.
- Her değişiklikten sonra npm run lint ve npm run build temiz olmalı; iş bitince
  PROJECT.md Süreç günlüğünü güncelle ve Türkçe commit at.
- Benimle Türkçe konuş. Yeni işe başlamadan önce PROJECT.md Bölüm 11'deki
  bekleyen maddelerin durumunu bana sor.
```
