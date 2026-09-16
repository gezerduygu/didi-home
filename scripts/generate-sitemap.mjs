/**
 * Didi Home · Site haritası üretici (Aşama 6)
 *
 * Her "npm run build" öncesinde (prebuild) otomatik çalışır; Vercel'de de.
 * Yayındaki kategori ve ürünleri herkese açık API'den okuyup public/sitemap.xml yazar.
 *
 * Ağ hatası olursa DERLEMEYİ DURDURMAZ: mevcut sitemap.xml olduğu gibi kalır.
 */

import fs from 'node:fs';

const SITE = (process.env.VITE_SITE_URL || 'https://didihome.store').replace(/\/$/, '');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qamtitryhoffjbdxvgar.supabase.co';
const ANON =
  process.env.VITE_SUPABASE_ANON_KEY ||
  (fs.readFileSync('src/supabase.ts', 'utf8').match(/eyJ[A-Za-z0-9._-]+/) || [])[0];
const HEDEF = 'public/sitemap.xml';

const xmlKacis = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const gun = (tarih) => (tarih ? new Date(tarih).toISOString().slice(0, 10) : undefined);

async function oku(yol) {
  const yanit = await fetch(`${SUPABASE_URL}/rest/v1/${yol}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    signal: AbortSignal.timeout(15000)
  });
  if (!yanit.ok) throw new Error(`${yol} → HTTP ${yanit.status}`);
  return yanit.json();
}

try {
  const [kategoriler, urunler] = await Promise.all([
    oku('categories?select=id,updated_at&deleted_at=is.null&order=sort_order'),
    oku('products?select=id,category_id,updated_at&deleted_at=is.null&status=in.(yayinda,satildi)&order=sort_order')
  ]);

  const adresler = [
    { loc: `${SITE}/`, oncelik: '1.0' },
    ...kategoriler.map((k) => ({ loc: `${SITE}/category/${k.id}`, lastmod: gun(k.updated_at), oncelik: '0.8' })),
    ...urunler.map((u) => ({
      loc: `${SITE}/category/${u.category_id}?product=${encodeURIComponent(u.id)}`,
      lastmod: gun(u.updated_at),
      oncelik: '0.6'
    }))
  ];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    adresler
      .map(
        (a) =>
          `  <url>\n    <loc>${xmlKacis(a.loc)}</loc>\n` +
          (a.lastmod ? `    <lastmod>${a.lastmod}</lastmod>\n` : '') +
          `    <priority>${a.oncelik}</priority>\n  </url>`
      )
      .join('\n') +
    '\n</urlset>\n';

  fs.writeFileSync(HEDEF, xml);
  console.log(`[sitemap] ${adresler.length} adres yazıldı (${kategoriler.length} kategori, ${urunler.length} ürün).`);
} catch (e) {
  console.warn(`[sitemap] Üretilemedi, mevcut dosya korunuyor: ${e.message}`);
  if (!fs.existsSync(HEDEF)) {
    fs.writeFileSync(
      HEDEF,
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc></url>\n</urlset>\n`
    );
  }
}
