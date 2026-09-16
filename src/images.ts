/**
 * Didi Home · Görsel yükleme (Aşama 3)
 *
 * Eski yöntem: fotoğraflar metne (base64) çevrilip doğrudan veritabanına
 * yazılıyordu. Sonuç: her ziyaretçi 5,6 MB indiriyordu, tarayıcı kotası doluyordu.
 *
 * Yeni yöntem: fotoğraf tarayıcıda küçültülür (en fazla 1200 × 1600, yani 3:4),
 * Supabase Storage'daki "gorseller" klasörüne dosya olarak yüklenir ve
 * veritabanına yalnızca ADRESİ yazılır. Görseller tarayıcı ve CDN tarafından
 * önbelleğe alınır.
 *
 * Yükleme yalnızca yönetici oturumuyla yapılabilir (sql/05_storage.sql).
 */

import { supabase } from './supabase';
import { StoreError } from './store';

export const GORSEL_KLASORU = 'gorseller';

/** Sitenin standart oranı 3:4 (bkz. PROJECT.md → Görsel oranları). */
const EN_FAZLA_GENISLIK = 1200;
const EN_FAZLA_YUKSEKLIK = 1600;
const JPEG_KALITESI = 0.86;

export type GorselTuru = 'urunler' | 'vitrin';

function dosyayiResmeCevir(dosya: File): Promise<HTMLImageElement> {
  return new Promise((coz, reddet) => {
    const adres = URL.createObjectURL(dosya);
    const resim = new Image();
    resim.onload = () => {
      URL.revokeObjectURL(adres);
      coz(resim);
    };
    resim.onerror = () => {
      URL.revokeObjectURL(adres);
      reddet(new StoreError(`"${dosya.name}" okunamadı. Dosya bozuk ya da desteklenmeyen bir biçimde olabilir.`));
    };
    resim.src = adres;
  });
}

/** Görseli oranını bozmadan en fazla 1200 × 1600'e küçültür ve JPEG'e çevirir. */
export async function gorseliKucult(dosya: File): Promise<Blob> {
  const resim = await dosyayiResmeCevir(dosya);
  const oran = Math.min(1, EN_FAZLA_GENISLIK / resim.width, EN_FAZLA_YUKSEKLIK / resim.height);
  const genislik = Math.round(resim.width * oran);
  const yukseklik = Math.round(resim.height * oran);

  const tuval = document.createElement('canvas');
  tuval.width = genislik;
  tuval.height = yukseklik;
  const ctx = tuval.getContext('2d');
  if (!ctx) throw new StoreError('Tarayıcı görseli işleyemedi.');

  // Şeffaf PNG'lerde siyah arka plan oluşmasın
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, genislik, yukseklik);
  ctx.drawImage(resim, 0, 0, genislik, yukseklik);

  return new Promise((coz, reddet) =>
    tuval.toBlob(
      (blob) => (blob ? coz(blob) : reddet(new StoreError('Görsel sıkıştırılamadı.'))),
      'image/jpeg',
      JPEG_KALITESI
    )
  );
}

const benzersizAd = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Görseli küçültüp depoya yükler, herkese açık adresini döndürür.
 * Klasör düzeni: gorseller/urunler/2026-09/uuid.jpg
 */
export async function gorselYukle(dosya: File, tur: GorselTuru): Promise<string> {
  if (!dosya.type.startsWith('image/')) {
    throw new StoreError(`"${dosya.name}" bir görsel dosyası değil.`);
  }

  const kucuk = await gorseliKucult(dosya);
  const ay = new Date().toISOString().slice(0, 7);
  const yol = `${tur}/${ay}/${benzersizAd()}.jpg`;

  const { error } = await supabase.storage.from(GORSEL_KLASORU).upload(yol, kucuk, {
    contentType: 'image/jpeg',
    cacheControl: '31536000', // dosya adı benzersiz olduğu için 1 yıl önbelleklenebilir
    upsert: false
  });

  if (error) {
    const mesaj = error.message.toLowerCase();
    if (mesaj.includes('row-level security') || mesaj.includes('unauthorized')) {
      throw new StoreError('Görsel yüklemek için yönetici olarak giriş yapmış olmanız gerekiyor.', error);
    }
    if (mesaj.includes('exceeded') || mesaj.includes('too large')) {
      throw new StoreError('Görsel çok büyük (en fazla 5 MB).', error);
    }
    throw new StoreError('Görsel yüklenemedi: ' + error.message, error);
  }

  return supabase.storage.from(GORSEL_KLASORU).getPublicUrl(yol).data.publicUrl;
}
