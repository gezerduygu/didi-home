/**
 * Didi Home · Yönetici girişi (Aşama 2)
 *
 * Eski yöntem: şifre koda gömülüydü ("didi") ve kontrol tarayıcıda yapılıyordu;
 * sessionStorage'a tek satır yazarak giriş atlatılabiliyordu.
 *
 * Yeni yöntem: Supabase Auth (e-posta + şifre). Asıl koruma veritabanındaki
 * RLS kurallarıdır (sql/02_security.sql → is_admin()). Buradaki e-posta listesi
 * yalnızca arayüzün doğru ekranı göstermesi içindir; biri bu listeyi tarayıcıda
 * değiştirse bile veritabanı yazma iznini vermez.
 *
 * Yeni yönetici eklemek için İKİ yere e-posta eklenir:
 *   1. Aşağıdaki YONETICI_EPOSTALARI listesi
 *   2. sql/02_security.sql içindeki is_admin() fonksiyonu (sonra tekrar çalıştırılır)
 */

import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const YONETICI_EPOSTALARI = ['gezerduygu@gmail.com'];

export const yoneticiMi = (session: Session | null): boolean =>
  Boolean(session?.user?.email && YONETICI_EPOSTALARI.includes(session.user.email.toLowerCase()));

const panelAdresi = () => `${window.location.origin}/admin`;

/** Supabase'in İngilizce hata mesajlarını anlaşılır Türkçeye çevirir. */
export function girisHatasiniCevir(mesaj: string, dil: 'tr' | 'en'): string {
  if (dil === 'en') return mesaj;
  const m = mesaj.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
  if (m.includes('email not confirmed')) return 'E-posta adresiniz henüz onaylanmamış. Gelen kutunuzdaki onay bağlantısına tıklayın.';
  if (m.includes('user already registered')) return 'Bu e-posta ile hesap zaten var. Giriş yapın ya da "Şifremi unuttum" seçeneğini kullanın.';
  if (m.includes('password should be at least')) return 'Şifre en az 8 karakter olmalı.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.';
  if (m.includes('same_password') || m.includes('should be different')) return 'Yeni şifre eskisiyle aynı olamaz.';
  if (m.includes('network') || m.includes('fetch')) return 'Bağlantı kurulamadı. İnternetinizi kontrol edin.';
  return 'Bir sorun oluştu: ' + mesaj;
}

export async function girisYap(eposta: string, sifre: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: eposta.trim().toLowerCase(),
    password: sifre
  });
  if (error) throw error;
  return data.session;
}

/** İlk kurulum: yönetici hesabını oluşturur, onay e-postası gönderilir. */
export async function hesapOlustur(eposta: string, sifre: string) {
  const temiz = eposta.trim().toLowerCase();
  if (!YONETICI_EPOSTALARI.includes(temiz)) {
    throw new Error('Bu e-posta adresi yönetici olarak tanımlı değil.');
  }
  const { data, error } = await supabase.auth.signUp({
    email: temiz,
    password: sifre,
    options: { emailRedirectTo: panelAdresi() }
  });
  if (error) throw error;
  // Supabase, var olan bir e-posta için güvenlik gereği hata yerine boş kimlik döndürür.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error('User already registered');
  }
  return data;
}

export async function sifreSifirlamaGonder(eposta: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(eposta.trim().toLowerCase(), {
    redirectTo: panelAdresi()
  });
  if (error) throw error;
}

export async function yeniSifreBelirle(sifre: string) {
  const { error } = await supabase.auth.updateUser({ password: sifre });
  if (error) throw error;
}

export async function cikisYap() {
  await supabase.auth.signOut();
}
