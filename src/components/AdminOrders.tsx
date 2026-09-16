import React, { useCallback, useEffect, useState } from 'react';
import { ShoppingBag, RefreshCw, Loader2, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { listOrders, updateOrderStatus, StoreError } from '../store';

/**
 * Yönetim paneli · Siparişler sekmesi (Aşama 4)
 *
 * Sipariş akışında WhatsApp asıl kanaldır; bu ekran kayıt tutma ve takip içindir.
 * Müşterinin WhatsApp mesajındaki "DH-..." numarası buradaki kayıtla eşleşir.
 */

interface AdminOrdersProps {
  language: 'tr' | 'en';
  /** Yeni (henüz ilgilenilmemiş) sipariş sayısı değişince sekme rozetini günceller */
  onYeniSayisi?: (adet: number) => void;
}

const DURUMLAR: { deger: OrderStatus; tr: string; en: string; sinif: string }[] = [
  { deger: 'yeni', tr: 'Yeni', en: 'New', sinif: 'bg-brand-terracotta text-white' },
  { deger: 'goruldu', tr: 'Görüldü', en: 'Seen', sinif: 'bg-brand-sand text-brand-charcoal' },
  { deger: 'hazirlaniyor', tr: 'Hazırlanıyor', en: 'Preparing', sinif: 'bg-brand-charcoal/80 text-brand-beige' },
  { deger: 'kargolandi', tr: 'Kargolandı', en: 'Shipped', sinif: 'bg-emerald-700 text-white' },
  { deger: 'iptal', tr: 'İptal', en: 'Cancelled', sinif: 'bg-brand-warmgray/30 text-brand-warmgray line-through' }
];

/** Türkiye telefon numarasını WhatsApp adresine çevirir (0555..., 555..., +90555...). */
function musteriWhatsappAdresi(telefon: string | null): string | null {
  if (!telefon) return null;
  let rakam = telefon.replace(/\D/g, '');
  if (rakam.startsWith('00')) rakam = rakam.slice(2);
  if (rakam.startsWith('0')) rakam = '90' + rakam.slice(1);
  if (rakam.length === 10 && rakam.startsWith('5')) rakam = '90' + rakam;
  return rakam.length >= 11 ? `https://wa.me/${rakam}` : null;
}

export default function AdminOrders({ language, onYeniSayisi }: AdminOrdersProps) {
  const tr = language === 'tr';
  const [siparisler, setSiparisler] = useState<Order[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [filtre, setFiltre] = useState<OrderStatus | 'hepsi'>('hepsi');
  const [guncellenenId, setGuncellenenId] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata('');
    try {
      setSiparisler(await listOrders());
    } catch (e) {
      setHata(e instanceof StoreError ? e.message : String(e));
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    yukle();
  }, [yukle]);

  useEffect(() => {
    onYeniSayisi?.(siparisler.filter((s) => s.status === 'yeni').length);
  }, [siparisler, onYeniSayisi]);

  const durumDegistir = async (siparis: Order, yeniDurum: OrderStatus) => {
    const onceki = siparis.status;
    setGuncellenenId(siparis.id);
    setSiparisler((liste) => liste.map((s) => (s.id === siparis.id ? { ...s, status: yeniDurum } : s)));
    try {
      await updateOrderStatus(siparis.id, yeniDurum);
    } catch (e) {
      // Kayıt başarısızsa ekrandaki durum geri alınır
      setSiparisler((liste) => liste.map((s) => (s.id === siparis.id ? { ...s, status: onceki } : s)));
      alert(e instanceof StoreError ? e.message : tr ? 'Durum güncellenemedi.' : 'Could not update status.');
    } finally {
      setGuncellenenId(null);
    }
  };

  const tl = (n: number) => `${n.toLocaleString(tr ? 'tr-TR' : 'en-US')} TL`;
  const gorunen = filtre === 'hepsi' ? siparisler : siparisler.filter((s) => s.status === filtre);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-brand-sand/15 border border-brand-sand/40 p-6 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-terracotta text-[10px] font-sans tracking-[0.25em] uppercase font-bold mb-1">
            <ShoppingBag size={13} />
            <span>{tr ? 'SİPARİŞLER' : 'ORDERS'}</span>
          </div>
          <h2 className="font-serif text-2xl font-light text-brand-charcoal">
            {tr ? 'Gelen Siparişler' : 'Incoming Orders'}
          </h2>
          <p className="text-xs text-brand-warmgray mt-1 max-w-2xl font-light">
            {tr
              ? 'Müşteri sipariş verdiğinde size WhatsApp mesajı gelir ve sipariş burada da kaydedilir. Mesajdaki "DH-..." numarası buradaki kayıtla aynıdır.'
              : 'When a customer orders, you receive a WhatsApp message and the order is also saved here. The "DH-..." number in the message matches the record.'}
          </p>
        </div>
        <button
          onClick={yukle}
          disabled={yukleniyor}
          className="py-2.5 px-4 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs tracking-widest uppercase transition-colors rounded-[2px] flex items-center gap-2 font-medium shrink-0 bg-brand-beige disabled:opacity-50"
        >
          <RefreshCw size={13} className={yukleniyor ? 'animate-spin' : ''} />
          <span>{tr ? 'YENİLE' : 'REFRESH'}</span>
        </button>
      </div>

      {/* Durum filtresi */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[{ deger: 'hepsi' as const, tr: 'Tümü', en: 'All' }, ...DURUMLAR].map((d) => {
          const adet = d.deger === 'hepsi' ? siparisler.length : siparisler.filter((s) => s.status === d.deger).length;
          return (
            <button
              key={d.deger}
              onClick={() => setFiltre(d.deger)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wider transition-all whitespace-nowrap ${
                filtre === d.deger
                  ? 'bg-brand-charcoal text-brand-beige font-semibold'
                  : 'bg-brand-sand/40 hover:bg-brand-sand/80 text-brand-charcoal/80'
              }`}
            >
              {tr ? d.tr : d.en} <span className="text-[10px] opacity-75">({adet})</span>
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {yukleniyor && siparisler.length === 0 ? (
        <div className="py-16 flex items-center justify-center gap-2 text-xs text-brand-warmgray">
          <Loader2 size={16} className="animate-spin text-brand-terracotta" />
          {tr ? 'Yükleniyor...' : 'Loading...'}
        </div>
      ) : hata ? (
        <p className="text-center py-16 text-sm text-brand-terracotta">{hata}</p>
      ) : gorunen.length === 0 ? (
        <p className="text-center py-16 text-sm text-brand-warmgray/80 italic border border-dashed border-brand-sand/50 rounded-sm">
          {siparisler.length === 0
            ? tr ? 'Henüz sipariş yok.' : 'No orders yet.'
            : tr ? 'Bu durumda sipariş yok.' : 'No orders with this status.'}
        </p>
      ) : (
        <div className="space-y-4">
          {gorunen.map((s) => {
            const durum = DURUMLAR.find((d) => d.deger === s.status) ?? DURUMLAR[0];
            const whatsapp = musteriWhatsappAdresi(s.phone);
            return (
              <div key={s.id} className="bg-brand-beige border border-brand-sand/50 rounded-sm p-5 shadow-sm">
                {/* Üst satır */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-brand-sand/40">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] font-sans tracking-widest uppercase px-2 py-0.5 rounded-[1px] font-semibold ${durum.sinif}`}>
                      {tr ? durum.tr : durum.en}
                    </span>
                    <span className="font-mono text-xs text-brand-charcoal font-semibold">{s.siparisNo || '—'}</span>
                    <span className="text-[11px] text-brand-warmgray">
                      {new Date(s.createdAt).toLocaleString(tr ? 'tr-TR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {guncellenenId === s.id && <Loader2 size={13} className="animate-spin text-brand-terracotta" />}
                    <select
                      value={s.status}
                      onChange={(e) => durumDegistir(s, e.target.value as OrderStatus)}
                      className="bg-brand-beige border border-brand-sand/70 focus:border-brand-charcoal px-2.5 py-1.5 rounded-[2px] text-xs text-brand-charcoal outline-none cursor-pointer"
                      aria-label={tr ? 'Sipariş durumu' : 'Order status'}
                    >
                      {DURUMLAR.map((d) => (
                        <option key={d.deger} value={d.deger}>
                          {tr ? d.tr : d.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-xs">
                  {/* Müşteri */}
                  <div className="space-y-1.5">
                    <div className="font-serif text-base text-brand-charcoal">{s.customerName}</div>
                    {s.phone && (
                      <div className="flex items-center gap-2 text-brand-warmgray flex-wrap">
                        <Phone size={12} className="text-brand-terracotta shrink-0" />
                        <a href={`tel:${s.phone}`} className="hover:text-brand-charcoal">{s.phone}</a>
                        {whatsapp && (
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] tracking-widest uppercase text-emerald-800 hover:underline"
                          >
                            <MessageCircle size={11} />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                    {s.email && (
                      <div className="flex items-center gap-2 text-brand-warmgray">
                        <Mail size={12} className="text-brand-terracotta shrink-0" />
                        <a href={`mailto:${s.email}`} className="hover:text-brand-charcoal break-all">{s.email}</a>
                      </div>
                    )}
                    {(s.city || s.address) && (
                      <div className="flex items-start gap-2 text-brand-warmgray">
                        <MapPin size={12} className="text-brand-terracotta shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          {s.address}
                          {s.address && s.city ? ' · ' : ''}
                          <strong className="text-brand-charcoal font-medium">{s.city}</strong>
                        </span>
                      </div>
                    )}
                    {s.note && <div className="text-brand-warmgray italic pt-1">“{s.note}”</div>}
                  </div>

                  {/* Ürünler ve tutar */}
                  <div className="bg-brand-sand/15 border border-brand-sand/40 rounded-[2px] p-3 space-y-1.5">
                    {s.items.map((u, i) => (
                      <div key={`${u.id}-${i}`} className="flex justify-between gap-3">
                        <span className="text-brand-charcoal">
                          {u.title} <span className="text-brand-warmgray">× {u.quantity}</span>
                        </span>
                        <span className="text-brand-charcoal whitespace-nowrap">{tl(u.price * u.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-brand-sand/50 pt-1.5 mt-1.5 space-y-1 text-brand-warmgray">
                      <div className="flex justify-between">
                        <span>{tr ? 'Kargo' : 'Shipping'}</span>
                        <span>{s.shipping === 0 ? (tr ? 'Ücretsiz' : 'Free') : tl(s.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-brand-charcoal font-semibold">
                        <span>{tr ? 'Toplam' : 'Total'}</span>
                        <span>{tl(s.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
