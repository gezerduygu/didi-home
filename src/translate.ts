/**
 * Didi Home · Otomatik çeviri istemcisi (Aşama 5)
 *
 * Yönetim panelinden çağrılır; asıl çeviri sunucuda (api/translate.ts) yapılır.
 * Çeviri, ürün/kategori KAYDEDİLİRKEN bir kez yapılıp veritabanına yazılır;
 * ziyaretçi başına çeviri maliyeti oluşmaz.
 */

import { supabase } from './supabase';

/** Çeviri henüz etkin değil (anahtar eklenmemiş ya da yerel geliştirme ortamı). */
export class CeviriKapaliHatasi extends Error {
  constructor(mesaj: string) {
    super(mesaj);
    this.name = 'CeviriKapaliHatasi';
  }
}

export async function ingilizceyeCevir<K extends string>(
  alanlar: Partial<Record<K, string | undefined>>
): Promise<Partial<Record<K, string>>> {
  const dolu = Object.fromEntries(
    Object.entries(alanlar).filter(([, d]) => typeof d === 'string' && (d as string).trim() !== '')
  );
  if (Object.keys(dolu).length === 0) return {};

  const { data } = await supabase.auth.getSession();
  const oturumAnahtari = data.session?.access_token;
  if (!oturumAnahtari) throw new Error('Çeviri için yönetici olarak giriş yapmış olmanız gerekiyor.');

  let yanit: Response;
  try {
    yanit = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${oturumAnahtari}` },
      body: JSON.stringify({ alanlar: dolu })
    });
  } catch {
    throw new Error('Çeviri servisine ulaşılamadı. İnternet bağlantınızı kontrol edin.');
  }

  let govde: { ceviri?: Partial<Record<K, string>>; hata?: string } | null = null;
  try {
    govde = await yanit.json();
  } catch {
    // JSON dönmüyorsa sunucu fonksiyonu yok demektir (ör. yerel geliştirme sunucusu)
    throw new CeviriKapaliHatasi('Çeviri servisi bu ortamda çalışmıyor (yalnızca yayındaki sitede çalışır).');
  }

  if (yanit.status === 503) throw new CeviriKapaliHatasi(govde?.hata || 'Çeviri henüz etkin değil.');
  if (!yanit.ok) throw new Error(govde?.hata || `Çeviri başarısız oldu (HTTP ${yanit.status}).`);
  return govde?.ceviri ?? {};
}
