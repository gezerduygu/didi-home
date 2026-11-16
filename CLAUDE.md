# Didi Home — Claude Code Rehberi

Bu proje **Didi Home** (`didihome.store`) için geliştirilen bir vitrin ve sipariş uygulamasıdır.
Çalışmaya başlamadan önce mutlaka [`PROJECT.md`](./PROJECT.md) dosyasını oku; projenin tek kaynağı odur.

---

## 1. Proje Özeti & Marka
- **Ne yapar:** El yapımı seramik, özel tasarım nakışlı kıyafet ve vintage ev objelerinin sergilendiği vitrin + WhatsApp/veritabanı sipariş sitesi.
- **Yönetim:** Teknik bilgisi olmayan bir kullanıcı `/admin` panelinden ürün, kategori ve kapak fotoğraflarını yönetir. Panel sade, affedici ve veri kaybına karşı korumalı olmalıdır.
- **Tasarım Kuralı (Değiştirilemez):** Renkler (bej / kum / terracotta, wabi-sabi estetiği), yazı tipleri, boşluklar, animasyonlar ve sayfa düzeni **korunur**. Tüm ürün ve vitrin görselleri dikey **3:4** (ideal `1200×1600` px) oranındadır.

---

## 2. Teknoloji Yığını
- **Arayüz:** React 19 + TypeScript, Vite 6
- **Stil:** Tailwind CSS 4 (`src/index.css` içinde `@theme` marka renkleri)
- **Animasyon & İkonlar:** Motion (`motion/react`), `lucide-react`
- **Veri / Auth / Depolama:** Supabase (PostgreSQL + Auth + Storage)
- **Sunucu Fonksiyonları & Yayın:** Vercel Serverless (`api/`), GitHub `main` dalından otomatik deploy

---

## 3. Önemli Dosya ve Dizinler
- [`PROJECT.md`](./PROJECT.md) — Mimari, kararlar, süreç günlüğü ve aşama planı (iş bitince güncellenmeli).
- `src/store.ts` — Tüm veri okuma/yazma katmanı.
- `src/auth.ts` — Supabase Auth işlemleri.
- `src/images.ts` — Görsel küçültme (`1200×1600`) ve Supabase Storage'a yükleme.
- `src/orders.ts` — Sipariş akışı (WhatsApp mesajı + veritabanı kaydı).
- `src/translate.ts` — Otomatik İngilizce çeviri istemcisi (`api/translate.ts` üzerinden OpenRouter kullanır).
- `src/components/AdminPanel.tsx`, `AdminLogin.tsx`, `AdminOrders.tsx` — Yönetim paneli bileşenleri.
- `shared/yoneticiler.ts` — Yönetici e-posta listesi (tek kaynak).
- `shared/ceviriSozlugu.ts` — Marka terimleri ve çeviri üslubu (tek kaynak; `docs/glossary.md` buradan üretilir).
- `api/keepalive.ts` — Supabase'in uykuya dalmasını önleyen cron endpoint'i (`vercel.json`).
- `api/translate.ts` — Yönetici oturumu gerektiren sunucu tarafı OpenRouter çeviri endpoint'i.
- `scripts/run-sql.mjs` — `sql/` klasöründeki SQL dosyalarını çalıştırma aracı.
- `docs/gorsel-envanteri.md` — Görsellerin temizlik/filigran durumu envanteri.

---

## 4. Altın Kurallar (Veri Kaybını Önleme)
1. **Canlı veriye dokunmadan önce yedek al:** Yedekler `backups/` klasörüne yazılır (`.gitignore` içinde, repoya girmez).
2. **Toplu üzerine yazma yok:** Bir ürün güncellenirken yalnızca o ürünün satırı yazılır; tüm kataloğu tek seferde gönderen kod yazılmaz.
3. **Veri gelmeden kayıt yapılmaz:** Bulut verisi yüklenmeden kayıt işlemi engellenir.
4. **Demo/sahte ürün fallback'i yok:** Veri gelmezse boş ekran ve hata mesajı gösterilir.
5. **Geri alınabilir silme:** Silinen kayıtlar `deleted_at` ile işaretlenip süresiz çöp kutusunda bekler. API üzerinden kalıcı silme veritabanı kurallarıyla kapalıdır.
6. **Toplu yıkıcı buton yok:** "Hepsini sıfırla" gibi butonlar eklenmez.
7. **Doğrulama sonrası başarı mesajı:** Kayıt gerçekten doğrulandıktan sonra başarı mesajı gösterilir.
8. **Görsellere bulanıklaştırma yok:** Filigran silmek için köşe bulanıklaştırma yapılmaz (`PROJECT.md` 2026-10-03 kararı).

---

## 5. Geliştirme Komutları & Doğrulama
```bash
npm install
npm run dev      # http://localhost:3000 (api/ Vercel fonksiyonları yerelde çalışmaz)
npm run lint     # tsc --noEmit (her değişiklik sonrası temiz olmalı)
npm run build    # prebuild ile sitemap.xml üretir, ardından vite build çalıştırır
```

Veritabanı işlemleri için `.env.local` içinde `SUPABASE_DB_URL` gerekir:
```bash
node scripts/run-sql.mjs --test
node scripts/run-sql.mjs sql/DOSYA.sql
```

---

## 6. Mevcut Durum (Son Commitler Özeti)
- Aşama 0–6 arası temel altyapı tamamlandı: veri modeli geçişi, Supabase Auth yönetici girişi, çöp kutusu, fotoğrafların Supabase Storage'a taşınması, WhatsApp + DB sipariş akışı, Admin Siparişler sekmesi, OpenRouter otomatik EN çeviri, SEO/sitemap ve `keepalive` cron.
- Son çalışmalarda statik ürün görsellerindeki köşe buğulanması giderildi, görsel oranları 3:4 standardına hizalandı ve [`docs/gorsel-envanteri.md`](./docs/gorsel-envanteri.md) oluşturuldu.
- **2026-11-16:** Drive'dan gelen 55 yeni fotoğraf yerleştirildi (6 ürün yenilendi, 23 yeni ürün, 2 vitrin). Site **portfolyo modunda**: `src/ozellikler.ts` → `SIPARIS_AKTIF = false` iken sepet, sipariş ve fiyatlar gizlidir; yeni ürünlerin fiyatı 0'dır.
- **Dikkat:** `PROJECT.md` Bölüm 11'de yayın sonrası ve kullanıcı tarafından tamamlanması gereken kontrol listesi maddeleri yer almaktadır; yeni bir işe başlamadan önce bunların durumunu kullanıcıyla teyit et.
