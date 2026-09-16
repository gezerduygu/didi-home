/**
 * Didi Home · Supabase uyku önleyici (Aşama 6)
 *
 * Supabase'in ücretsiz paketinde 7 gün hiç istek almayan projeler uyutulur;
 * uyuyan projede site ürünleri gösteremez. Vercel bu fonksiyonu vercel.json'daki
 * "crons" ayarıyla 3 günde bir çağırır ve veritabanına küçük bir okuma yapar.
 *
 * Adres: /api/keepalive  (herkese açık, zararsız: yalnızca 1 kategori kodu okur)
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qamtitryhoffjbdxvgar.supabase.co';
const ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXRpdHJ5aG9mZmpiZHh2Z2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODI4ODUsImV4cCI6MjEwMjQ1ODg4NX0._iLwxCXM7Esh_OpGY35ONxEf7rDUJu85KqacVhMN8Mc';

export async function GET(): Promise<Response> {
  const baslangic = Date.now();
  try {
    const yanit = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=id&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` }
    });
    return Response.json(
      { tamam: yanit.ok, durum: yanit.status, sure_ms: Date.now() - baslangic, zaman: new Date().toISOString() },
      { status: yanit.ok ? 200 : 502, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    return Response.json(
      { tamam: false, hata: e instanceof Error ? e.message : String(e) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
