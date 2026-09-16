/**
 * Didi Home · Otomatik İngilizce çeviri (Aşama 5)
 *
 * POST /api/translate
 *   Başlık:  Authorization: Bearer <yöneticinin Supabase oturum anahtarı>
 *   Gövde:   { "alanlar": { "title": "...", "story": "...", ... } }   (Türkçe)
 *   Yanıt:   { "ceviri":  { "title": "...", "story": "...", ... } }   (İngilizce)
 *
 * Güvenlik:
 *   - OPENROUTER_API_KEY yalnızca burada (sunucuda) okunur; tarayıcıya gitmez.
 *   - Yalnızca giriş yapmış YÖNETİCİ çağırabilir; oturum anahtarı Supabase'e sorulup
 *     e-posta yönetici listesiyle karşılaştırılır. Böylece başkası kredinizi harcayamaz.
 *   - Tek istekte en fazla 12 alan ve 12.000 karakter.
 *
 * Ortam değişkenleri (Vercel → Settings → Environment Variables):
 *   OPENROUTER_API_KEY   (zorunlu, gizli)
 *   OPENROUTER_MODEL     (isteğe bağlı; openrouter.ai/models sayfasındaki model kimliği)
 */

import { sistemTalimati } from '../shared/ceviriSozlugu';
import { yoneticiEpostasiMi } from '../shared/yoneticiler';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qamtitryhoffjbdxvgar.supabase.co';
const ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXRpdHJ5aG9mZmpiZHh2Z2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODI4ODUsImV4cCI6MjEwMjQ1ODg4NX0._iLwxCXM7Esh_OpGY35ONxEf7rDUJu85KqacVhMN8Mc';

const VARSAYILAN_MODEL = 'anthropic/claude-sonnet-4';
const EN_FAZLA_ALAN = 12;
const EN_FAZLA_KARAKTER = 12_000;

const hata = (durum: number, mesaj: string) =>
  Response.json({ hata: mesaj }, { status: durum, headers: { 'Cache-Control': 'no-store' } });

/** Model bazen JSON'u açıklama ya da ``` içine alır; ilk geçerli nesneyi çıkarır. */
function jsonCikar(metin: string): Record<string, unknown> | null {
  const bas = metin.indexOf('{');
  const son = metin.lastIndexOf('}');
  if (bas === -1 || son <= bas) return null;
  try {
    const nesne = JSON.parse(metin.slice(bas, son + 1));
    return nesne && typeof nesne === 'object' && !Array.isArray(nesne) ? nesne : null;
  } catch {
    return null;
  }
}

export async function POST(istek: Request): Promise<Response> {
  // ---------- 1. Anahtar tanımlı mı? ----------
  const anahtar = process.env.OPENROUTER_API_KEY;
  if (!anahtar) {
    return hata(503, 'Çeviri henüz etkin değil: OPENROUTER_API_KEY tanımlanmamış.');
  }

  // ---------- 2. Çağıran yönetici mi? ----------
  const oturumAnahtari = istek.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!oturumAnahtari) return hata(401, 'Giriş yapılmamış.');

  const kullaniciYaniti = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${oturumAnahtari}` }
  });
  if (!kullaniciYaniti.ok) return hata(401, 'Oturum geçersiz ya da süresi dolmuş. Yeniden giriş yapın.');
  const kullanici = (await kullaniciYaniti.json()) as { email?: string };
  if (!yoneticiEpostasiMi(kullanici.email)) return hata(403, 'Bu işlem yalnızca yönetici içindir.');

  // ---------- 3. Girdi kontrolü ----------
  let govde: { alanlar?: Record<string, unknown> };
  try {
    govde = await istek.json();
  } catch {
    return hata(400, 'Geçersiz istek gövdesi.');
  }
  const alanlar = Object.fromEntries(
    Object.entries(govde.alanlar ?? {}).filter(([, d]) => typeof d === 'string' && d.trim() !== '')
  ) as Record<string, string>;

  if (Object.keys(alanlar).length === 0) return Response.json({ ceviri: {} });
  if (Object.keys(alanlar).length > EN_FAZLA_ALAN) return hata(400, 'Çok fazla alan.');
  if (JSON.stringify(alanlar).length > EN_FAZLA_KARAKTER) return hata(400, 'Metin çok uzun.');

  // ---------- 4. OpenRouter ----------
  const model = process.env.OPENROUTER_MODEL || VARSAYILAN_MODEL;
  let yanit: Response;
  try {
    yanit = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anahtar}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://didihome.store',
        'X-Title': 'Didi Home'
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: sistemTalimati() },
          { role: 'user', content: JSON.stringify(alanlar, null, 2) }
        ]
      }),
      signal: AbortSignal.timeout(45_000)
    });
  } catch (e) {
    return hata(504, 'Çeviri servisine ulaşılamadı: ' + (e instanceof Error ? e.message : String(e)));
  }

  if (!yanit.ok) {
    const ayrinti = (await yanit.text()).slice(0, 300);
    return hata(502, `Çeviri servisi hata verdi (HTTP ${yanit.status}, model: ${model}). ${ayrinti}`);
  }

  const veri = (await yanit.json()) as { choices?: { message?: { content?: string } }[] };
  const icerik = veri.choices?.[0]?.message?.content ?? '';
  const ceviri = jsonCikar(icerik);
  if (!ceviri) return hata(502, 'Çeviri servisi beklenen biçimde yanıt vermedi.');

  // Yalnızca istenen anahtarlar, yalnızca metin değerler geri döner
  const temiz = Object.fromEntries(
    Object.keys(alanlar)
      .filter((a) => typeof ceviri[a] === 'string')
      .map((a) => [a, (ceviri[a] as string).trim()])
  );

  return Response.json({ ceviri: temiz, model }, { headers: { 'Cache-Control': 'no-store' } });
}
