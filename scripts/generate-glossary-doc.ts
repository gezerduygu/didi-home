/**
 * docs/glossary.md dosyasını shared/ceviriSozlugu.ts'ten yeniden üretir.
 * Kullanım: npx tsx scripts/generate-glossary-doc.ts
 */
import fs from 'node:fs';
import { TERIMLER, UYSLUP_KURALLARI } from '../shared/ceviriSozlugu';

const satirlar = [
  '# Didi Home · Çeviri Sözlüğü ve Üslup Rehberi',
  '',
  '> Bu belge **otomatik üretilir**. Asıl kaynak: `shared/ceviriSozlugu.ts`.',
  '> Terim eklemek ya da değiştirmek için o dosyayı düzenleyin, sonra bu belgeyi yeniden üretin:',
  '> `npx tsx scripts/generate-glossary-doc.ts`',
  '',
  'Yönetim panelinde ürün ve kategori kaydedilirken İngilizce alanlar boşsa, metinler',
  'sunucudaki çeviri fonksiyonu (`api/translate.ts`) ile bu kurallara ve terimlere göre çevrilir.',
  '',
  '## Üslup kuralları',
  '',
  ...UYSLUP_KURALLARI.map((k) => `- ${k}`),
  '',
  '## Terimler',
  '',
  '| Türkçe | English |',
  '|---|---|',
  ...TERIMLER.map(([tr, en]) => `| ${tr} | ${en} |`),
  ''
];

fs.writeFileSync('docs/glossary.md', satirlar.join('\n'));
console.log(`docs/glossary.md yazıldı (${TERIMLER.length} terim)`);
