/**
 * Didi Home · Sipariş akışı (Aşama 4)
 *
 * Tasarım kararı: WhatsApp ASIL kanaldır, veritabanı kaydı ikinci kanaldır.
 * Böylece veritabanına ulaşılamasa bile sipariş kaybolmaz — müşteri mesajı
 * elinde kalır. Kayıt başarısız olursa akış sessizce devam eder, hata konsola
 * ve (varsa) sonraki denemeye bırakılır.
 */

import { supabase } from './supabase';
import { CartItem } from './types';

const WHATSAPP_NUMARASI = (import.meta.env.VITE_WHATSAPP_NUMBER || '905056327323').replace(/\D/g, '');

export interface TeslimatBilgisi {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  note?: string;
}

export interface SiparisOzeti {
  siparisNo: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  bilgi: TeslimatBilgisi;
}

/** DH-20260916-A7F biçiminde, insanın telefonda okuyabileceği kısa numara. */
export function siparisNoUret(): string {
  const d = new Date();
  const tarih = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const harfler = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let son = '';
  for (let i = 0; i < 3; i++) son += harfler[Math.floor(Math.random() * harfler.length)];
  return `DH-${tarih}-${son}`;
}

const tl = (n: number) => n.toLocaleString('tr-TR');

/** WhatsApp'a gidecek hazır mesaj metni. */
export function siparisMesajiOlustur(siparis: SiparisOzeti, dil: 'tr' | 'en'): string {
  const { items, subtotal, shipping, total, bilgi, siparisNo } = siparis;

  const satirlar = items.map(
    (i) => `• ${i.product.title} × ${i.quantity} — ${tl(i.product.price * i.quantity)} TL`
  );

  if (dil === 'en') {
    return [
      `Hello, I would like to place an order from Didi Home.`,
      ``,
      `ORDER ${siparisNo}`,
      ...satirlar,
      ``,
      `Subtotal: ${tl(subtotal)} TL`,
      `Shipping: ${shipping === 0 ? 'Free' : tl(shipping) + ' TL'}`,
      `Total: ${tl(total)} TL`,
      ``,
      `MY DETAILS`,
      `Name: ${bilgi.name}`,
      `Phone: ${bilgi.phone}`,
      `Email: ${bilgi.email}`,
      `City: ${bilgi.city}`,
      `Address: ${bilgi.address}`,
      ...(bilgi.note ? [`Note: ${bilgi.note}`] : [])
    ].join('\n');
  }

  return [
    `Merhaba, Didi Home'dan sipariş vermek istiyorum.`,
    ``,
    `SİPARİŞ ${siparisNo}`,
    ...satirlar,
    ``,
    `Ara toplam: ${tl(subtotal)} TL`,
    `Kargo: ${shipping === 0 ? 'Ücretsiz' : tl(shipping) + ' TL'}`,
    `Toplam: ${tl(total)} TL`,
    ``,
    `BİLGİLERİM`,
    `Ad Soyad: ${bilgi.name}`,
    `Telefon: ${bilgi.phone}`,
    `E-posta: ${bilgi.email}`,
    `Şehir: ${bilgi.city}`,
    `Adres: ${bilgi.address}`,
    ...(bilgi.note ? [`Not: ${bilgi.note}`] : [])
  ].join('\n');
}

/** Tıklama anında açılacak WhatsApp adresi. */
export function whatsappAdresi(mesaj: string): string {
  return `https://wa.me/${WHATSAPP_NUMARASI}?text=${encodeURIComponent(mesaj)}`;
}

/**
 * Siparişi veritabanına yazar. Tablo henüz yoksa ya da bağlantı kurulamazsa
 * sessizce false döner — sipariş akışı buna bakmaksızın devam eder.
 */
export async function siparisiKaydet(siparis: SiparisOzeti): Promise<boolean> {
  try {
    const { error } = await supabase.from('orders').insert({
      customer_name: siparis.bilgi.name,
      email: siparis.bilgi.email || null,
      phone: siparis.bilgi.phone || null,
      city: siparis.bilgi.city || null,
      address: siparis.bilgi.address || null,
      note: [siparis.siparisNo, siparis.bilgi.note].filter(Boolean).join(' · '),
      items: siparis.items.map((i) => ({
        id: i.product.id,
        title: i.product.title,
        price: i.product.price,
        quantity: i.quantity
      })),
      subtotal: siparis.subtotal,
      shipping: siparis.shipping,
      total: siparis.total
    });

    if (error) {
      console.warn('[Sipariş] Veritabanına yazılamadı (WhatsApp mesajı yine de gönderildi):', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('[Sipariş] Kayıt sırasında beklenmeyen hata:', e);
    return false;
  }
}

/** Kayıt yapılamazsa sipariş en azından tarayıcıda dursun (son çare). */
export function siparisiYerelYedekle(siparis: SiparisOzeti): void {
  try {
    const anahtar = 'didi_home_bekleyen_siparisler';
    const mevcut = JSON.parse(localStorage.getItem(anahtar) || '[]');
    mevcut.push({ ...siparis, kaydedilmeTarihi: new Date().toISOString() });
    localStorage.setItem(anahtar, JSON.stringify(mevcut.slice(-20)));
  } catch {
    /* kota dolu olabilir, önemli değil */
  }
}
