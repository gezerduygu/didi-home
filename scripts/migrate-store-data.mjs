/**
 * Didi Home · Aşama 1 — Veri taşıma betiği
 *
 * Eski yapı: store_data tablosunda 3 satır (products / categories / covers),
 *            her biri tek bir dev JSON.
 * Yeni yapı: products, categories, settings tabloları (satır başına bir kayıt).
 *
 * Kullanım:
 *   node scripts/migrate-store-data.mjs            → DENEME (hiçbir şey yazmaz, rapor verir)
 *   node scripts/migrate-store-data.mjs --apply    → gerçekten taşır
 *
 * Güvenlik:
 *   - Taşımadan önce her zaman backups/ klasörüne tam yedek yazar.
 *   - Eski store_data tablosuna DOKUNMAZ (yedek olarak kalır).
 *   - Yazma işlemi upsert'tir; tekrar çalıştırmak veri bozmaz.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qamtitryhoffjbdxvgar.supabase.co';
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXRpdHJ5aG9mZmpiZHh2Z2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODI4ODUsImV4cCI6MjEwMjQ1ODg4NX0._iLwxCXM7Esh_OpGY35ONxEf7rDUJu85KqacVhMN8Mc';

const APPLY = process.argv.includes('--apply');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/** Taşıma sırasında uygulanacak düzeltmeler (kullanıcı onayıyla). */
const DUZELTMELER = {
  'custom-1788995880100': { title: 'Ev Renovasyon', price: 9999 }
};

const log = (...a) => console.log(...a);
const kb = (o) => (JSON.stringify(o).length / 1024).toFixed(0) + ' KB';

async function main() {
  log(APPLY ? '>>> GERÇEK TAŞIMA MODU\n' : '>>> DENEME MODU (hiçbir şey yazılmayacak)\n');

  // ---------- 1. Eski veriyi oku ----------
  const { data: rows, error } = await supabase.from('store_data').select('*');
  if (error) throw new Error('store_data okunamadı: ' + error.message);

  const al = (k) => rows.find((r) => r.key === k)?.value;
  const eskiUrunler = al('products') || [];
  const eskiKategoriler = al('categories') || [];
  const eskiKapaklar = al('covers') || {};

  log(`Okundu: ${eskiUrunler.length} ürün (${kb(eskiUrunler)}), ${eskiKategoriler.length} kategori, kapaklar ${kb(eskiKapaklar)}`);

  // ---------- 2. Yedek ----------
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const dir = 'backups';
  fs.mkdirSync(dir, { recursive: true });
  const yedek = path.join(dir, `store_data-tasima-oncesi-${stamp}.json`);
  fs.writeFileSync(yedek, JSON.stringify(rows, null, 2));
  log(`Yedek yazıldı: ${yedek}\n`);

  // ---------- 3. Dönüştür ----------
  const kategoriler = eskiKategoriler.map((c, i) => ({
    id: c.id,
    title: (c.title || c.id).trim(),
    title_en: c.titleEn?.trim() || null,
    subtitle: c.subtitle?.trim() || null,
    subtitle_en: c.subtitleEn?.trim() || null,
    description: c.description?.trim() || null,
    description_en: c.descriptionEn?.trim() || null,
    image: c.image || null,
    subcategories: c.subcategories || [],
    sort_order: i
  }));

  const kategoriIdleri = new Set(kategoriler.map((c) => c.id));
  const yetimler = [];

  const urunler = eskiUrunler.map((p, i) => {
    const duzeltme = DUZELTMELER[p.id] || {};
    if (!kategoriIdleri.has(p.category)) yetimler.push(`${p.id} → "${p.category}"`);
    const gorseller = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
    return {
      id: p.id,
      title: (duzeltme.title ?? p.title ?? '').trim(),
      category_id: p.category,
      subcategory: p.subcategory?.trim() || null,
      price: duzeltme.price ?? Number(p.price) ?? 0,
      image: p.image || gorseller[0] || null,
      images: gorseller,
      story: p.story?.trim() || null,
      condition: p.condition?.trim() || null,
      material: p.material?.trim() || null,
      dimensions: p.dimensions?.trim() || null,
      is_second_hand: Boolean(p.isSecondHand),
      status: 'yayinda',
      sort_order: i,
      created_at: p.createdAt || new Date().toISOString()
    };
  });

  log('Taşınacak kategoriler:');
  kategoriler.forEach((c) => log(`  · ${c.id.padEnd(16)} ${c.title}  (${c.subcategories.length} alt başlık)`));

  log('\nTaşınacak ürünler:');
  urunler.forEach((p) => {
    const d = DUZELTMELER[p.id] ? '  ← DÜZELTİLDİ' : '';
    log(`  · ${p.id.padEnd(24)} ${p.title.padEnd(42)} ${String(p.price).padStart(6)} TL  ${p.images.length} foto${d}`);
  });

  if (yetimler.length) {
    log('\nUYARI: Kategorisi bulunmayan ürünler var, bunlar taşınamaz:');
    yetimler.forEach((y) => log('  ! ' + y));
  }

  const gomuluFoto = urunler.reduce((n, p) => n + p.images.filter((s) => s.startsWith('data:')).length, 0);
  log(`\nGömülü (base64) fotoğraf sayısı: ${gomuluFoto}  → Aşama 3'te Storage'a taşınacak.`);

  if (!APPLY) {
    log('\nDeneme bitti. Gerçekten taşımak için: node scripts/migrate-store-data.mjs --apply');
    return;
  }

  // ---------- 4. Yaz ----------
  log('\nKategoriler yazılıyor...');
  const { error: kErr } = await supabase.from('categories').upsert(kategoriler, { onConflict: 'id' });
  if (kErr) throw new Error('Kategoriler yazılamadı: ' + kErr.message);

  log('Ürünler yazılıyor (tek tek, hata olursa hangisi olduğu görünsün diye)...');
  for (const u of urunler) {
    const { error: uErr } = await supabase.from('products').upsert(u, { onConflict: 'id' });
    if (uErr) throw new Error(`Ürün yazılamadı (${u.id}): ${uErr.message}`);
    log(`  ✓ ${u.title}`);
  }

  log('Kapak ayarları yazılıyor...');
  const { error: sErr } = await supabase.from('settings').upsert({ key: 'covers', value: eskiKapaklar }, { onConflict: 'key' });
  if (sErr) throw new Error('Ayarlar yazılamadı: ' + sErr.message);

  // ---------- 5. Doğrula ----------
  log('\nDoğrulama yapılıyor...');
  const { data: yeniUrunler } = await supabase.from('products').select('id,title,price,images');
  const { data: yeniKategoriler } = await supabase.from('categories').select('id');

  let hata = 0;
  for (const beklenen of urunler) {
    const bulunan = yeniUrunler?.find((x) => x.id === beklenen.id);
    if (!bulunan) { log(`  ! EKSİK: ${beklenen.id}`); hata++; continue; }
    if (bulunan.images.length !== beklenen.images.length) {
      log(`  ! FOTOĞRAF SAYISI FARKLI: ${beklenen.id} (${bulunan.images.length} ≠ ${beklenen.images.length})`);
      hata++;
    }
  }

  log(`\nSonuç: ${yeniKategoriler?.length ?? 0} kategori, ${yeniUrunler?.length ?? 0} ürün yeni tablolarda.`);
  log(hata === 0 ? '✓ Tüm kayıtlar eksiksiz taşındı.' : `✗ ${hata} sorun bulundu, yukarıya bakın.`);
  log('\nNot: Eski store_data tablosu silinmedi; yedek olarak duruyor.');
}

main().catch((e) => {
  console.error('\nHATA:', e.message);
  console.error('Hiçbir şey yarım kalmadıysa tekrar çalıştırabilirsiniz (upsert güvenlidir).');
  process.exit(1);
});
