/**
 * Didi Home · SQL çalıştırıcı
 *
 * Supabase panelini açmadan, doğrudan buradan SQL dosyası çalıştırmak için.
 *
 * Kullanım:
 *   node scripts/run-sql.mjs sql/01_schema.sql          → çalıştırır
 *   node scripts/run-sql.mjs sql/01_schema.sql --dry    → sadece dosyayı gösterir
 *   node scripts/run-sql.mjs --test                     → yalnızca bağlantıyı dener
 *
 * Gerekli: .env.local dosyasında SUPABASE_DB_URL satırı.
 * Bu değer Supabase panelinde şuradadır:
 *   Project Settings → Database → Connection string → "Session pooler" sekmesi
 *   (içindeki [YOUR-PASSWORD] yerine veritabanı şifreniz yazılır)
 *
 * NOT: .env.local dosyası git'e gönderilmez (.gitignore içinde).
 */

import fs from 'node:fs';
import pg from 'pg';

// ---------- .env.local / .env oku ----------
function ortamiYukle() {
  for (const dosya of ['.env.local', '.env']) {
    if (!fs.existsSync(dosya)) continue;
    for (const satir of fs.readFileSync(dosya, 'utf8').split(/\r?\n/)) {
      const m = satir.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
ortamiYukle();

const DB_URL = process.env.SUPABASE_DB_URL;
const dosyaYolu = process.argv.find((a) => a.endsWith('.sql'));
const sadeceTest = process.argv.includes('--test');
const dryRun = process.argv.includes('--dry');

if (!DB_URL) {
  console.error(`
Bağlantı bilgisi bulunamadı.

Yapılacak: proje klasöründe .env.local adında bir dosya oluşturun ve içine tek satır ekleyin:

  SUPABASE_DB_URL=postgresql://postgres.xxxxx:SIFRENIZ@aws-0-...pooler.supabase.com:5432/postgres

Bu satırı Supabase panelinde şurada bulursunuz:
  Project Settings → Database → Connection string → Session pooler
  (URI'deki [YOUR-PASSWORD] yerine veritabanı şifrenizi yazın)

Dosya git'e gönderilmez, bilgisayarınızda kalır.
`);
  process.exit(1);
}

if (!dosyaYolu && !sadeceTest) {
  console.error('Bir .sql dosyası belirtin. Örnek: node scripts/run-sql.mjs sql/01_schema.sql');
  process.exit(1);
}

const client = new pg.Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  const { rows: bilgi } = await client.query('select current_database() as db, version() as surum');
  console.log(`Bağlandı: ${bilgi[0].db} · ${bilgi[0].surum.split(',')[0]}`);

  if (sadeceTest) {
    const { rows: tablolar } = await client.query(
      `select table_name from information_schema.tables
        where table_schema = 'public' order by table_name`
    );
    console.log('Mevcut tablolar:', tablolar.map((t) => t.table_name).join(', ') || '(yok)');
    process.exit(0);
  }

  const sql = fs.readFileSync(dosyaYolu, 'utf8');
  console.log(`\nDosya: ${dosyaYolu} (${sql.split('\n').length} satır)`);

  if (dryRun) {
    console.log('\n--dry verildi, çalıştırılmadı.');
    process.exit(0);
  }

  console.log('Çalıştırılıyor...\n');
  const sonuc = await client.query(sql);
  const sonuclar = Array.isArray(sonuc) ? sonuc : [sonuc];
  for (const r of sonuclar) {
    if (r.rows?.length) console.table(r.rows);
  }
  console.log('\n✓ SQL başarıyla çalıştı.');
} catch (e) {
  console.error('\n✗ HATA:', e.message);
  if (e.message.includes('password') || e.message.includes('authentication')) {
    console.error('Bağlantı dizesindeki şifre hatalı olabilir.');
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
