import React from 'react';
import { ShoppingBag, BookOpen, Plus, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import { CategoryItem } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAbout: () => void;
  onResetCategory: () => void;
  activeCategory: string | null;
  categories?: CategoryItem[];
}

export default function Header({
  cartCount,
  onOpenCart,
  onOpenAbout,
  onResetCategory,
  activeCategory,
  categories
}: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const getActiveCategoryTitle = () => {
    if (!activeCategory) return '';
    const match = categories?.find(c => c.id === activeCategory);
    if (match) {
      return language === 'en' && match.titleEn ? match.titleEn : match.title;
    }
    if (activeCategory === 'houte-couture') return t('nav.houteCouture');
    if (activeCategory === 'seramik') return t('nav.ceramic');
    if (activeCategory === 'ev-to-home') return t('nav.homeCategory');
    return activeCategory;
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-beige/90 backdrop-blur-md border-b border-brand-sand/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 xs:px-6 h-20 flex items-center justify-between">
        {/* Left Side Links */}
        <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm font-sans tracking-wide text-brand-charcoal/80">
          <button
            id="nav-about-btn"
            onClick={onOpenAbout}
            className="group flex items-center gap-1.5 hover:text-brand-charcoal transition-colors duration-200"
          >
            <BookOpen size={14} className="text-brand-warmgray shrink-0" />
            <span className="relative hidden sm:inline-block">
              {t('nav.story')}
              <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-brand-charcoal transition-all duration-300 group-hover:w-full"></span>
            </span>
          </button>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <button
            id="logo-btn"
            onClick={onResetCategory}
            className="group flex flex-col items-center cursor-pointer"
          >
            <h1 className="font-serif text-[28px] sm:text-4xl md:text-5xl font-light tracking-[0.14em] sm:tracking-[0.32em] text-brand-charcoal transition-all duration-300 group-hover:tracking-[0.38em] whitespace-nowrap">
              Didi Home
            </h1>
            {activeCategory && (
              <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.2em] sm:tracking-[0.4em] text-brand-warmgray uppercase mt-0.5 sm:mt-2">
                <span className="flex items-center gap-1 justify-center">
                  <Sparkles size={7} className="animate-pulse shrink-0" />
                  {getActiveCategoryTitle()}
                </span>
              </span>
            )}
          </button>
        </div>

        {/* Right Side Content: Language Select & Cart */}
        <div className="flex items-center space-x-2 sm:space-x-6">
          {/* Subtle Language Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] sm:text-[11px] font-sans tracking-wider sm:tracking-widest text-brand-charcoal/60">
            <button
              onClick={() => setLanguage('tr')}
              className={`hover:text-brand-charcoal transition-all py-0.5 px-1 sm:px-1.5 rounded-[2px] ${
                language === 'tr' 
                  ? 'text-brand-charcoal font-semibold bg-brand-sand/30 border border-brand-sand/40' 
                  : 'text-brand-warmgray/70 font-light hover:bg-brand-sand/15'
              }`}
            >
              TR
            </button>
            <span className="text-brand-sand/40 text-[8px] sm:text-[9px]">|</span>
            <button
              onClick={() => setLanguage('en')}
              className={`hover:text-brand-charcoal transition-all py-0.5 px-1 sm:px-1.5 rounded-[2px] ${
                language === 'en' 
                  ? 'text-brand-charcoal font-semibold bg-brand-sand/30 border border-brand-sand/40' 
                  : 'text-brand-warmgray/70 font-light hover:bg-brand-sand/15'
              }`}
            >
              EN
            </button>
          </div>

          <button
            id="nav-cart-btn"
            onClick={onOpenCart}
            className="group relative p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 text-brand-charcoal/80 hover:text-brand-charcoal transition-colors duration-200"
            aria-label={t('nav.cart')}
          >
            <ShoppingBag size={16} className="group-hover:scale-105 sm:w-[18px] sm:h-[18px] transition-transform duration-200" />
            <span className="text-xs font-sans tracking-widest hidden sm:inline-block">{t('nav.cart')}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-terracotta text-white font-sans text-[8px] sm:text-[10px] font-medium w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm animate-scaleIn">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
