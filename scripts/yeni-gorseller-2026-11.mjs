/**
 * Didi Home · 2026-11-16 — Yeni fotoğrafların siteye yerleştirilmesi
 *
 * Kullanım:
 *   node scripts/yeni-gorseller-2026-11.mjs <manifest.json>           → DENEME (hiçbir şey yazmaz)
 *   node scripts/yeni-gorseller-2026-11.mjs <manifest.json> --apply   → gerçekten uygular
 *
 * manifest.json: önceden 1200×1600'e hazırlanmış görsellerin listesi
 *   { "<no>": { "dosya": "<yerel yol>", "sha": "...", "w": 1200, "h": 1600 } }
 *
 * Ne yapar:
 *   1. backups/ klasörüne tam yedek yazar (Altın kural 1)
 *   2. Görselleri Storage'a yükler (gorseller/urunler/2026-11, gorseller/vitrin/2026-11)
 *      ve her birini adresinden indirip birebir doğrular
 *   3. TEK TRANSACTION içinde:
 *        · 6 mevcut ürünün ve 2 kategori vitrininin görsellerini yenileriyle değiştirir
 *          (her ürün kendi satırında güncellenir — Altın kural 2)
 *        · 23 yeni ürünü ekler (fiyat 0; sitede fiyat gösterilmiyor — src/ozellikler.ts)
 *      Doğrulama tutmazsa hiçbir şey değişmez.
 *
 * Güvenlik: migrate-images-to-storage.mjs ile aynı yöntem — yalnızca bu ayın
 * klasörlerine, yalnızca EKLEME izni veren geçici kural açılır ve betik biter
 * bitmez (hata olsa bile) kaldırılır. Eski dosyalar silinmez; eski değerler
 * revisions tablosuna tetikleyiciyle yazılır.
 */

import fs from 'node:fs';
import path from 'node:path';
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
const AY = '2026-11';
const GECICI_KURAL = 'gecici yukleme 2026-11';
const APPLY = process.argv.includes('--apply');
const manifestYolu = process.argv.slice(2).find((a) => !a.startsWith('--'));

if (!manifestYolu) { console.error('Kullanım: node scripts/yeni-gorseller-2026-11.mjs <manifest.json> [--apply]'); process.exit(1); }
if (!process.env.SUPABASE_DB_URL) { console.error('SUPABASE_DB_URL yok (.env.local)'); process.exit(1); }

const manifest = JSON.parse(fs.readFileSync(manifestYolu, 'utf8'));
const db = new pg.Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
const supabase = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false } });
const log = (...a) => console.log(...a);

const yol = (no, tur) => {
  const g = manifest[String(no)];
  if (!g) throw new Error(`Manifestte #${no} yok`);
  return `${tur}/${AY}/${g.sha}.jpg`;
};
const adres = (no, tur = 'urunler') => `${SUPABASE_URL}/storage/v1/object/public/${KLASOR}/${yol(no, tur)}`;

// ---------------------------------------------------------------------
// PLAN
// ---------------------------------------------------------------------

/** Kategori vitrinleri (ana sayfa kartları) */
const VITRINLER = [
  { id: 'houte-couture', no: 2 },
  { id: 'ev-to-home', no: 1 }
];

/** Mevcut ürünler: görseller yenileriyle DEĞİŞTİRİLİR (ilk numara kapak) */
const DEGISECEKLER = [
  { id: 'custom-1788913823129', ad: 'Sarı İşlemeli Kaftan', nolar: [46, 44, 45, 47] },
  { id: 'hc-kaftan', ad: 'Zümrüt Yeşili Nakışlı Kaftan', nolar: [58, 57, 59, 56] },
  { id: 'hc-black-peacock', ad: 'Siyah Tavuskuşlu Nakışlı Kaftan', nolar: [55, 54] },
  { id: 'hc-teal-peacock', ad: 'Petrol Yeşili Tavuskuşu El Nakışlı Sabahlık', nolar: [52, 53] },
  { id: 'custom-1788996497830', ad: 'Mor Çiçek İşlemeli Kimono', nolar: [39, 40, 38] },
  { id: 'custom-1788995880100', ad: 'Ev Renovasyon', nolar: [36, 31, 35, 32, 34, 33] }
];

const HC = { category_id: 'houte-couture', subcategory: 'Kaftan & Kimono', condition: 'Atölye Özel Üretimi', material: null };
const SER = { category_id: 'seramik', subcategory: 'Vazo & Saksı', condition: 'El Yapımı Sanatçı Eseri', material: 'El Yapımı Seramik' };

/** Yeni ürünler */
const YENILER = [
  { ...HC, id: 'hc-sari-kaban', title: 'Hardal Sarısı İşlemeli Kaban', nolar: [41, 43, 42],
    story: 'Hardal sarısının sıcaklığı, ceplerinde ve kol ağızlarında açan renkli çiçek işlemeleriyle buluşuyor. Sade kesimi sayesinde gündelik bir kombini bile özel kılan, tek başına konuşan bir parça.' },
  { ...HC, id: 'hc-siyah-kare-islemeli', title: 'Siyah Kare İşlemeli Kaftan', nolar: [50, 51, 49],
    story: 'Siyahın sadeliğini, sırtındaki baklava formlu el işlemesi ve kol ağızlarındaki canlı renkli nakışlar tamamlıyor. Önden yalın, arkadan sürprizli; uzun ve dökümlü bir kaftan.' },
  { ...HC, id: 'hc-sal-desenli-kaftan', title: 'Şal Desenli Kaftan', nolar: [86, 87, 88, 89],
    story: 'Kiremit, hardal ve toprak tonlarının iç içe geçtiği şal deseni, bu kaftanı baştan sona bir tabloya dönüştürüyor. Hakim yakası ve diz altı boyuyla her mevsim üste alınabilecek zamansız bir parça.' },

  { id: 'ev-cizgili-kilim', category_id: 'ev-to-home', subcategory: 'Kilim', condition: null, material: 'El Dokuması',
    title: 'El Dokuması Çizgili Kilim', nolar: [37],
    story: 'Kiremit, turuncu ve koyu toprak tonlarındaki çizgileri ve aralarına serpiştirilmiş geleneksel motifleriyle, bulunduğu odaya sıcaklık ve hikâye katan bir kilim.' },

  { ...SER, id: 'ser-sapli-ayakli-saksi', title: 'Saplı Üç Ayaklı Saksı', nolar: [90],
    story: 'Elle şekillendirilmiş gövdesi, kıvrık sapı ve üç ayağıyla sanki yürümeye hazır bir saksı. Sırının altında parmak izleri hâlâ okunuyor.' },
  { ...SER, id: 'ser-dal-askili-mini-saksi', title: 'Dal Askılı Mini Saksı', nolar: [91, 109],
    story: 'Taş bir tabandan yükselen doğal dal, ipe asılı küçük seramik saksıyı taşıyor. Doğadan toplanan parçalarla el yapımı seramiğin buluştuğu, her biri tek olan bir obje.' },
  { ...SER, id: 'ser-halka-kulplu-vazo', title: 'Halka Kulplu Ayaklı Vazo', nolar: [92],
    story: 'İnce uzun gövdesi, tek büyük halka kulpu ve minik ayaklarıyla sade ama karakterli bir vazo. Kırmızı çamurun mat dokusu olduğu gibi bırakıldı.' },
  { ...SER, id: 'ser-disk-kulplu-vazo', title: 'Disk Kulplu Silindir Vazo', nolar: [93],
    story: 'Silindir gövdenin iki yanına yerleştirilen disk formlu kulplar, bu vazoyu küçük bir heykele dönüştürüyor. Kuru otlar ve dallarla çok yakışıyor.' },
  { ...SER, id: 'ser-sirli-ayakli-saksi', title: 'Sırlı Üç Ayaklı Saksı', nolar: [94],
    story: 'Ağız kısmından aşağı süzülen mavi-gri sırıyla her açıdan farklı görünen, üç ayaklı geniş bir saksı. Sarkan bitkiler için biçilmiş kaftan.' },
  { ...SER, subcategory: 'Heykel & Buhurdanlık', id: 'ser-heykel-lamba', title: 'Heykel Formlu Seramik Lamba', nolar: [95],
    story: 'Yumuşak, akışkan hatlarıyla bir heykel gibi şekillendirilmiş lamba gövdesi. Işığı kapalıyken de odanın en dikkat çeken objesi.' },
  { ...SER, id: 'ser-cift-halkali-saksi', title: 'Çift Halkalı Sırlı Saksı', nolar: [96],
    story: 'İki yanındaki iri halka kulplarıyla oyunbaz bir duruşu olan, koyu sırlı küçük saksı. Sukulentler için ideal.' },
  { ...SER, id: 'ser-yassi-vazo', title: 'Yassı Gövdeli Tek Dal Vazosu', nolar: [97],
    story: 'Geniş ve yassı gövdesi, dar boynuyla tek bir dalı ya da başağı sergilemek için tasarlandı. Mat kırmızı çamurun sadeliği ön planda.' },
  { ...SER, id: 'ser-yarim-ay-vazo', title: 'Yarım Ay Kulplu Vazo', nolar: [98],
    story: 'Bir yanında yarım ay, diğer yanında sıra sıra küçük toplar: asimetrisiyle dengeyi bulan, ayaklı silindir bir vazo.' },
  { ...SER, id: 'ser-cift-kulplu-kadeh-saksi', title: 'Çift Kulplu Kadeh Saksı', nolar: [99],
    story: 'Kadeh formundaki ayaklı gövdesi ve iki halka kulpuyla antik bir kabı andıran küçük saksı.' },
  { ...SER, subcategory: 'Fincan & Tabak', id: 'ser-el-cizimi-tabak', title: 'El Çizimi Desenli Tabak', nolar: [100],
    story: 'Krem zemin üzerine elle çizilmiş çocuksu figürler ve evlerle bezeli, organik formlu bir tabak. Her çizgisi tek seferlik.' },
  { ...SER, id: 'ser-halka-mini-vazo', title: 'Halka Formlu Mini Vazo', nolar: [101],
    story: 'Ortası boş halka formuyla avuç içi kadar bir vazo. Tek bir dal ya da kuru çiçek için.' },
  { ...SER, id: 'ser-uclu-mini-vazo', title: 'Üçlü Mini Vazo Seti', nolar: [102],
    story: 'Üç farklı formda, birbirini tamamlayan üç mini vazo. Yan yana durduklarında küçük bir aile gibi görünüyorlar.' },
  { ...SER, id: 'ser-uc-ayakli-sirli-saksi', title: 'Üç Ayaklı Sırlı Sukulent Saksısı', nolar: [103, 107],
    story: 'Parlak kahverengi sırı ve üç uzun ayağıyla masadan hafifçe yükselen, elle şekillendirilmiş bir saksı.' },
  { ...SER, id: 'ser-tek-dal-mini-vazo', title: 'Tek Dal Mini Vazo', nolar: [104],
    story: 'Küçük, köşeli gövdesiyle tek bir dalı taşımak için yapılmış minik vazo. Sadeliğin güzelliği.' },
  { ...SER, id: 'ser-kemer-dal-askili-kase', title: 'Kemer Dallı Askılı Kase', nolar: [105],
    story: 'Doğal bir dalın kemer gibi kıvrılan formuna asılı, desenli el yapımı seramik kase. Doğanın biçimlendirdiği dal ile atölyenin biçimlendirdiği çamur bir arada.' },
  { ...SER, id: 'ser-dik-dal-askili-saksi', title: 'Dik Dallı Askılı Saksı', nolar: [106],
    story: 'Ağaç kabuğu tabandan yukarı kıvrılarak yükselen dal, ipe asılı seramik saksıyı taşıyor. Çalışma masası ya da kitaplık için canlı bir köşe.' },
  { ...SER, id: 'ser-kulakli-silindir-vazo', title: 'Kulaklı Silindir Vazo', nolar: [108],
    story: 'Bir yanında halka kulp, diğer yanında küpeli bir kulak: yüzü olmayan ama karakteri olan, geniş silindir bir vazo.' },
  { ...SER, id: 'ser-dalga-dal-askili-saksi', title: 'Dalga Dallı Askılı Saksı', nolar: [110],
    story: 'Dalga gibi kıvrılan doğal dalın ucunda asılı küçük seramik saksı. Konsol ya da sehpa üzerinde tek başına bir kompozisyon.' }
];

// ---------------------------------------------------------------------

async function main() {
  log(APPLY ? '>>> GERÇEK UYGULAMA MODU\n' : '>>> DENEME MODU (hiçbir şey yazılmayacak)\n');
  await db.connect();

  const urunler = (await db.query('select * from public.products order by sort_order')).rows;
  const kategoriler = (await db.query('select * from public.categories order by sort_order')).rows;
  const ayarlar = (await db.query('select * from public.settings')).rows;

  // ---------- Plan denetimi ----------
  const yuklenecek = new Map(); // depo yolu -> yerel dosya
  const ekle = (no, tur) => yuklenecek.set(yol(no, tur), manifest[String(no)].dosya);
  VITRINLER.forEach((v) => ekle(v.no, 'vitrin'));
  [...DEGISECEKLER, ...YENILER].forEach((u) => u.nolar.forEach((no) => ekle(no, 'urunler')));
  for (const d of yuklenecek.values()) if (!fs.existsSync(d)) throw new Error('Yerel dosya yok: ' + d);

  for (const d of DEGISECEKLER) {
    const u = urunler.find((x) => x.id === d.id);
    if (!u) throw new Error(`Değişecek ürün bulunamadı: ${d.id}`);
    if (u.title !== d.ad) throw new Error(`Ürün adı beklenenden farklı (${d.id}): "${u.title}"`);
  }
  for (const v of VITRINLER) if (!kategoriler.find((k) => k.id === v.id)) throw new Error('Kategori yok: ' + v.id);
  const mevcutIdler = new Set(urunler.map((u) => u.id));
  const eklenecek = YENILER.filter((y) => !mevcutIdler.has(y.id));
  const altKategoriler = Object.fromEntries(kategoriler.map((k) => [k.id, k.subcategories]));
  for (const y of YENILER) {
    if (!altKategoriler[y.category_id]?.includes(y.subcategory)) throw new Error(`Alt kategori yok: ${y.id} → ${y.subcategory}`);
  }

  log(`Yüklenecek dosya: ${yuklenecek.size}`);
  log(`Vitrini değişecek kategori: ${VITRINLER.map((v) => v.id).join(', ')}`);
  log(`Görseli değişecek ürün: ${DEGISECEKLER.length}`);
  DEGISECEKLER.forEach((d) => log(`  · ${d.ad}: ${urunler.find((x) => x.id === d.id).images.length} → ${d.nolar.length} fotoğraf`));
  log(`Eklenecek yeni ürün: ${eklenecek.length} (zaten var: ${YENILER.length - eklenecek.length})`);

  if (!APPLY) { log('\nDeneme bitti. Uygulamak için sonuna --apply ekleyin.'); return; }

  // ---------- 1. Yedek ----------
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  fs.mkdirSync('backups', { recursive: true });
  const yedek = path.join('backups', `yeni-gorseller-oncesi-${stamp}.json`);
  fs.writeFileSync(yedek, JSON.stringify({ urunler, kategoriler, ayarlar }, null, 2));
  const geriOkunan = JSON.parse(fs.readFileSync(yedek, 'utf8'));
  if (geriOkunan.urunler.length !== urunler.length) throw new Error('Yedek doğrulanamadı');
  log(`\nYedek: ${yedek} (${urunler.length} ürün, ${kategoriler.length} kategori)`);

  // ---------- 2. Yükle (geçici kural) ----------
  log('\nGeçici yükleme kuralı açılıyor...');
  await db.query(`drop policy if exists "${GECICI_KURAL}" on storage.objects`);
  await db.query(
    `create policy "${GECICI_KURAL}" on storage.objects for insert to anon
     with check (bucket_id = '${KLASOR}'
       and (storage.foldername(name))[1] in ('urunler','vitrin')
       and (storage.foldername(name))[2] = '${AY}')`
  );
  try {
    for (const [hedef, yerel] of yuklenecek) {
      const { error } = await supabase.storage.from(KLASOR).upload(hedef, fs.readFileSync(yerel), {
        contentType: 'image/jpeg', cacheControl: '31536000', upsert: false
      });
      if (error && !/exists|duplicate/i.test(error.message)) throw new Error(`Yüklenemedi (${hedef}): ${error.message}`);
      log(`  ✓ ${hedef}${error ? ' (zaten vardı)' : ''}`);
    }
  } finally {
    await db.query(`drop policy if exists "${GECICI_KURAL}" on storage.objects`);
    const kalan = (await db.query(
      `select count(*)::int n from pg_policies where schemaname = 'storage' and policyname = $1`, [GECICI_KURAL]
    )).rows[0].n;
    log(kalan === 0 ? '✓ Geçici kural kaldırıldı.' : '!!! GEÇİCİ KURAL KALDIRILAMADI — elle kaldırın');
  }

  // ---------- 3. Doğrula ----------
  log('\nYüklenen dosyalar adreslerinden indirilerek doğrulanıyor...');
  for (const [hedef, yerel] of yuklenecek) {
    const yanit = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${KLASOR}/${hedef}`);
    const bayt = Buffer.from(await yanit.arrayBuffer());
    if (!yanit.ok || !bayt.equals(fs.readFileSync(yerel))) {
      throw new Error(`Doğrulama başarısız: ${hedef} (HTTP ${yanit.status}, ${bayt.length} bayt)`);
    }
  }
  log(`✓ ${yuklenecek.size} dosyanın hepsi adresinden birebir aynı içerikle geliyor.`);

  // ---------- 4. Veritabanı (tek transaction) ----------
  log('\nVeritabanı güncelleniyor (tek transaction)...');
  await db.query('begin');
  try {
    for (const v of VITRINLER) {
      const s = await db.query('update public.categories set image = $1 where id = $2', [adres(v.no, 'vitrin'), v.id]);
      if (s.rowCount !== 1) throw new Error('Kategori güncellenemedi: ' + v.id);
      log(`  ✓ vitrin: ${v.id}`);
    }
    for (const d of DEGISECEKLER) {
      const gorseller = d.nolar.map((no) => adres(no));
      const s = await db.query('update public.products set image = $1, images = $2 where id = $3', [gorseller[0], gorseller, d.id]);
      if (s.rowCount !== 1) throw new Error('Ürün güncellenemedi: ' + d.id);
      log(`  ✓ görseller değişti: ${d.ad}`);
    }
    let sira = Math.max(...urunler.map((u) => u.sort_order)) + 1;
    for (const y of eklenecek) {
      const gorseller = y.nolar.map((no) => adres(no));
      await db.query(
        `insert into public.products
           (id, title, category_id, subcategory, price, image, images, story, condition, material, is_second_hand, status, sort_order)
         values ($1,$2,$3,$4,0,$5,$6,$7,$8,$9,false,'yayinda',$10)`,
        [y.id, y.title, y.category_id, y.subcategory, gorseller[0], gorseller, y.story, y.condition, y.material, sira++]
      );
      log(`  ✓ yeni ürün: ${y.title}`);
    }

    // Doğrulama
    const sonra = (await db.query('select id, title, price, image, images from public.products')).rows;
    if (sonra.length !== urunler.length + eklenecek.length) throw new Error('Ürün sayısı beklenenden farklı!');
    const dokunulan = new Set([...DEGISECEKLER.map((d) => d.id), ...eklenecek.map((y) => y.id)]);
    for (const eski of urunler) {
      const yeni = sonra.find((s) => s.id === eski.id);
      if (!yeni || yeni.title !== eski.title || String(yeni.price) !== String(eski.price)) throw new Error('Beklenmeyen değişiklik: ' + eski.id);
      if (!dokunulan.has(eski.id) && JSON.stringify(yeni.images) !== JSON.stringify(eski.images)) {
        throw new Error('Dokunulmaması gereken ürün değişti: ' + eski.id);
      }
    }
    await db.query('commit');
    log(`✓ Kalıcı olarak kaydedildi (COMMIT). Toplam ürün: ${sonra.length}`);
  } catch (e) {
    await db.query('rollback');
    log('✗ Hata — veritabanı değişiklikleri GERİ ALINDI (yüklenen dosyalar zararsız biçimde depoda kaldı).');
    throw e;
  }
}

main()
  .catch((e) => { console.error('\nHATA:', e.message); process.exitCode = 1; })
  .finally(() => db.end().catch(() => {}));
