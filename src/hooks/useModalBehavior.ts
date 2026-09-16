import { useEffect, useRef } from 'react';

/**
 * Açılır pencerelerin (ürün detayı, sepet, hikâyemiz) ortak davranışı:
 *
 *  · Açıkken arka plandaki sayfa kaymaz (özellikle telefonda önemli).
 *  · ESC tuşu yalnızca EN ÜSTTEKİ pencereyi kapatır. Ürün detayı açıkken sepet
 *    açılırsa, ESC önce sepeti kapatır; ürün detayı yerinde kalır.
 *
 * NOT: Yönetim panelindeki ürün/kategori formlarında BİLEREK kullanılmaz.
 * Yanlışlıkla basılan ESC, yarım doldurulmuş formu kapatıp girilen bilgileri
 * kaybettirebilir (bkz. PROJECT.md → Altın kurallar).
 */

const yigin: Array<{ current: () => void }> = [];
let dinleyiciKuruldu = false;
let kilitSayisi = 0;

function tusDinleyicisiniKur() {
  if (dinleyiciKuruldu || typeof window === 'undefined') return;
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && yigin.length > 0) {
      e.preventDefault();
      yigin[yigin.length - 1].current();
    }
  });
  dinleyiciKuruldu = true;
}

export function useModalBehavior(onClose: () => void, enabled = true) {
  // Kapatma fonksiyonu her render'da değişebilir; ref ile güncel tutulur,
  // böylece efekt yalnızca pencere açılıp kapanırken çalışır.
  const kapatRef = useRef(onClose);
  kapatRef.current = onClose;

  useEffect(() => {
    if (!enabled) return;

    tusDinleyicisiniKur();
    yigin.push(kapatRef);

    if (kilitSayisi++ === 0) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      const i = yigin.lastIndexOf(kapatRef);
      if (i !== -1) yigin.splice(i, 1);

      kilitSayisi = Math.max(0, kilitSayisi - 1);
      if (kilitSayisi === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [enabled]);
}
