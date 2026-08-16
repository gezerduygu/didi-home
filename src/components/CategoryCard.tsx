import React from 'react';
import { motion } from 'motion/react';
import { Category } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CategoryCardProps {
  id: Category;
  title: string;
  subtitle?: string;
  image: string;
  itemCount: number;
  onSelect: (category: Category) => void;
}

export default function CategoryCard({
  id,
  title,
  subtitle,
  image,
  itemCount,
  onSelect
}: CategoryCardProps) {
  const { t, language } = useLanguage();
  const isIllustration = image.includes('illustration');

  return (
    <motion.div
      id={`category-card-${id}`}
      onClick={() => onSelect(id)}
      className="group cursor-pointer flex flex-col w-full text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -8 }}
    >
      {/* Tall Vertical Image Container */}
      <div className="relative overflow-hidden aspect-[3/4] rounded-[2px] border border-brand-sand/50 shadow-[0_4px_20px_rgba(40,38,37,0.04)] transition-all duration-700 bg-brand-sand">
        <motion.img
          src={image}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-all duration-[1000ms] ease-out group-hover:scale-[1.04] filter saturate-[0.95] group-hover:saturate-100"
          initial={{ scale: 1.02 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        
        {/* Ambient Darkened Bottom Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent transition-opacity duration-500 ${
          isIllustration
            ? 'from-brand-charcoal/30 opacity-60 group-hover:opacity-80'
            : 'from-brand-charcoal/20 opacity-80 group-hover:opacity-100'
        }`} />

        {/* Elegant border overlay */}
        <div className="absolute inset-4 border border-white/30 group-hover:border-white/55 transition-colors duration-500 rounded-[1px] pointer-events-none" />

        {/* Floating Quick Shop Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-[10px] font-sans tracking-[0.25em] text-white/95 uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out font-medium drop-shadow-sm">
          {t('cart.explore')}
        </div>
      </div>

      {/* Under-Card Typography matching paper sketch */}
      <div className="mt-6 flex flex-col items-center">
        <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-wide text-brand-charcoal group-hover:text-brand-terracotta transition-colors duration-300">
          {title}
        </h2>
        {subtitle && (
          <>
            <div className="w-8 h-[1px] bg-brand-warmgray/30 my-2 group-hover:w-16 group-hover:bg-brand-terracotta/40 transition-all duration-500" />
            <p className="text-xs font-sans tracking-[0.15em] text-brand-warmgray uppercase">
              {subtitle} <span className="text-[10px] text-brand-warmgray/60 italic ml-1">({itemCount} {language === 'tr' ? 'Parça' : 'Items'})</span>
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
