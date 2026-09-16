/**
 * Didi Home · Aşama 3 — Gömülü (base64) fotoğrafları Storage'a taşıma
 *
 * Kullanım:
 *   node scripts/migrate-images-to-storage.mjs           → DENEME (rapor verir, hiçbir şey yazmaz)
 *   node scripts/migrate-images-to-storage.mjs --apply   → gerçekten taşır
 *
 * Ne yapar:
 *   1. products / categories / settings içindeki tüm "data:image/..." değerlerini bulur
 *   2. Aynı görseli bir kez yükler (SHA-256 ile tekilleştirir), ORİJİNAL baytlarla
 *      (yeniden sıkıştırma yok, kalite değişmez)
 *   3. Her yüklenen dosyayı adresinden indirip boyutunu doğrular
 *   4. Veritabanındaki base64 değerleri TEK TRANSACTION içinde adreslerle değiştirir;
 *      doğrulama başarısızsa hiçbir şey değişmez
 *
 * Güvenlik:
 *   - Önce backups/ klasörüne tam yedek yazar.
 *   - Eski değerler revisions tablosuna tetikleyiciyle otomatik yazılır.
 *   - Yükleme için yalnızca "tasima-2026-09-16/" klasörüne, yalnızca EKLEME izni veren
 *     GEÇİCİ bir kural açılır ve betik biter bitmez (hata olsa bile) kaldırılır.
 *     (Servis anahtarı kullanmamak için tercih edildi.)
 *   - Tekrar çalıştırmak güvenlidir: aynı dosya zaten varsa yeniden kullanılır.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

for (const dosya of ['.env.local', '.env']) {
  if (!fs.existsSync(dosya)) continue;
  for (const satir of fs.readFileSync(dosya, 'utf8').split(/\r?\n/)) {
    const m = satir.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qamtitryhoffjbdxvgar.supabase.co';
const ANON = process.env.VITE_SUPABASE_ANON_KEY ||
  (fs.readFileSync('src/supabase.ts', 'utf8').match(/eyJ[A-Za-z0-9._-]+/) || [])[0];
const KLASOR = 'gorseller';
const TASIMA_KLASORU = 'tasima-2026-09-16';
const GECICI_KURAL = 'gecici tasima yuklemesi';
const APPLY = process.argv.includes('--apply');

if (!process.env.SUPABASE_DB_URL) { console.error('SUPABASE_DB_URL yok (.env.local)'); process.exit(1); }

const db = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
const supabase = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } });
const log = (...a) => console.log(...a);
const kb = (n) => (n / 1024).toFixed(0) + ' KB';

const UZANTI = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function cozumle(dataUri) {
  const m = dataUri.match(/^data:(image\/[a-z]+);base64,(.+)$/s);
  if (!m) return null;
  const tur = m[1] === 'image/jpg' ? 'image/jpeg' : m[1];
  const bayt = Buffer.from(m[2], 'base64');
  const ozet = crypto.createHash('sha256').update(bayt).digest('hex').slice(0, 20);
  return { tur, bayt, yol: `${TASIMA_KLASORU}/${ozet}.${UZANTI[tur] || 'jpg'}` };
}

const genelAdres = (yol) => `${SUPABASE_URL}/storage/v1/object/public/${KLASOR}/${yol}`;

async function main() {
  log(APPLY ? '>>> GERÇEK TAŞIMA MODU\n' : '>>> DENEME MODU (hiçbir şey yazılmayacak)\n');
  await db.connect();

  // ---------- 1. Oku ----------
  const urunler = (await db.query('select id, title, image, images from public.products order by sort_order')).rows;
  const kategoriler = (await db.query('select id, title, image from public.categories order by sort_order')).rows;
  const ayar = (await db.query("select value from public.settings where key = 'covers'")).rows[0]?.value || {};

  // ---------- 2. Gömülü görselleri topla ----------
  const gorseller = new Map(); // dataUri -> { tur, bayt, yol, kullanildigiYerler[] }
  const ekle = (deger, yer) => {
    if (typeof deger !== 'string' || !deger.startsWith('data:')) return;
    if (!gorseller.has(deger)) {
      const c = cozumle(deger);
      if (!c) { log(`  ! çözümlenemedi: ${yer}`); return; }
      gorseller.set(deger, { ...c, yerler: [] });
    }
    gorseller.get(deger).yerler.push(yer);
  };
  for (const u of urunler) {
    ekle(u.image, `ürün "${u.title}" kapak`);
    (u.images || []).forEach((g, i) => ekle(g, `ürün "${u.title}" foto ${i + 1}`));
  }
  for (const k of kategoriler) ekle(k.image, `kategori "${k.title}" vitrin`);
  for (const [anahtar, deger] of Object.entries(ayar)) ekle(deger, `eski kapak ayarı ${anahtar}`);

  const toplamBayt = [...gorseller.values()].reduce((t, g) => t + g.bayt.length, 0);
  const toplamKullanim = [...gorseller.values()].reduce((t, g) => t + g.yerler.length, 0);
  log(`Gömülü görsel: ${toplamKullanim} kullanım, ${gorseller.size} benzersiz dosya, toplam ${kb(toplamBayt)}\n`);
  for (const g of gorseller.values()) {
    log(`  · ${g.yol.padEnd(46)} ${kb(g.bayt.length).padStart(7)}  ← ${g.yerler.join(', ')}`);
  }

  if (!APPLY) {
    log('\nDeneme bitti. Gerçekten taşımak için: node scripts/migrate-images-to-storage.mjs --apply');
    return;
  }
  if (gorseller.size === 0) { log('Taşınacak görsel yok.'); return; }

  // ---------- 3. Yedek ----------
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  fs.mkdirSync('backups', { recursive: true });
  const yedek = path.join('backups', `gorseller-tasima-oncesi-${stamp}.json`);
  fs.writeFileSync(yedek, JSON.stringify({ urunler, kategoriler, ayar }, null, 2));
  log(`\nYedek: ${yedek} (${(fs.statSync(yedek).size / 1024 / 1024).toFixed(1)} MB)`);

  // ---------- 4. Geçici kural aç, yükle, kuralı KAPAT ----------
  log('\nGeçici yükleme kuralı açılıyor (yalnızca ' + TASIMA_KLASORU + '/ klasörü, yalnızca ekleme)...');
  await db.query(`drop policy if exists "${GECICI_KURAL}" on storage.objects`);
  await db.query(
    `create policy "${GECICI_KURAL}" on storage.objects for insert to anon
     with check (bucket_id = '${KLASOR}' and (storage.foldername(name))[1] = '${TASIMA_KLASORU}')`
  );

  try {
    for (const g of gorseller.values()) {
      const { error } = await supabase.storage.from(KLASOR).upload(g.yol, g.bayt, {
        contentType: g.tur,
        cacheControl: '31536000',
        upsert: false
      });
      if (error && !/exists|duplicate/i.test(error.message)) {
        throw new Error(`Yüklenemedi (${g.yol}): ${error.message}`);
      }
      log(`  ✓ ${g.yol} ${error ? '(zaten vardı)' : ''}`);
    }
  } finally {
    await db.query(`drop policy if exists "${GECICI_KURAL}" on storage.objects`);
    const kalan = (await db.query(
      `select count(*)::int n from pg_policies where schemaname = 'storage' and policyname = $1`, [GECICI_KURAL]
    )).rows[0].n;
    log(kalan === 0 ? '✓ Geçici kural kaldırıldı.' : '!!! GEÇİCİ KURAL KALDIRILAMADI — elle kaldırın');
  }

  // ---------- 5. Her dosyayı adresinden indirip doğrula ----------
  log('\nYüklenen dosyalar adreslerinden indirilerek doğrulanıyor...');
  for (const g of gorseller.values()) {
    const yanit = await fetch(genelAdres(g.yol));
    const bayt = Buffer.from(await yanit.arrayBuffer());
    if (!yanit.ok || !bayt.equals(g.bayt)) {
      throw new Error(`Doğrulama başarısız: ${g.yol} (HTTP ${yanit.status}, ${bayt.length} bayt)`);
    }
  }
  log(`✓ ${gorseller.size} dosyanın hepsi adresinden birebir aynı içerikle geliyor.`);

  // ---------- 6. Veritabanını tek transaction'da güncelle ----------
  const cevir = (d) => (typeof d === 'string' && gorseller.has(d) ? genelAdres(gorseller.get(d).yol) : d);

  log('\nVeritabanı güncelleniyor (tek transaction)...');
  await db.query('begin');
  try {
    for (const u of urunler) {
      const yeniImages = (u.images || []).map(cevir);
      const yeniImage = cevir(u.image);
      if (yeniImage !== u.image || JSON.stringify(yeniImages) !== JSON.stringify(u.images)) {
        await db.query('update public.products set image = $1, images = $2 where id = $3', [yeniImage, yeniImages, u.id]);
        log(`  ✓ ürün: ${u.title}`);
      }
    }
    for (const k of kategoriler) {
      const yeni = cevir(k.image);
      if (yeni !== k.image) {
        await db.query('update public.categories set image = $1 where id = $2', [yeni, k.id]);
        log(`  ✓ kategori: ${k.title}`);
      }
    }
    const yeniAyar = Object.fromEntries(Object.entries(ayar).map(([a, d]) => [a, cevir(d)]));
    if (JSON.stringify(yeniAyar) !== JSON.stringify(ayar)) {
      await db.query("update public.settings set value = $1 where key = 'covers'", [JSON.stringify(yeniAyar)]);
      log('  ✓ eski kapak ayarları');
    }

    const kalanBase64 = (await db.query(`
      select
        (select count(*) from public.products where image like 'data:%' or exists (select 1 from unnest(images) g where g like 'data:%'))::int as urun,
        (select count(*) from public.categories where image like 'data:%')::int as kategori,
        (select count(*) from public.settings where value::text like '%data:image%')::int as ayar
    `)).rows[0];
    if (kalanBase64.urun + kalanBase64.kategori + kalanBase64.ayar > 0) {
      throw new Error('Hâlâ gömülü görsel kaldı: ' + JSON.stringify(kalanBase64));
    }
    const urunSayisi = (await db.query('select count(*)::int n from public.products')).rows[0].n;
    if (urunSayisi !== urunler.length) throw new Error('Ürün sayısı değişti!');

    await db.query('commit');
    log('✓ Kalıcı olarak kaydedildi (COMMIT). Gömülü görsel kalmadı.');
  } catch (e) {
    await db.query('rollback');
    log('✗ Hata — veritabanı değişiklikleri GERİ ALINDI (yüklenen dosyalar zararsız biçimde depoda kaldı).');
    throw e;
  }
}

main()
  .catch((e) => { console.error('\nHATA:', e.message); process.exitCode = 1; })
  .finally(() => db.end().catch(() => {}));
