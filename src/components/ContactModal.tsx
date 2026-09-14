import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Mail, MapPin, Copy, Check, Sparkles, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const email = 'didirengin@gmail.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <motion.div
          id="contact-brand-modal"
          className="relative w-full max-w-xl bg-brand-beige rounded-sm shadow-[0_20px_50px_rgba(40,38,37,0.15)] overflow-hidden border border-brand-sand/50 p-6 sm:p-10"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Close Button */}
          <button
            id="close-contact-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-sand/40 rounded-full transition-colors duration-200"
            aria-label={t('prod.close_details')}
          >
            <X size={18} />
          </button>

          {/* Contact Content */}
          <div className="space-y-6 text-center max-w-md mx-auto">
            {/* Sub-badge */}
            <span className="text-[10px] font-sans tracking-[0.3em] text-brand-terracotta uppercase block font-semibold">
              {t('contact.subtitle')}
            </span>

            {/* Title */}
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-brand-charcoal tracking-wide">
              {t('contact.title')}
            </h2>

            {/* Custom divider */}
            <div className="flex items-center justify-center gap-2">
              <span className="w-10 h-[1px] bg-brand-sand"></span>
              <Sparkles size={12} className="text-brand-terracotta animate-pulse" />
              <span className="w-10 h-[1px] bg-brand-sand"></span>
            </div>

            {/* Description */}
            <p className="text-sm font-light text-brand-warmgray/90 leading-relaxed font-sans">
              {t('contact.text')}
            </p>

            {/* Email Card */}
            <div className="bg-brand-sand/30 border border-brand-sand/60 p-4 sm:p-5 rounded-[2px] space-y-3">
              <span className="text-[10px] font-sans tracking-widest text-brand-warmgray uppercase block font-medium">
                {t('contact.email_label')}
              </span>
              
              <div className="flex items-center justify-center gap-2">
                <Mail size={16} className="text-brand-terracotta shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="font-serif text-lg sm:text-xl text-brand-charcoal hover:text-brand-terracotta transition-colors underline underline-offset-4 decoration-brand-terracotta/40 font-medium"
                >
                  {email}
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-brand-beige hover:bg-brand-sand/50 text-brand-charcoal border border-brand-sand text-xs font-sans tracking-wider rounded-[2px] transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-emerald-700 font-medium">{t('contact.copied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} className="text-brand-warmgray" />
                      <span>{t('contact.copy_mail')}</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${email}?subject=Didi%20Home%20-%20%C4%B0leti%C5%9Fim`}
                  className="px-4 py-1.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs font-sans tracking-widest uppercase rounded-[2px] transition-colors flex items-center gap-1.5"
                >
                  <Send size={11} />
                  <span>{t('contact.send_mail')}</span>
                </a>
              </div>
            </div>

            {/* Location & Workshop Note */}
            <div className="flex items-center justify-center gap-2 text-xs font-sans text-brand-warmgray tracking-widest pt-2">
              <MapPin size={13} className="text-brand-terracotta" />
              <span>{t('contact.location')}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs font-sans tracking-widest uppercase transition-colors rounded-[2px]"
            >
              {language === 'tr' ? 'Kapat' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
