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
 * Gerekli: .env.local içinde SUPABASE_DB_URL (bkz. scripts/run-sql.mjs)
 *
 * Güvenlik:
 *   - Taşımadan önce her zaman backups/ klasörüne tam yedek yazar.
 *   - Eski store_data tablosuna DOKUNMAZ (yedek olarak kalır).
 *   - Tüm yazma işlemi TEK BİR TRANSACTION içindedir. Doğrulama başarısız olursa
 *     her şey geri alınır (ROLLBACK); yarım taşınmış veri kalmaz.
 *   - Tekrar çalıştırmak güvenlidir (ON CONFLICT ... DO UPDATE).
 *
 * Not: İlk sürüm Supabase API'si üzerinden okuyordu; 5,6 MB'lık tek JSON
 * satırı API'nin süre sınırına takıldığı için doğrudan bağlantıya geçildi.
 */

import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

// ---------- .env.local oku ----------
for (const dosya of ['.env.local', '.env']) {
  if (!fs.existsSync(dosya)) continue;
  for (const satir of fs.readFileSync(dosya, 'utf8').split(/\r?\n/)) {
    const m = satir.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

if (!process.env.SUPABASE_DB_URL) {
  console.error('SUPABASE_DB_URL bulunamadı. Ayrıntı: node scripts/run-sql.mjs');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

/** Taşıma sırasında uygulanacak düzeltmeler (kullanıcı onayıyla, 2026-09-16). */
const DUZELTMELER = {
  'custom-1788995880100': { title: 'Ev Renovasyon', price: 9999 }
};

const log = (...a) => console.log(...a);
const kb = (o) => (JSON.stringify(o).length / 1024).toFixed(0) + ' KB';
const temiz = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

const client = new pg.Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  log(APPLY ? '>>> GERÇEK TAŞIMA MODU\n' : '>>> DENEME MODU (hiçbir şey yazılmayacak)\n');
  await client.connect();

  // ---------- 1. Eski veriyi oku ----------
  const { rows } = await client.query('select key, value, updated_at from public.store_data');
  const al = (k) => rows.find((r) => r.key === k)?.value;
  const eskiUrunler = al('products') || [];
  const eskiKategoriler = al('categories') || [];
  const eskiKapaklar = al('covers') || {};

  log(`Okundu: ${eskiUrunler.length} ürün (${kb(eskiUrunler)}), ${eskiKategoriler.length} kategori, kapaklar ${kb(eskiKapaklar)}`);

  // ---------- 2. Yedek ----------
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  fs.mkdirSync('backups', { recursive: true });
  const yedek = path.join('backups', `store_data-tasima-oncesi-${stamp}.json`);
  fs.writeFileSync(yedek, JSON.stringify(rows, null, 2));
  log(`Yedek yazıldı: ${yedek} (${(fs.statSync(yedek).size / 1024 / 1024).toFixed(1)} MB)\n`);

  // ---------- 3. Dönüştür ----------
  const kategoriler = eskiKategoriler.map((c, i) => ({
    id: c.id,
    title: temiz(c.title) || c.id,
    title_en: temiz(c.titleEn),
    subtitle: temiz(c.subtitle),
    subtitle_en: temiz(c.subtitleEn),
    description: temiz(c.description),
    description_en: temiz(c.descriptionEn),
    image: c.image || null,
    subcategories: c.subcategories || [],
    sort_order: i
  }));

  const kategoriIdleri = new Set(kategoriler.map((c) => c.id));
  const yetimler = eskiUrunler.filter((p) => !kategoriIdleri.has(p.category));

  const urunler = eskiUrunler
    .filter((p) => kategoriIdleri.has(p.category))
    .map((p, i) => {
      const d = DUZELTMELER[p.id] || {};
      const gorseller = Array.isArray(p.images) && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
      return {
        id: p.id,
        title: (d.title ?? p.title ?? '').trim(),
        category_id: p.category,
        subcategory: temiz(p.subcategory),
        price: d.price ?? Number(p.price ?? 0),
        image: p.image || gorseller[0] || null,
        images: gorseller,
        story: temiz(p.story),
        condition: temiz(p.condition),
        material: temiz(p.material),
        dimensions: temiz(p.dimensions),
        is_second_hand: Boolean(p.isSecondHand),
        sort_order: i,
        created_at: p.createdAt || new Date().toISOString()
      };
    });

  log('Taşınacak kategoriler:');
  kategoriler.forEach((c) => log(`  · ${c.id.padEnd(16)} ${c.title}  (${c.subcategories.length} alt başlık)`));
  log('\nTaşınacak ürünler:');
  urunler.forEach((p) => {
    const not = DUZELTMELER[p.id] ? '  ← DÜZELTİLDİ' : '';
    log(`  · ${p.id.padEnd(24)} ${p.title.padEnd(44)} ${String(p.price).padStart(6)} TL  ${p.images.length} foto${not}`);
  });
  if (yetimler.length) {
    log('\nUYARI: Kategorisi olmayan ürünler taşınmayacak (yedekte duruyor):');
    yetimler.forEach((p) => log(`  ! ${p.id} → "${p.category}"`));
  }

  if (!APPLY) {
    log('\nDeneme bitti. Gerçekten taşımak için: node scripts/migrate-store-data.mjs --apply');
    return;
  }

  // ---------- 4. Tek transaction içinde yaz ----------
  log('\nTransaction başlatıldı...');
  await client.query('begin');
  try {
    for (const c of kategoriler) {
      await client.query(
        `insert into public.categories
           (id, title, title_en, subtitle, subtitle_en, description, description_en, image, subcategories, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         on conflict (id) do update set
           title = excluded.title, title_en = excluded.title_en,
           subtitle = excluded.subtitle, subtitle_en = excluded.subtitle_en,
           description = excluded.description, description_en = excluded.description_en,
           image = excluded.image, subcategories = excluded.subcategories, sort_order = excluded.sort_order`,
        [c.id, c.title, c.title_en, c.subtitle, c.subtitle_en, c.description, c.description_en, c.image, c.subcategories, c.sort_order]
      );
    }
    log(`  ✓ ${kategoriler.length} kategori`);

    for (const u of urunler) {
      await client.query(
        `insert into public.products
           (id, title, category_id, subcategory, price, image, images, story, condition, material,
            dimensions, is_second_hand, status, sort_order, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'yayinda',$13,$14)
         on conflict (id) do update set
           title = excluded.title, category_id = excluded.category_id, subcategory = excluded.subcategory,
           price = excluded.price, image = excluded.image, images = excluded.images, story = excluded.story,
           condition = excluded.condition, material = excluded.material, dimensions = excluded.dimensions,
           is_second_hand = excluded.is_second_hand, sort_order = excluded.sort_order`,
        [u.id, u.title, u.category_id, u.subcategory, u.price, u.image, u.images, u.story, u.condition,
         u.material, u.dimensions, u.is_second_hand, u.sort_order, u.created_at]
      );
      log(`  ✓ ${u.title}`);
    }

    await client.query(
      `insert into public.settings (key, value) values ('covers', $1)
       on conflict (key) do update set value = excluded.value`,
      [JSON.stringify(eskiKapaklar)]
    );
    log('  ✓ kapak ayarları');

    // ---------- 5. Transaction içinde doğrula ----------
    log('\nDoğrulanıyor...');
    const hatalar = [];

    const { rows: dbUrun } = await client.query(
      'select id, title, price, cardinality(images) as foto, images from public.products'
    );
    for (const beklenen of urunler) {
      const x = dbUrun.find((r) => r.id === beklenen.id);
      if (!x) { hatalar.push(`eksik ürün: ${beklenen.id}`); continue; }
      if (Number(x.foto) !== beklenen.images.length) hatalar.push(`foto sayısı farklı: ${beklenen.id}`);
      if (Number(x.price) !== Number(beklenen.price)) hatalar.push(`fiyat farklı: ${beklenen.id}`);
      // Fotoğrafların içeriği birebir aynı mı? (base64 dahil)
      if (JSON.stringify(x.images) !== JSON.stringify(beklenen.images)) hatalar.push(`foto içeriği farklı: ${beklenen.id}`);
    }
    const { rows: [{ n: katSayi }] } = await client.query('select count(*)::int as n from public.categories');
    if (katSayi < kategoriler.length) hatalar.push(`kategori sayısı eksik (${katSayi})`);

    if (hatalar.length) {
      throw new Error('Doğrulama başarısız:\n  - ' + hatalar.join('\n  - '));
    }

    await client.query('commit');
    log(`✓ Doğrulama tamam, kalıcı olarak kaydedildi (COMMIT).`);
    log(`\nSonuç: ${katSayi} kategori, ${dbUrun.length} ürün, kapak ayarları yeni tablolarda.`);
    log('Eski store_data tablosu silinmedi; yedek olarak duruyor.');
  } catch (e) {
    await client.query('rollback');
    log('\n✗ Hata oluştu, TÜM değişiklikler geri alındı (ROLLBACK). Veritabanı taşıma öncesi haliyle duruyor.');
    throw e;
  }
}

main()
  .catch((e) => {
    console.error('\nHATA:', e.message);
    process.exitCode = 1;
  })
  .finally(() => client.end().catch(() => {}));
