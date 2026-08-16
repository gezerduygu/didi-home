import React from 'react';
import { motion } from 'motion/react';
import { X, Heart, Recycle, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

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
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <motion.div
          id="about-brand-modal"
          className="relative w-full max-w-2xl bg-brand-beige rounded-sm shadow-[0_20px_50px_rgba(40,38,37,0.15)] overflow-hidden border border-brand-sand/50 p-6 sm:p-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Close Button */}
          <button
            id="close-about-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-sand/40 rounded-full transition-colors duration-200"
            aria-label={t('prod.close_details')}
          >
            <X size={18} />
          </button>

          {/* About Content */}
          <div className="space-y-6 text-center max-w-lg mx-auto">
            {/* Elegant Sub-badge */}
            <span className="text-[10px] font-sans tracking-[0.3em] text-brand-terracotta uppercase block">
              {t('about.story')}
            </span>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-brand-charcoal tracking-wide whitespace-pre-line">
              {t('about.title')}
            </h2>

            {/* Custom divider */}
            <div className="flex items-center justify-center gap-2">
              <span className="w-10 h-[1px] bg-brand-sand"></span>
              <Sparkles size={12} className="text-brand-terracotta animate-pulse" />
              <span className="w-10 h-[1px] bg-brand-sand"></span>
            </div>

            {/* Philosophical Text */}
            <p className="text-sm font-light text-brand-warmgray/90 leading-relaxed font-sans text-justify sm:text-center">
              {t('about.para1')}
            </p>

            <p className="text-sm font-light text-brand-warmgray/90 leading-relaxed font-sans text-justify sm:text-center">
              {t('about.para2')}
            </p>

            {/* Earthy Core Values Icons */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-sand/40 mt-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-brand-sand/30 flex items-center justify-center mb-2 text-brand-terracotta">
                  <Heart size={16} />
                </div>
                <h4 className="text-[11px] font-sans tracking-wider font-semibold text-brand-charcoal uppercase">{t('about.value1.title')}</h4>
                <p className="text-[9px] text-brand-warmgray mt-1">{t('about.value1.desc')}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-brand-sand/30 flex items-center justify-center mb-2 text-brand-terracotta">
                  <Recycle size={16} />
                </div>
                <h4 className="text-[11px] font-sans tracking-wider font-semibold text-brand-charcoal uppercase">{t('about.value2.title')}</h4>
                <p className="text-[9px] text-brand-warmgray mt-1">{t('about.value2.desc')}</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-brand-sand/30 flex items-center justify-center mb-2 text-brand-terracotta">
                  <Sparkles size={16} />
                </div>
                <h4 className="text-[11px] font-sans tracking-wider font-semibold text-brand-charcoal uppercase">{t('about.value3.title')}</h4>
                <p className="text-[9px] text-brand-warmgray mt-1">{t('about.value3.desc')}</p>
              </div>
            </div>

            <div className="pt-8 text-[11px] font-sans italic text-brand-warmgray tracking-widest border-t border-brand-sand/20">
              {t('about.quote')}
            </div>

            <button
              id="btn-close-about-modal-action"
              onClick={onClose}
              className="mt-6 px-8 py-3 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs font-sans tracking-widest uppercase transition-colors rounded-[2px]"
            >
              {t('about.explore_space')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
