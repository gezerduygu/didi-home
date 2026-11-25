# Didi Home — Antigravity'ye Devir Dosyası

> **Antigravity'deki yapay zekâ asistanına:** Bu projede çalışmaya başlamadan önce bu dosyanın
> tamamını, ardından [`PROJECT.md`](./PROJECT.md) dosyasını oku. Bu dosya, Claude Code ile
> yapılan tüm çalışmanın özeti ve devir notudur. `PROJECT.md` projenin ayrıntılı tek kaynağıdır;
> bu dosya ise taşınma anındaki durumu, açık işleri ve çalışma kurallarını tek yerde toplar.

Devir tarihi: **2026-11-25**

> **En önemli değişiklik (2026-11-25):** Tarayıcıdaki **yönetim paneli (`/admin`) kaldırıldı.**
> Site artık doğrudan yapay zekâ asistanıyla (Antigravity) yönetiliyor: ürün, fotoğraf, kategori
> ve metin değişiklikleri yerelden, veritabanına doğrudan bağlantıyla yapılır. Yöntem: **Bölüm 5**.

---

## 0. Taşınma kontrol listesi

Proje klasörü zaten `D:\CODING TOOLS\ANTIGRAVITY\didi-home` konumunda. **En kolay ve en güvenli yol,
Antigravity'de bu klasörü olduğu gibi açmaktır** (File → Open Folder). Böylece git'e girmeyen
gizli dosyalar ve yedekler de yerinde kalır.

| # | Adım | Durum |
|---|---|---|
| 1 | Antigravity'de `D:\CODING TOOLS\ANTIGRAVITY\didi-home` klasörünü aç | ☐ |
| 2 | Tüm commitler GitHub'a gönderildi ve canlıda (bkz. Bölüm 2) | ✅ |
| 3 | `npm install` (node_modules zaten var; yeni bir klasöre klonladıysan gerekli) | ☐ |
| 4 | `npm run lint` → 0 hata, `npm run dev` → http://localhost:3000 açılıyor mu | ☐ |
| 5 | `node scripts/run-sql.mjs --test` → veritabanı bağlantısı çalışıyor mu (`.env.local` gerekir) | ☐ |
| 6 | Antigravity asistanına ilk mesaj olarak Bölüm 10'daki talimatı yapıştır | ☐ |

### Git'e GİRMEYEN, elle korunması gereken dosyalar

Projeyi **başka bir klasöre / bilgisayara** taşıyacaksan (ör. `git clone` ile), aşağıdakiler
GitHub'da yoktur; elle kopyalanmazsa kaybolur:

| Dosya / klasör | İçerik | Neden önemli |
|---|---|---|
| `.env` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Site yerelde veriye bağlanamaz |
| `.env.local` | `SUPABASE_DB_URL` (veritabanı şifresi içerir — **GİZLİ**) | **Siteyi yönetmenin tek yolu bu bağlantı.** Yoksa ürün/fotoğraf değiştirilemez |
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
| Yönetim | **Tarayıcıda panel yok** (2026-11-25'te kaldırıldı). Site asistanla yerelden yönetilir. Eski `/admin` adresi ana sayfaya düşer |
| Ne yapar | El yapımı seramik, nakışlı kıyafet (kaftan, kimono, sabahlık) ve vintage ev objeleri vitrini |
| Şu anki mod | **Portfolyo modu** — sepet, sipariş ve fiyatlar gizli (`src/ozellikler.ts` → `SIPARIS_AKTIF = false`) |
| Site sahibi | Teknik bilgisi yok; ne istediğini asistana söyler. Değişiklikler güvenli, yedekli ve geri alınabilir yapılmalı |
| Dil | Arayüz ve tüm dokümanlar **Türkçe**; site sahibiyle Türkçe konuşulur |

---

## 2. Git ve yayın bilgileri

| | |
|---|---|
| Uzak depo | `https://github.com/gezerduygu/didi-home.git` (`origin`) |
| Ana dal | `main` (tek dal; başka dal yok) |
| Yayın | `main`'e push → **Vercel otomatik deploy** (ayrı bir yayın komutu yok) |
| Commit yazarı | `Didi Home <admin@didihome.com>` (yerel `git config`) |
| Commit mesaj dili | Türkçe, ASCII (ör. "Gorsel envanteri: ...") |

**Taşınma anındaki durum (2026-11-25):** yerel `main` = `origin/main`, hepsi push edildi ve canlıda.
Çalışma alanı temiz. En son commit: "Yonetim paneli kaldirildi ..." (`git log -1` ile gör).

> ⚠️ Push etmek = siteyi yayına almak. Kod değişikliğini push etmeden önce site sahibine sor.
> Veritabanı değişiklikleri (ürün, fotoğraf, metin) ise push gerektirmez; anında canlıdadır.

Son commitler:
```
(son)   Yonetim paneli kaldirildi; site asistanla yerelden yonetilecek     (2026-11-25)
1edafeb Antigravity'ye devir dosyasi eklendi, PROJECT.md guncellendi       (2026-11-25)  ← panelin bulunduğu SON sürüm
9ce69ff Ana sayfa alt bilgisine Yonetici Paneli baglantisi eklendi         (2026-11-24)
8307d63 Generik Wabi-Sabi vazo sistemden kaldirildi                       (2026-11-17)
95e023b PROJECT.md: yayin ve arsivleme kontrol listesi tamamlandi          (2026-11-17)
d73f0e2 Yeni fotograflar yerlestirildi, site portfolyo moduna alindi      (2026-11-16, YAYIN)
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

**Paneli geri istemek olursa:** silinen dosyalar git geçmişinde duruyor.
`git checkout 1edafeb -- src/components/AdminPanel.tsx ...` ile geri getirilebilir
(silinen dosyaların tam listesi Bölüm 6'da). Veritabanı tarafı (RLS, `is_admin()`) hiç değişmedi.

---

## 3. Teknoloji yığını ve ortam

| Katman | Teknoloji |
|---|---|
| Arayüz | React 19 + TypeScript 5.8, Vite 6 |
| Stil | Tailwind CSS 4 (`src/index.css` içinde `@theme` marka renkleri) |
| Animasyon / ikon | Motion (`motion/react`), `lucide-react` |
| Veri / Dosya | Supabase (PostgreSQL + Storage, `gorseller` deposu). Site yalnızca **okur** |
| Sunucu fonksiyonları | Vercel Serverless (`api/keepalive.ts`) |
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

### Ortam değişkenleri

| Değişken | Nerede | Gizli mi? |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` / Vercel | Hayır |
| `VITE_SUPABASE_ANON_KEY` | `.env` / Vercel | Hayır (RLS korur) |
| `VITE_WHATSAPP_NUMBER` | Vercel (yoksa koddaki varsayılan) | Hayır |
| `VITE_SITE_URL` | Vercel | Hayır |
| `SUPABASE_DB_URL` | **Yalnızca** `.env.local` — Vercel'e eklenmez | **Evet** |
| ~~`OPENROUTER_API_KEY`~~, ~~`OPENROUTER_MODEL`~~ | Artık kullanılmıyor (`api/translate` silindi). Vercel'de tanımlıysa silinebilir | — |

---

## 4. Değiştirilemez kurallar

### Tasarım
- Renkler (bej / kum / terracotta, wabi-sabi), yazı tipleri, boşluklar, animasyonlar ve sayfa
  düzeni **korunur**.
- Tüm ürün ve vitrin görselleri dikey **3:4**, ideal **1200 × 1600 px**.

### Altın kurallar (veri kaybını önleme)
1. **Canlı veriye dokunmadan önce yedek al** → `backups/` (git'e girmez).
2. **Toplu üzerine yazma yok.** Bir ürün güncellenirken yalnızca o ürünün satırı yazılır.
3. **Veri gelmeden kayıt yapılmaz** / betikler önce okur, sonra yazar.
4. **Demo/sahte ürün fallback'i yok.** Veri gelmezse boş ekran + hata mesajı.
5. **Geri alınabilir silme.** `deleted_at` ile çöp kutusu, süresiz. Kalıcı `delete` yapılmaz;
   Storage'dan dosya silinmez.
6. **Toplu yıkıcı işlem yok** ("hepsini sıfırla" vb.).
7. **Başarı ancak doğrulandıktan sonra bildirilir** (yazdıktan sonra `select` ile kontrol et).
8. **Görsellere bulanıklaştırma yok** (filigran silmek için köşe bulanıklaştırma yapılmaz).
9. **Canlı sitenin hangi kod sürümünde olduğunu kontrol etmeden** onun kullandığı tabloya/kurala
   dokunma (2026-09-16'da 1-2 dakikalık kesinti yaşandı).

### Çalışma alışkanlıkları
- Kod değişikliğinde: `npm run lint` + `npm run build` temiz → `PROJECT.md` Süreç günlüğü güncellenir →
  açıklayıcı Türkçe commit → push için site sahibine sor.
- Yeni SQL: bir sonraki numarayla (`sql/07_...sql`), tekrar çalıştırılabilir yazılır
  (`if not exists`, `drop policy if exists`), çalıştırılır, `PROJECT.md` Bölüm 6 tablosuna eklenir.

---

## 5. Siteyi yönetmek (panel yerine asistan)

Ayrıntılı sürüm: `PROJECT.md` Bölüm 12. Özet:

**Her değişiklikte sıra:**
1. **Yedek:** etkilenecek satırları `backups/<is-adi>-oncesi-YYYY-AA-GG.json` dosyasına yaz.
2. **Betik:** `scripts/` altına bir Node betiği; `.env.local` → `SUPABASE_DB_URL` ile `pg` bağlantısı.
   Önce **deneme modu** (hiçbir şey yazmaz), sonra `--apply`.
3. **Tek transaction:** `begin` → yalnızca ilgili satırlar → `select` ile doğrula → `commit` / `rollback`.
4. **Kalıcı silme yok:** kaldır = `deleted_at = now()`, gizle = `status = 'taslak'`,
   satıldı = `status = 'satildi'`, geri getir = `deleted_at = null`.
5. Önceki hal `revisions` tablosuna tetikleyiciyle otomatik yazılır.
6. Veritabanı değişikliği **anında canlıdır**, push gerekmez.

**Fotoğraf eklerken:**
- Dikey 3:4, en fazla 1200×1600, JPEG ~86, efekt yok; sağ alt köşede filigran/leke kontrolü.
- Depo `gorseller`, klasör `urunler/YYYY-AA/` veya `vitrin/YYYY-AA/`.
- Servis anahtarı **kullanılmaz**. Doğrudan DB bağlantısıyla yalnızca o ayın klasörüne EKLEME izni
  veren **geçici** `storage.objects` kuralı aç → anon anahtarla yükle → kuralı **hemen kaldır**
  (hata olsa bile, `finally`) → her dosyayı herkese açık adresinden indirip birebir doğrula.
- **Hazır örnek betik:** `scripts/yeni-gorseller-2026-11.mjs` (yedek + yükleme + doğrulama +
  tek transaction'da ürün ekleme/güncelleme). Yeni işler için bunu kopyalayıp uyarlamak en güvenlisi.

**Tablolar:** `products` (id, title, category_id, subcategory, price, image, images[], story,
condition, material, dimensions, is_second_hand, `*_en` sütunları, status: taslak/yayinda/satildi,
sort_order, deleted_at), `categories` (image = vitrin görselinin **tek kaynağı**, subcategories[]),
`orders` (siparis_no), `revisions`, `settings`, `store_data` (ARŞİV).

**İngilizce metinler:** otomatik çeviri kaldırıldı. `*_en` sütunlarını asistan yazar; terimler ve üslup
için `shared/ceviriSozlugu.ts`. EN metni boş olan üründe İngilizce ziyaretçi Türkçesini görür.

---

## 6. Mimari özet (panel kaldırıldıktan sonra)

```
api/            keepalive.ts (cron)
shared/         ceviriSozlugu.ts (47 marka terimi; docs/glossary.md buradan üretilir)
sql/            01_schema … 06_orders_no (hepsi çalıştırıldı)
scripts/        run-sql.mjs, generate-sitemap.mjs, generate-glossary-doc.ts,
                yeni-gorseller-2026-11.mjs [örnek betik], migrate-*.mjs [tamamlandı],
                kose-bulaniklik-olc.py
src/store.ts    Veri OKUMA (yayındaki ürünler + kategoriler)
src/orders.ts   Sipariş: WhatsApp (asıl kanal) + DB kaydı (ikinci kanal), DH-YYYYAAGG-XXX
src/ozellikler.ts SIPARIS_AKTIF bayrağı
src/hooks/useModalBehavior.ts  pencerelerde ESC + arka plan kilidi
src/context/LanguageContext    TR/EN arayüz metinleri
src/components/ AboutModal, CartDrawer, CategoryCard, Header, ProductDetailModal, ProductGrid
docs/           glossary.md (üretilir), gorsel-envanteri.md
```

**2026-11-25'te silinenler:** `src/components/AdminPanel.tsx`, `AdminLogin.tsx`, `AdminOrders.tsx`,
`src/auth.ts`, `src/images.ts`, `src/translate.ts`, `api/translate.ts`, `shared/yoneticiler.ts`;
`src/store.ts` içindeki yazma fonksiyonları; `App.tsx` içindeki `/admin` rotası, Supabase oturum
dinleyicisi, yazma işleyicileri ve footer'daki "Yönetici Paneli" bağlantısı; `LanguageContext`
içindeki `admin.*` metinleri; `robots.txt` içindeki `Disallow: /admin`; `.env.example` içindeki
OpenRouter satırları.

**Veritabanına dokunulmadı:** RLS kuralları ve `is_admin()` (yönetici e-postası `sql/02_security.sql`
içinde) duruyor ama kullanan arayüz yok. Ziyaretçi yalnızca yayındakileri okur ve sipariş ekler;
kalıcı silme kimse için tanımlı değil. Asistanın `SUPABASE_DB_URL` bağlantısı RLS'i aşar —
bu yüzden altın kurallar ona da uygulanır.

---

## 7. Bugüne kadar yapılanlar (kronolojik özet)

Ayrıntılar `PROJECT.md` Bölüm 8'de.

| Tarih | İş |
|---|---|
| 2026-09-16 | **Aşama 0:** koda gömülü şifre ve ipuçları kaldırıldı, veri kaybı korumaları, yıkıcı butonlar kaldırıldı, şablon kalıntıları ve gereksiz bağımlılıklar temizlendi, tsc 0 hata |
| 2026-09-16 | **Aşama 1:** tek-JSON `store_data` → ayrı tablolar; tek transaction ile taşıma; demo ürün fallback'i kaldırıldı |
| 2026-09-16 | **Aşama 2:** Supabase Auth ile yönetici girişi, RLS, çöp kutusu, Taslak/Yayında/Satıldı *(panel 2026-11-25'te kaldırıldı; RLS duruyor)* |
| 2026-09-16 | Görsel oranları 3:4 standardına; mobil kaydırma/ESC/arka plan kilidi; gezinme hataları |
| 2026-09-16 | **Aşama 3:** fotoğraflar Storage'a (ziyaretçi indirmesi 5,6 MB → ~10 KB) |
| 2026-09-16 | **Aşama 4:** WhatsApp + DB sipariş akışı *(paneldeki Siparişler sekmesi 2026-11-25'te kaldırıldı)* |
| 2026-09-16 | **Aşama 5:** OpenRouter otomatik çeviri *(2026-11-25'te kaldırıldı)* |
| 2026-09-16 | **Aşama 6:** tembel görsel yükleme, SEO, sitemap, keepalive cron |
| 2026-10-03 | Fotoğraf köşelerindeki buğulanma giderildi (8 statik foto); `docs/gorsel-envanteri.md` |
| 2026-11-16 | Drive'dan 55 yeni foto: 6 ürün yenilendi, 23 yeni ürün (fiyat 0), 2 vitrin değişti; **portfolyo modu**; **YAYIN** (`d73f0e2`); `sql/03_archive_store_data.sql` çalıştırıldı |
| 2026-11-17 | "Wabi-Sabi Ham Kum Vazo" (`ser-1`) çöp kutusuna taşındı (geri getirilebilir), `prod_img_15.jpg` kaldırıldı |
| 2026-11-18 | Seramik kategorisinin vitrin görseliyle ilgili veritabanı işlemi (öncesinin yedeği: `backups/seramik-vitrin-oncesi-2026-11-18.json`; kod değişikliği yok) |
| 2026-11-24 | Footer'a "Yönetici Paneli" bağlantısı (`9ce69ff`) |
| 2026-11-25 | Devir dosyası oluşturuldu; ardından **yönetim paneli tamamen kaldırıldı** (site sahibinin kararı). Hepsi push edildi, canlıda doğrulandı |

---

## 8. Açık işler

### Site sahibinin yapması gereken
- [ ] Sohbet kayıtlarında geçen **veritabanı şifresini sıfırlama** ve `.env.local`'ı güncelleme
      (Supabase → Project Settings → Database → Reset database password; yeni Session pooler
      adresi `.env.local` → `SUPABASE_DB_URL`). Şifre değişince `node scripts/run-sql.mjs --test` ile dene.
- [ ] (İsteğe bağlı) Vercel → Environment Variables'ta `OPENROUTER_*` varsa silmek.
- ~~Supabase Auth URL ayarları, yönetici hesabı, panelde yazma denemesi, OpenRouter anahtarı~~ →
  panel kaldırıldığı için **artık gereksiz**.

### Geliştirme / içerik tarafında bekleyenler
- 23 yeni ürünün **fiyatı 0**, ölçü/malzeme ve İngilizce metinleri boş. Sipariş açılmadan önce
  fiyatlar girilmeli; sonra `SIPARIS_AKTIF = true` yapılır.
- Mevcut ürünlerin İngilizce metinleri (`*_en`) büyük ölçüde boş; asistan yazabilir.
- (İsteğe bağlı güvenlik sıkılaştırması) Panel olmadığı için Supabase Auth'ta yeni kayıtları
  kapatmak (Supabase → Authentication ayarlarında "Allow new users to sign up" seçeneği) zararsız
  ve önerilir. Yönetici yazma RLS kuralları duruyor; kaldırılmak istenirse yeni bir `sql/07_...` ile
  yapılır — acelesi yok.
- `public/images/products` altındaki eski statik fotoğraflar kullanılmıyor ama duruyor (bilerek).

### Gelecekte değerlendirilebilecekler
- Paylaşılan ürün bağlantılarında ürüne özel önizleme görseli (Vercel Middleware ile sunucu tarafı meta).
- Ödeme gerekirse satışın ikas / Shopier / Shopify'a taşınması; bu site vitrin kalır.
- Sipariş açılırsa yeni siparişte e-posta bildirimi (şimdilik WhatsApp mesajı bildirim görevi görür;
  siparişler `select * from orders` ile okunur).

---

## 9. Bilinen tuzaklar

- `api/` fonksiyonları `npm run dev` ile yerelde çalışmaz.
- Tarayıcı önizlemesi arka planda kalınca `requestAnimationFrame` durur ve sayfa boş görünebilir;
  kod hatası değildir.
- `docs/glossary.md` elle düzenlenmez; `shared/ceviriSozlugu.ts` düzenlenip
  `scripts/generate-glossary-doc.ts` ile üretilir.
- `public/sitemap.xml` her `npm run build`'de yeniden üretilir (yeni ürün DB'ye eklenince sitemap
  bir sonraki yayında güncellenir).
- Ürün kartı `image` alanını, ürün penceresi `images[]` galerisini kullanır; `image` boşsa
  `images[0]` gösterilir. Kapak fotoğrafını değiştirirken ikisini birlikte güncelle.
- `teal_peacock_1` için geçmişte yanlış sürüm (`c3c891f`, çerçeveli tablo) vardı; doğrusu ilk commit'teki.
- Git `core.autocrlf=true`; dosyalar depoda LF, çalışma alanında CRLF. Uyarılar zararsız.
- Repoda `CLAUDE.md` (Claude Code'a özel rehber) de var; güncel ve aynı kuralları anlatır. Zararsız.

---

## 10. Antigravity asistanı için başlangıç talimatı (kopyala-yapıştır)

```
Bu proje Claude Code'dan devralındı. Önce ANTIGRAVITY-DEVIR.md, sonra PROJECT.md dosyasını
baştan sona oku. Kurallar:
- Tarayıcıda yönetim paneli YOK. Siteyi sen yöneteceksin: ürün, fotoğraf, kategori ve metin
  değişikliklerini .env.local içindeki SUPABASE_DB_URL ile, PROJECT.md Bölüm 12'deki yöntemle yap
  (önce backups/ klasörüne yedek, deneme modu, tek transaction, doğrulama).
- Tasarıma (renk, yazı tipi, boşluk, animasyon, düzen) dokunma; görseller dikey 3:4, 1200×1600.
- Kalıcı silme yapma (deleted_at ile çöp kutusu); toplu üzerine yazma yapma.
- main'e push = Vercel'de otomatik yayın; push etmeden önce bana sor.
- Kod değişikliğinden sonra npm run lint ve npm run build temiz olmalı; iş bitince
  PROJECT.md Süreç günlüğünü güncelle ve Türkçe commit at.
- Benimle Türkçe konuş; teknik bilgim yok, sade anlat.
```
