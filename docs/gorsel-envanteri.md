# Didi Home · Görsel Envanteri ve Durumu

Son inceleme: 2026-11-16

2026-11-16'da sitedeki fotoğrafların neredeyse tamamı yenilendi
(bkz. PROJECT.md → 2026-11-16 kaydı). Önceki envanterde "lekeli" ve "yıldız var"
olarak işaretlenen fotoğrafların **hiçbiri artık sitede kullanılmıyor**.

Yeni fotoğrafların kaynağı: paylaşılan Drive klasörü "Didi Home".
Hepsi Supabase Storage'da (`gorseller/urunler/2026-11/`, `gorseller/vitrin/2026-11/`),
en fazla 1200×1600. Sağ alt köşeleri tek tek kontrol edildi: **leke ve filigran yok.**

## Ana sayfa (vitrin kartları)

| Konum | Kaynak | Durum |
|---|---|---|
| Haute Couture vitrini | Storage (yeni) — Ana Sayfa Foto | ✅ Temiz, 1200×1600 |
| Ev vitrini | Storage (yeni) — Ana Sayfa Foto | ✅ Temiz, 1200×1600 |
| Seramik vitrini | `/images/ceramic-cover.jpg` (statik, eski) | ⭐ Soluk yıldız işareti duruyor, 800×1200 |

## Ürünler

| Ürün | Fotoğraf | Kaynak klasör | Not |
|---|---|---|---|
| Sarı İşlemeli Kaftan | 4 | Sarı Sabahlık / Yeni | ✅ |
| Zümrüt Yeşili Nakışlı Kaftan | 4 | Yeşil Sabahlık | ✅ Galeri 2: 896×1200; galeri 4 dikey 9:16 (3:4 değil) |
| Siyah Tavuskuşlu Nakışlı Kaftan | 2 | Tavuskuşlu Siyah Kaftan | ✅ |
| Petrol Yeşili Tavuskuşu El Nakışlı Sabahlık | 2 | Tavuskuşlu Petrol Yeşili Kaftan | ✅ |
| Mor Çiçek İşlemeli Kimono | 3 | Mor Sabahlık | ✅ |
| Hardal Sarısı İşlemeli Kaban (yeni) | 3 | Sarı Kaban | ✅ Galeri 2: 896×1200 |
| Siyah Kare İşlemeli Kaftan (yeni) | 3 | Siyah Kare İslemeli | ✅ Galeri 2: 896×1200 |
| Şal Desenli Kaftan (yeni) | 4 | Şal Desenli Kaftan | ✅ |
| Ev Renovasyon | 6 | Ev / Ev Site | ✅ Kapak kare (1:1), 3 fotoğraf yatay (4:3) — galeride tam görünür |
| El Dokuması Çizgili Kilim (yeni) | 1 | Kilim | ✅ |
| 19 yeni seramik ürünü | 21 | Seramik | ✅ Biri 896×1195, diğerleri 1200×1600 |
| Wabi-Sabi Ham Kum Vazo | 1 | `/images/products/prod_img_15.jpg` (statik, eski) | ⭐ Soluk yıldız işareti duruyor, 800×1200 |

## Özet

| Durum | Adet |
|---|---|
| ✅ Temiz (yeni) | 55 |
| ⭐ Yıldız var, leke yok (eski, statik) | 2 |
| 🔴 Lekeli | 0 |

## Yapılacaklar

1. **Seramik vitrini** ve **Wabi-Sabi Ham Kum Vazo** için yeni fotoğraf gelirse değiştirilebilir.
2. `public/images/products` altındaki eski statik fotoğraflar artık kullanılmıyor
   (Wabi-Sabi vazo hariç); istenirse depodan kaldırılabilir.

## Yeniden ölçmek için

```bash
python scripts/kose-bulaniklik-olc.py yol/ile/dosya.jpg
```
