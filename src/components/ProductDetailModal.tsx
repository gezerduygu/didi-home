import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart
}: ProductDetailModalProps) {
  const { t, translateProduct, language } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset image index when product changes
  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [product]);

  if (!product) return null;

  // Dynamically translate the product based on active language
  const translatedProduct = translateProduct(product);

  const handleAddToCart = () => {
    onAddToCart(translatedProduct);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const images = translatedProduct.images && translatedProduct.images.length > 0 ? translatedProduct.images : [translatedProduct.image];
  const currentImage = images[selectedImageIndex] || translatedProduct.image;

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div
          id={`product-detail-modal-${translatedProduct.id}`}
          className="relative w-full max-w-4xl bg-brand-beige rounded-sm shadow-[0_20px_50px_rgba(40,38,37,0.15)] overflow-hidden border border-brand-sand/50"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Close Button */}
          <button
            id="close-detail-modal"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-sand/40 rounded-full transition-all duration-200"
            aria-label={t('prod.close_details')}
          >
            <X size={18} />
          </button>

          {/* Grid Layout: Left Image, Right Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 md:h-[560px]">
            
            {/* Image Section */}
            <div className="md:col-span-6 relative bg-brand-sand/20 group flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-brand-sand/30 min-h-[350px] md:min-h-[500px]">
              
              {/* Main Image Container */}
              <div className="relative flex-1 w-full h-full flex items-center justify-center p-4 md:p-6 overflow-hidden bg-brand-sand/10">
                <motion.img
                  key={selectedImageIndex}
                  src={currentImage}
                  alt={translatedProduct.title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-sm rounded-[1px]"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Arrow navigation if multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-brand-beige/90 hover:bg-brand-beige text-brand-charcoal p-2 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-beige/90 hover:bg-brand-beige text-brand-charcoal p-2 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="bg-brand-beige/95 p-3 border-t border-brand-sand/30 flex gap-2 overflow-x-auto justify-center scrollbar-none">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-12 h-16 flex-shrink-0 border transition-all duration-200 ${
                        selectedImageIndex === idx
                          ? 'border-brand-terracotta scale-105 shadow-sm'
                          : 'border-brand-sand/40 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${translatedProduct.title} ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="md:col-span-6 p-5 sm:p-6 md:p-8 flex flex-col justify-between md:h-full bg-brand-beige overflow-y-auto max-h-[560px] scrollbar-thin scrollbar-thumb-brand-sand">
              <div>
                {/* Category, Subcategory & Condition tags */}
                <div className="flex items-center flex-wrap gap-2 mb-2 text-[10px] font-sans tracking-[0.2em] text-brand-warmgray uppercase">
                  <span>
                    {translatedProduct.category === 'houte-couture' 
                      ? t('nav.houteCouture') 
                      : translatedProduct.category === 'seramik' 
                        ? t('nav.ceramic') 
                        : translatedProduct.category === 'ev-to-home'
                          ? t('nav.homeCategory')
                          : translatedProduct.category}
                  </span>
                  {translatedProduct.subcategory && (
                    <>
                      <span className="text-brand-sand/60">/</span>
                      <span className="text-brand-charcoal font-medium">{translatedProduct.subcategory}</span>
                    </>
                  )}
                  {translatedProduct.condition && (
                    <>
                      <span className="text-brand-sand/60">•</span>
                      <span className="text-brand-terracotta">{translatedProduct.condition}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-serif text-2xl font-light text-brand-charcoal tracking-wide mb-1.5">
                  {translatedProduct.title}
                </h2>

                {/* Price */}
                <p className="text-lg font-medium text-brand-charcoal tracking-wide mb-3">
                  {translatedProduct.price.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                </p>

                {/* Hand-selected/Wabi-Sabi philosophical banner */}
                <div className="flex gap-2 p-2.5 bg-brand-sand/25 rounded-[2px] border border-brand-sand/40 text-[11px] text-brand-warmgray/90 mb-3.5 leading-relaxed">
                  <Sparkles size={13} className="text-brand-terracotta shrink-0 mt-0.5" />
                  <span>
                    {language === 'tr' 
                      ? 'Didi Home koleksiyonundaki her bir parça tekil, el yapımı veya özenle seçilmiş vintage niteliğindedir. Kusurlarındaki özgün hikayeleri taşırlar.' 
                      : 'Each piece in the Didi Home collection is unique, handcrafted, or carefully selected vintage. They carry the authentic stories within their imperfections.'}
                  </span>
                </div>

                {/* Story / Description */}
                <div className="mb-4">
                  <h3 className="text-[10px] font-sans tracking-[0.2em] text-brand-charcoal/70 uppercase mb-1">
                    {language === 'tr' ? 'HİKAYESİ' : 'THE STORY'}
                  </h3>
                  <p className="text-xs font-light text-brand-warmgray/90 leading-relaxed font-sans">
                    {translatedProduct.story}
                  </p>
                </div>

                {/* Product Specs */}
                <div className="border-t border-brand-sand/40 pt-2.5 mb-4">
                  <h3 className="text-[10px] font-sans tracking-[0.2em] text-brand-charcoal/70 uppercase mb-2">
                    {t('prod.specs')}
                  </h3>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[11px] font-sans">
                    {translatedProduct.material && (
                      <div className="flex flex-col">
                        <span className="text-brand-warmgray/70 text-[10px]">{t('prod.spec.material')}</span>
                        <span className="font-medium text-brand-charcoal/90 mt-0.5">{translatedProduct.material}</span>
                      </div>
                    )}
                    {translatedProduct.dimensions && (
                      <div className="flex flex-col">
                        <span className="text-brand-warmgray/70 text-[10px]">{t('prod.spec.dimensions')}</span>
                        <span className="font-medium text-brand-charcoal/90 mt-0.5">{translatedProduct.dimensions}</span>
                      </div>
                    )}
                    <div className="flex flex-col col-span-2 mt-1.5">
                      <span className="text-brand-warmgray/70 text-[10px] flex items-center gap-1">
                        <ShieldCheck size={11} className="text-brand-warmgray" />{' '}
                        {language === 'tr' ? 'Sürdürülebilirlik Puanı' : 'Sustainability Score'}
                      </span>
                      <span className="font-medium text-brand-terracotta mt-0.5 text-xs">
                        {translatedProduct.isSecondHand 
                          ? (language === 'tr' ? '%100 Döngüsel / Geri Kazanılmış' : '100% Circular / Reclaimed') 
                          : (language === 'tr' ? '%100 Yerel El Emeği' : '100% Local Handcrafted')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Add to Cart */}
              <div className="mt-auto pt-2">
                <button
                  id="btn-add-to-cart"
                  onClick={handleAddToCart}
                  className={`w-full py-3 rounded-[2px] flex items-center justify-center gap-2 text-xs font-sans tracking-[0.25em] uppercase transition-all duration-300 ${
                    isAdded
                      ? 'bg-emerald-800 text-white'
                      : 'bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige active:scale-[0.98]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={16} /> {language === 'tr' ? 'SEPETE EKLENDİ' : 'ADDED TO CART'}
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} /> {language === 'tr' ? 'SEPETE EKLE' : 'ADD TO CART'}
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-brand-warmgray mt-2 tracking-wide">
                  {language === 'tr' 
                    ? 'Türkiye içi ücretsiz kargo · 3 iş gününde kargoya teslim' 
                    : 'Free shipping within Turkey · Dispatched within 3 business days'}
                </p>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
