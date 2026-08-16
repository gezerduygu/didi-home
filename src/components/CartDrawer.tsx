import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag, Check } from 'lucide-react';
import { CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: CartDrawerProps) {
  const { t, translateProduct, language } = useLanguage();
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'success'>('cart');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: ''
  });

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 3000;
  const shippingCost = isFreeShipping ? 0 : 95;
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address) {
      return;
    }
    setCheckoutStep('success');
  };

  const handleOrderSuccessClose = () => {
    onClearCart();
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          id="cart-drawer-container"
          className="w-screen max-w-md bg-brand-beige border-l border-brand-sand/50 shadow-2xl flex flex-col justify-between"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-brand-sand/50 flex items-center justify-between">
            <h2 className="font-serif text-base sm:text-lg font-light text-brand-charcoal tracking-widest flex items-center gap-2">
              <ShoppingBag size={18} className="text-brand-warmgray" />
              {checkoutStep === 'cart' && (language === 'tr' ? 'SEPETİNİZ' : 'YOUR CART')}
              {checkoutStep === 'shipping' && (language === 'tr' ? 'TESLİMAT BİLGİLERİ' : 'SHIPPING DETAILS')}
              {checkoutStep === 'success' && (language === 'tr' ? 'SİPARİŞ ONAYI' : 'ORDER CONFIRMED')}
            </h2>
            <button
              id="close-cart-drawer"
              onClick={onClose}
              className="p-2 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-sand/40 rounded-full transition-colors duration-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: CART LIST */}
              {checkoutStep === 'cart' && (
                <motion.div
                  key="cart-step"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col h-full justify-between"
                >
                  {cartItems.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center">
                      <ShoppingBag size={48} className="text-brand-warmgray/30 mb-4 stroke-1" />
                      <p className="font-serif text-lg text-brand-warmgray italic mb-2">{t('cart.empty')}</p>
                      <p className="text-xs text-brand-warmgray/70 leading-relaxed max-w-xs">
                        {language === 'tr' 
                          ? 'Didi Home koleksiyonlarından beğendiğiniz eşsiz parçaları sepetinize ekleyerek başlayın.' 
                          : 'Start by adding unique pieces you love from the Didi Home collections to your cart.'}
                      </p>
                      <button
                        id="btn-start-shopping"
                        onClick={onClose}
                        className="mt-6 px-6 py-2.5 bg-brand-charcoal text-brand-beige text-xs font-sans tracking-widest uppercase hover:bg-brand-charcoal/90 transition-colors duration-300 rounded-[2px]"
                      >
                        {language === 'tr' ? 'ALIŞVERİŞE BAŞLA' : 'START SHOPPING'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Shipping Progress bar */}
                      <div className="bg-brand-sand/30 p-3 rounded-[2px] border border-brand-sand/40 text-xs font-sans text-brand-warmgray">
                        {isFreeShipping ? (
                          <span className="text-brand-terracotta flex items-center gap-1">
                            <Check size={14} />{' '}
                            {language === 'tr' 
                              ? 'Tebrikler! Ücretsiz kargo limitine ulaştınız.' 
                              : 'Congratulations! You have reached the free shipping threshold.'}
                          </span>
                        ) : (
                          <span>
                            {language === 'tr' ? (
                              <>
                                Kargo Ücretsiz için <strong className="text-brand-charcoal">{(3000 - subtotal).toLocaleString('tr-TR')} TL</strong> değerinde daha ürün ekleyin.
                              </>
                            ) : (
                              <>
                                Add <strong className="text-brand-charcoal">{(3000 - subtotal).toLocaleString('en-US')} {t('cart.currency')}</strong> more for free shipping.
                              </>
                            )}
                          </span>
                        )}
                        <div className="w-full bg-brand-sand h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-brand-terracotta h-full transition-all duration-500"
                            style={{ width: `${Math.min((subtotal / 3000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Items list */}
                      <div className="space-y-4">
                        {cartItems.map((item) => {
                          const translatedProd = translateProduct(item.product);
                          return (
                            <div
                              key={item.product.id}
                              className="flex gap-4 border-b border-brand-sand/30 pb-4"
                            >
                              <img
                                src={translatedProd.image}
                                alt={translatedProd.title}
                                referrerPolicy="no-referrer"
                                className="w-16 h-20 object-cover object-center rounded-[1px] bg-brand-sand/50 shadow-sm border border-brand-sand/25"
                              />
                              <div className="flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-serif text-sm text-brand-charcoal leading-snug line-clamp-1">
                                      {translatedProd.title}
                                    </h4>
                                    <button
                                      id={`remove-${item.product.id}`}
                                      onClick={() => onRemoveItem(item.product.id)}
                                      className="text-brand-warmgray hover:text-red-800 transition-colors duration-200"
                                      aria-label={t('cart.remove')}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                  <span className="text-[10px] font-sans text-brand-warmgray tracking-widest uppercase">
                                    {translatedProd.condition}
                                  </span>
                                </div>

                                <div className="flex justify-between items-end">
                                  {/* Quantity adjustments */}
                                  <div className="flex items-center border border-brand-sand bg-brand-beige rounded-[2px] overflow-hidden text-xs">
                                    <button
                                      id={`dec-${item.product.id}`}
                                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                      className="p-1 px-2 text-brand-warmgray hover:text-brand-charcoal hover:bg-brand-sand/20 transition-all"
                                    >
                                      <Minus size={10} />
                                    </button>
                                    <span className="px-2 text-brand-charcoal font-sans font-medium">{item.quantity}</span>
                                    <button
                                      id={`inc-${item.product.id}`}
                                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                      className="p-1 px-2 text-brand-warmgray hover:text-brand-charcoal hover:bg-brand-sand/20 transition-all"
                                    >
                                      <Plus size={10} />
                                    </button>
                                  </div>

                                  {/* Price */}
                                  <span className="text-xs font-sans font-medium text-brand-charcoal">
                                    {(item.product.price * item.quantity).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}{' '}
                                    {t('cart.currency')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: SHIPPING DETAILS */}
              {checkoutStep === 'shipping' && (
                <motion.form
                  key="shipping-step"
                  onSubmit={handleCheckoutSubmit}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-brand-warmgray leading-relaxed mb-4">
                    {language === 'tr' 
                      ? 'Siparişinizin size ulaşması için lütfen teslimat bilgilerinizi doldurun. Ödeme kapıda nakit/kart veya havale ile yapılabilmektedir.' 
                      : 'Please enter your delivery details to receive your order. Payment can be made via cash/card on delivery or bank transfer.'}
                  </p>

                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                        {language === 'tr' ? 'AD SOYAD *' : 'FULL NAME *'}
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={shippingInfo.name}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border border-brand-sand/80 focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all duration-200"
                        placeholder={language === 'tr' ? 'Örn: Serhat Kabais' : 'e.g. John Doe'}
                      />
                    </div>

                    <div>
                      <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                        {language === 'tr' ? 'E-POSTA ADRESİ *' : 'EMAIL ADDRESS *'}
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border border-brand-sand/80 focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all duration-200"
                        placeholder="e.g. email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                        {language === 'tr' ? 'TELEFON NUMARASI *' : 'PHONE NUMBER *'}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border border-brand-sand/80 focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all duration-200"
                        placeholder="e.g. +90 555 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                        {language === 'tr' ? 'ŞEHİR *' : 'CITY *'}
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={shippingInfo.city}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border border-brand-sand/80 focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all duration-200"
                        placeholder={language === 'tr' ? 'Örn: İstanbul' : 'e.g. Istanbul'}
                      />
                    </div>

                    <div>
                      <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                        {language === 'tr' ? 'AÇIK ADRES *' : 'DELIVERY ADDRESS *'}
                      </label>
                      <textarea
                        name="address"
                        rows={3}
                        required
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border border-brand-sand/80 focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none resize-none transition-all duration-200"
                        placeholder={language === 'tr' ? 'Sokak, mahalle, dış kapı no...' : 'Street, district, block, apartment details...'}
                      />
                    </div>
                  </div>

                  {/* Order Summary inside Shipping page */}
                  <div className="bg-brand-sand/25 border border-brand-sand/50 p-4 rounded-[2px] mt-6 text-xs font-sans space-y-2 text-brand-warmgray">
                    <div className="flex justify-between">
                      <span>{language === 'tr' ? 'Ara Toplam:' : 'Subtotal:'}</span>
                      <span className="text-brand-charcoal font-medium">
                        {subtotal.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'tr' ? 'Kargo:' : 'Shipping:'}</span>
                      <span className="text-brand-charcoal font-medium">
                        {isFreeShipping 
                          ? (language === 'tr' ? 'Ücretsiz' : 'Free') 
                          : `${shippingCost.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} ${t('cart.currency')}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-brand-sand/50 pt-2 text-sm text-brand-charcoal font-semibold">
                      <span>{language === 'tr' ? 'Toplam Tutar:' : 'Total Amount:'}</span>
                      <span>
                        {total.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('cart')}
                      className="flex-1 py-3 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs font-sans tracking-widest uppercase transition-colors rounded-[2px]"
                    >
                      {language === 'tr' ? 'GERİ DÖN' : 'BACK'}
                    </button>
                    <button
                      type="submit"
                      id="btn-submit-order"
                      className="flex-1 py-3 bg-brand-charcoal hover:bg-brand-charcoal/95 text-brand-beige text-xs font-sans tracking-widest uppercase transition-colors rounded-[2px]"
                    >
                      {language === 'tr' ? 'SİPARİŞİ VER' : 'PLACE ORDER'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: ORDER SUCCESS */}
              {checkoutStep === 'success' && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10 flex flex-col items-center"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 mb-6">
                    <Check size={32} />
                  </div>
                  <h3 className="font-serif text-2xl font-light text-brand-charcoal tracking-wide mb-3">
                    {t('cart.success_title')}
                  </h3>
                  <p className="text-xs text-brand-warmgray/90 leading-relaxed max-w-sm mb-6">
                    {language === 'tr' ? (
                      <span>
                        Sevgili <strong className="text-brand-charcoal">{shippingInfo.name}</strong>, Didi Home'u tercih ettiğiniz için teşekkür ederiz. Sipariş özetiniz ve kargo takip kodunuz <strong className="text-brand-charcoal">{shippingInfo.email}</strong> adresine gönderilecektir.
                      </span>
                    ) : (
                      <span>
                        Dear <strong className="text-brand-charcoal">{shippingInfo.name}</strong>, thank you for choosing Didi Home. Your order summary and shipment details will be sent to <strong className="text-brand-charcoal">{shippingInfo.email}</strong> shortly.
                      </span>
                    )}
                  </p>

                  <div className="w-full bg-brand-sand/20 border border-brand-sand/40 p-4 rounded-[2px] text-xs font-sans text-left space-y-2 text-brand-warmgray mb-8">
                    <h4 className="text-[10px] tracking-widest text-brand-charcoal font-semibold uppercase border-b border-brand-sand/40 pb-1.5 mb-2">
                      {language === 'tr' ? 'TESLİMAT ADRESİ' : 'DELIVERY ADDRESS'}
                    </h4>
                    <p className="text-brand-charcoal font-medium">{shippingInfo.name}</p>
                    <p className="leading-normal">{shippingInfo.address}</p>
                    <p>{shippingInfo.city}</p>
                    
                    <p className="pt-2 text-[10px] tracking-widest text-brand-charcoal font-semibold uppercase border-b border-brand-sand/40 pb-1.5 mb-2">
                      {language === 'tr' ? 'SİPARİŞ DETAYI' : 'ORDER DETAILS'}
                    </p>
                    <p className="flex justify-between text-brand-charcoal font-medium pt-1">
                      <span>{language === 'tr' ? 'Ödenecek Tutar:' : 'Amount to Pay:'}</span>
                      <span>
                        {total.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                      </span>
                    </p>
                  </div>

                  <button
                    id="btn-order-success-close"
                    type="button"
                    onClick={handleOrderSuccessClose}
                    className="w-full py-4 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs font-sans tracking-widest uppercase transition-colors rounded-[2px]"
                  >
                    {t('cart.success_continue')}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer Total Summary (Only visible during Step 1) */}
          {checkoutStep === 'cart' && cartItems.length > 0 && (
            <div className="px-6 py-6 border-t border-brand-sand/50 bg-brand-sand/15">
              <div className="space-y-2 mb-6 text-xs font-sans text-brand-warmgray">
                <div className="flex justify-between">
                  <span>{language === 'tr' ? 'Ara Toplam:' : 'Subtotal:'}</span>
                  <span className="text-brand-charcoal font-medium">
                    {subtotal.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'tr' ? 'Kargo Ücreti:' : 'Shipping Cost:'}</span>
                  <span className="text-brand-charcoal font-medium">
                    {isFreeShipping 
                      ? (language === 'tr' ? 'Ücretsiz' : 'Free') 
                      : `${shippingCost.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} ${t('cart.currency')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-brand-charcoal font-semibold border-t border-brand-sand/50 pt-3">
                  <span>{language === 'tr' ? 'Toplam:' : 'Total:'}</span>
                  <span>
                    {total.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                  </span>
                </div>
              </div>

              <button
                id="btn-goto-shipping"
                onClick={() => setCheckoutStep('shipping')}
                className="w-full py-4 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs font-sans tracking-[0.25em] uppercase transition-all duration-300 flex items-center justify-center gap-2 rounded-[2px]"
              >
                <CreditCard size={14} /> {language === 'tr' ? 'ADRESE GEÇ' : 'PROCEED TO DETAILS'}
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
