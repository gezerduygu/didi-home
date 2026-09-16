/**
 * Yönetici e-posta listesi — TEK KAYNAK.
 *
 * Hem tarayıcı (src/auth.ts) hem sunucu fonksiyonları (api/) buradan okur.
 * Yeni yönetici eklerken bu listeye ek olarak sql/02_security.sql içindeki
 * is_admin() fonksiyonu da güncellenip yeniden çalıştırılmalıdır
 * (asıl veri koruması veritabanındadır).
 */
export const YONETICI_EPOSTALARI: readonly string[] = ['gezerduygu@gmail.com'];

export const yoneticiEpostasiMi = (eposta: string | null | undefined): boolean =>
  Boolean(eposta && YONETICI_EPOSTALARI.includes(eposta.trim().toLowerCase()));
