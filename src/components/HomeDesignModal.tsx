import React from 'react';
import { motion } from 'motion/react';
import { X, Home as HomeIcon, Compass, Sparkles, Phone, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomeDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreCollection?: () => void;
  bannerImage?: string;
}

export default function HomeDesignModal({ isOpen, onClose, onExploreCollection, bannerImage = '/images/ev-to-home-cover.jpg' }: HomeDesignModalProps) {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-6">
        <motion.div
          id="home-design-modal"
          className="relative w-full max-w-3xl bg-brand-beige rounded-sm shadow-[0_25px_60px_rgba(40,38,37,0.25)] overflow-hidden border border-brand-sand/60"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Close Button */}
          <button
            id="close-home-design-modal"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 bg-brand-beige/80 hover:bg-brand-beige text-brand-charcoal p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200"
            aria-label={t('prod.close_details')}
          >
            <X size={18} />
          </button>

          {/* Top Hero Banner - Real Stone House Photo */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-brand-charcoal">
            <img
              src={bannerImage}
              alt={language === 'tr' ? 'Didi Home Ev Tasarımı & Mimari Atölye' : 'Didi Home Interior Architecture'}
              className="w-full h-full object-cover object-center filter saturate-[0.95] contrast-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/90 via-brand-charcoal/40 to-transparent" />
            
            <div className="absolute bottom-4 sm:bottom-6 left-6 right-6 text-brand-beige">
              <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-sans tracking-[0.25em] text-brand-sand uppercase mb-1.5 font-medium">
                <Sparkles size={11} className="text-brand-terracotta animate-pulse" />
                {language === 'tr' ? 'MİMARİ & YAŞAM ALANI TASARIMI' : 'ARCHITECTURAL & LIVING DESIGN'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-light tracking-wide text-white">
                {language === 'tr' ? 'Didi Home Ev Tasarımı Atölyesi' : 'Didi Home Design Workshop'}
              </h2>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Introductory Text */}
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <h3 className="font-serif text-xl sm:text-2xl text-brand-charcoal font-light">
                {language === 'tr'
                  ? 'Taş Dokuların, Doğal Ağacın ve Zamansız Objelerin Uyanışı'
                  : 'Awakening Stone Textures, Natural Wood & Timeless Objects'}
              </h3>
              <div className="w-12 h-[1px] bg-brand-terracotta/40 mx-auto" />
              <p className="text-xs sm:text-sm text-brand-warmgray/90 leading-relaxed font-light font-sans text-justify sm:text-center">
                {language === 'tr'
                  ? 'Didi Home Ev Tasarımı; Akdeniz ve Ege taş mimarisinden ilham alarak mekanlarınıza doğal doku, ruh ve sanatsal bir derinlik katmayı hedefler. Taş ev restorasyonu danışmanlığından yekpare seramik obje kurasyonuna, ham ahşap mobilya yerleşiminden vintage tekstil seçkilerine kadar evinize özel stilledik sunuyoruz.'
                  : 'Didi Home Design aims to infuse your spaces with natural texture, soul, and artistic depth inspired by Mediterranean and Aegean stone architecture. From stone house restoration styling to monolithic ceramic curation, we offer bespoke living space design.'}
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-brand-sand/20 border border-brand-sand/40 p-4 rounded-[2px] text-center flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-brand-sand/50 flex items-center justify-center mb-2.5 text-brand-terracotta">
                  <HomeIcon size={16} />
                </div>
                <h4 className="text-xs font-sans font-semibold tracking-wider text-brand-charcoal uppercase">
                  {language === 'tr' ? 'Mekan Kurasyonu' : 'Space Curation'}
                </h4>
                <p className="text-[10px] text-brand-warmgray mt-1 leading-relaxed">
                  {language === 'tr'
                    ? 'Ev, bağ evi ve taş yapılar için özel seçilmiş antik ve el yapımı aksesuarlar.'
                    : 'Curated antique and handmade accessories for homes and country retreats.'}
                </p>
              </div>

              <div className="bg-brand-sand/20 border border-brand-sand/40 p-4 rounded-[2px] text-center flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-brand-sand/50 flex items-center justify-center mb-2.5 text-brand-terracotta">
                  <Compass size={16} />
                </div>
                <h4 className="text-xs font-sans font-semibold tracking-wider text-brand-charcoal uppercase">
                  {language === 'tr' ? 'İç Mimari Stili' : 'Interior Styling'}
                </h4>
                <p className="text-[10px] text-brand-warmgray mt-1 leading-relaxed">
                  {language === 'tr'
                    ? 'Doğal ışığı, ham keteni ve terracotta renk paletini ön plana çıkaran iç düzenleme.'
                    : 'Interior layouts highlighting natural light, raw linen, and terracotta palettes.'}
                </p>
              </div>

              <div className="bg-brand-sand/20 border border-brand-sand/40 p-4 rounded-[2px] text-center flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-brand-sand/50 flex items-center justify-center mb-2.5 text-brand-terracotta">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-xs font-sans font-semibold tracking-wider text-brand-charcoal uppercase">
                  {language === 'tr' ? 'Özel Üretim & Sipariş' : 'Custom Atelier Work'}
                </h4>
                <p className="text-[10px] text-brand-warmgray mt-1 leading-relaxed">
                  {language === 'tr'
                    ? 'Mekanınızın boyutlarına özel sırsız seramik vazo, ayna ve kök boya kilim tasarımları.'
                    : 'Bespoke unglazed ceramic vases, mirrors, and naturally dyed kilim designs.'}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-brand-sand/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-sans text-brand-warmgray">
                <Phone size={13} className="text-brand-terracotta shrink-0" />
                <span>{language === 'tr' ? 'Tasarım Danışmanlığı Bilgisi:' : 'Design Consultation Inquiry:'}</span>
                <span className="font-semibold text-brand-charcoal">info@didihome.com</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                {onExploreCollection && (
                  <button
                    id="btn-modal-explore-home-collection"
                    onClick={() => {
                      onClose();
                      onExploreCollection();
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs font-sans tracking-widest uppercase transition-colors rounded-[2px] flex items-center justify-center gap-1.5"
                  >
                    <span>{language === 'tr' ? 'Ev Ürünlerini Gör' : 'Browse Home Collection'}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
