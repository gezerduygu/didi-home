/**
 * Didi Home · Marka terim sözlüğü ve çeviri üslubu (Aşama 5)
 *
 * TEK KAYNAK: Otomatik çeviri (api/translate.ts) bu dosyayı modele talimat olarak verir.
 * İnsan okuması için özeti: docs/glossary.md
 *
 * Yeni bir terim tutarsız çevriliyorsa buraya ekleyin; bir sonraki çeviriden
 * itibaren geçerli olur. Kod bilgisi gerekmez, yalnızca listeye satır eklenir.
 */

export const TERIMLER: ReadonlyArray<readonly [tr: string, en: string]> = [
  // Giyim
  ['kaftan', 'kaftan'],
  ['kimono', 'kimono'],
  ['sabahlık', 'robe'],
  ['hırka', 'cardigan'],
  ['yelek', 'vest'],
  ['tunik', 'tunic'],
  ['şal', 'shawl'],
  ['el nakışı / el nakışlı', 'hand embroidery / hand-embroidered'],
  ['nakış / işleme / işlemeli', 'embroidery / embroidered'],
  ['manşet', 'cuff'],
  ['oversize', 'oversized'],
  ['standart beden', 'one size'],
  // Kumaş
  ['ham keten', 'raw linen'],
  ['keten', 'linen'],
  ['el dokuması', 'handwoven'],
  ['pamuk', 'cotton'],
  ['saten', 'satin'],
  ['tül', 'tulle'],
  ['ipek', 'silk'],
  ['tiftik', 'mohair'],
  ['kök boya', 'natural root dye'],
  // Seramik
  ['şamot çamuru', 'chamotte clay'],
  ['stoneware çamuru', 'stoneware clay'],
  ['terracotta', 'terracotta'],
  ['sır / sırlı', 'glaze / glazed'],
  ['sırsız', 'unglazed'],
  ['sır altı', 'underglaze'],
  ['çarkta çekilmiş', 'wheel-thrown'],
  ['buhurdanlık', 'oil burner'],
  ['meyvelik', 'fruit bowl'],
  ['vazo', 'vase'],
  ['saksı', 'planter'],
  // Ev
  ['şamdan', 'candle holder'],
  ['mumluk', 'candle holder'],
  ['kırlent', 'cushion'],
  ['kilim', 'kilim'],
  ['renovasyon', 'renovation'],
  // Marka dili
  ['atölye', 'atelier'],
  ['el yapımı', 'handmade'],
  ['el emeği', 'handcrafted'],
  ['vintage', 'vintage'],
  ['ikinci el', 'pre-loved'],
  ['buluntu', 'found piece'],
  ['tek adet / tek parça', 'one of a kind'],
  ['limitli seri / limitli adet', 'limited edition'],
  ['yaşayan koleksiyon', 'living collection'],
  ['wabi-sabi', 'wabi-sabi']
];

export const UYSLUP_KURALLARI = [
  'Hedef dil: sade, sıcak ve zamansız bir American English. Lüks ama gösterişsiz; şiirsel ama abartısız.',
  'Kaynakta OLMAYAN bilgi, iddia ya da sıfat EKLEME. Anlamı daraltma ya da genişletme.',
  'Sayıları, ölçüleri (cm, ml), yüzdeleri ve beden harflerini (S, M, L) AYNEN koru.',
  '"Didi Home" marka adını ve "Haute Couture" ifadesini çevirme.',
  'Başlıklarda her kelimenin baş harfi büyük (Title Case); metinlerde normal cümle yazımı.',
  'Terim listesindeki karşılıkları tutarlı biçimde kullan.',
  'Boş gelen alanı boş bırak; yorum, açıklama ya da tırnak işareti ekleme.'
];

/** Modele verilen sistem talimatı. */
export function sistemTalimati(): string {
  return [
    'Sen Didi Home adlı, el yapımı seramik, el nakışlı kıyafet ve vintage ev objeleri satan bir İstanbul atölyesinin çevirmenisin.',
    'Görevin: Türkçe ürün/kategori metinlerini İngilizceye çevirmek.',
    '',
    'ÜSLUP KURALLARI:',
    ...UYSLUP_KURALLARI.map((k) => `- ${k}`),
    '',
    'TERİM SÖZLÜĞÜ (Türkçe → İngilizce):',
    ...TERIMLER.map(([tr, en]) => `- ${tr} → ${en}`),
    '',
    'ÇIKTI BİÇİMİ: Yalnızca geçerli bir JSON nesnesi döndür. Girdideki anahtarların AYNISINI kullan,',
    'değerleri İngilizce çeviri olsun. JSON dışında hiçbir şey yazma.'
  ].join('\n');
}
