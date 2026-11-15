# Didi Home — Claude Code Rehberi

Bu projede çalışmaya başlamadan önce mutlaka [`PROJECT.md`](./PROJECT.md) dosyasını (özellikle **Bölüm 2: Altın Kurallar**, **Bölüm 9: Alınan Kararlar** ve **Bölüm 10: Hızlı Başlangıç**) oku.

## Temel Kurallar
1. **Tek Kaynak:** Tüm mimari, aşama planı ve süreç günlüğü [`PROJECT.md`](./PROJECT.md) içindedir. İş bitiminde bu dosyadaki ilgili bölümleri güncelle.
2. **Görsel Tasarım Sabit:** Sitenin renkleri, yazı tipleri, boşlukları, animasyonları ve sayfa düzeni **değiştirilmez**. Tüm ürün/vitrin görselleri dikey **3:4** (ideal `1200×1600`) oranındadır.
3. **Veri Güvenliği (Altın Kurallar):**
   - Canlı veriye dokunmadan önce `backups/` altına yedek al.
   - Toplu üzerine yazma yapma (yalnızca ilgili satırı güncelle).
   - Bulut verisi yüklenmeden kayıt yapma; sahte/demo ürün fallback'i kullanma.
   - Silme işlemleri `deleted_at` ile geri alınabilir olmalı; API'den kalıcı silme kapalıdır.
   - Başarı mesajı yalnızca kayıt doğrulandıktan sonra gösterilir.
4. **Doğrulama:** Kod değişikliği sonrası mutlaka çalıştır:
   - `npm run lint` (`tsc --noEmit`)
   - `npm run build`
5. **Yerel Ortam Notları:**
   - `npm run dev` → `http://localhost:3000` (`api/` Vercel serverless fonksiyonları yerelde çalışmaz).
   - Veritabanı işlemleri için `.env.local` içinde `SUPABASE_DB_URL` gerekir; test için `node scripts/run-sql.mjs --test`.
