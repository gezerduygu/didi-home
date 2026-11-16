/**
 * Didi Home · Açılıp kapatılabilen özellikler
 *
 * SIPARIS_AKTIF = false iken ziyaretçi tarafındaki sipariş akışı GÖRÜNMEZ:
 *   · Üst menüdeki "Sepet" düğmesi
 *   · Ürün penceresindeki "Sepete Ekle" düğmesi ve kargo notu
 *   · Sepet / sipariş formu çekmecesi
 *   · Ürün kartlarındaki ve ürün penceresindeki fiyat, fiyata göre sıralama
 *
 * Bu haliyle site bir portfolyo / vitrin gibi çalışır (2026-11-16 kararı).
 *
 * Hiçbir kod silinmedi; sipariş altyapısı (src/orders.ts, CartDrawer, orders
 * tablosu, paneldeki Siparişler sekmesi) yerinde durur.
 * Yeniden açmak için bu değeri `true` yapıp yayınlamak yeterlidir.
 */
export const SIPARIS_AKTIF: boolean = false;
