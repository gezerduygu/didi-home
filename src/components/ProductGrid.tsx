import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Tag } from 'lucide-react';
import { Product, Category, CategoryItem } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProductGridProps {
  products: Product[];
  category: Category;
  categories?: CategoryItem[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

type SortType = 'default' | 'price-asc' | 'price-desc' | 'newest';

export default function ProductGrid({
  products,
  category,
  categories,
  onBack,
  onSelectProduct
}: ProductGridProps) {
  const { t, translateProduct, language } = useLanguage();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortType>('default');

  // Reset subcategory filter when category changes
  React.useEffect(() => {
    setSelectedSubcategory('all');
    setSortBy('default');
  }, [category]);

  const categoryItem = useMemo(() => {
    return categories?.find(c => c.id === category);
  }, [categories, category]);

  const subcategoriesList = useMemo(() => {
    const predefined = categoryItem?.subcategories || [];
    const fromProducts = Array.from(
      new Set(products.filter(p => p.category === category && p.subcategory).map(p => p.subcategory as string))
    );
    const combined = [...predefined];
    fromProducts.forEach(s => {
      if (!combined.includes(s)) combined.push(s);
    });
    return combined;
  }, [categoryItem, products, category]);

  const categoryName = useMemo(() => {
    if (categoryItem) {
      return language === 'en' && categoryItem.titleEn ? categoryItem.titleEn : categoryItem.title;
    }
    switch (category) {
      case 'houte-couture': return t('cat.hc.title');
      case 'seramik': return t('cat.ceramic.title');
      case 'ev-to-home': return t('cat.home.title');
      default: return category;
    }
  }, [category, categoryItem, language, t]);

  const categoryDesc = useMemo(() => {
    if (categoryItem?.description) {
      return language === 'en' && categoryItem.descriptionEn ? categoryItem.descriptionEn : categoryItem.description;
    }
    switch (category) {
      case 'houte-couture': return t('grid.hc.desc');
      case 'seramik': return t('grid.ceramic.desc');
      case 'ev-to-home': return t('grid.home.desc');
      default: return '';
    }
  }, [category, categoryItem, language, t]);

  const filteredAndSortedProducts = useMemo(() => {
    // 1. Filter by category
    let result = products.filter(p => p.category === category);
    
    // Dynamically translate default items
    result = result.map(p => translateProduct(p));
    
    // Subcategory filter
    if (selectedSubcategory !== 'all') {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }

    // 2. Sort
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, category, selectedSubcategory, sortBy, translateProduct]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Category Header with Animation */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button
          id="btn-back-to-categories"
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-sans tracking-[0.2em] text-brand-warmgray hover:text-brand-charcoal uppercase mb-8 transition-colors duration-200"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-200" />
          {t('grid.all_collections')}
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-sand/50 pb-8">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-brand-charcoal mb-4 flex items-center gap-3">
              {categoryName}
            </h1>
            <p className="font-sans text-sm tracking-wide text-brand-warmgray/90 leading-relaxed font-light">
              {categoryDesc}
            </p>
          </div>
          
          {/* Active Counters */}
          <div className="text-right text-xs font-sans tracking-widest text-brand-warmgray">
            {filteredAndSortedProducts.length} {t('grid.items_listed')}
          </div>
        </div>
      </motion.div>

      {/* Unified Categorization & Sorting Bar */}
      <motion.div
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 bg-brand-sand/25 p-3.5 sm:p-4 rounded-sm border border-brand-sand/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {/* Subcategory Pills Bar (Tek Kategorizasyon Sistemi) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedSubcategory === 'all'
                ? 'bg-brand-charcoal text-brand-beige font-semibold shadow-xs'
                : 'bg-brand-sand/40 hover:bg-brand-sand/80 text-brand-charcoal/80'
            }`}
          >
            <span>{t('grid.filter.all')}</span>
            <span className="text-[10px] opacity-75">
              ({products.filter(p => p.category === category).length})
            </span>
          </button>

          {subcategoriesList.map((sub) => {
            const count = products.filter(p => p.category === category && p.subcategory === sub).length;
            const isSelected = selectedSubcategory === sub;

            return (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-charcoal text-brand-beige font-semibold shadow-xs'
                    : 'bg-brand-sand/40 hover:bg-brand-sand/80 text-brand-charcoal/80'
                }`}
              >
                <span>{sub}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center justify-end gap-2 text-xs font-sans tracking-wider shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-brand-sand/30">
          <span className="text-brand-warmgray">{t('grid.sort.label')}</span>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="bg-transparent border-b border-brand-warmgray/40 focus:border-brand-charcoal outline-none py-1 pr-4 cursor-pointer text-brand-charcoal font-medium"
          >
            <option value="default">{t('grid.sort.default')}</option>
            <option value="price-asc">{t('grid.sort.price_asc')}</option>
            <option value="price-desc">{t('grid.sort.price_desc')}</option>
            <option value="newest">{t('grid.sort.newest')}</option>
          </select>
        </div>
      </motion.div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <motion.div
          className="text-center py-20 bg-brand-sand/10 rounded-sm border border-dashed border-brand-sand/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-serif text-lg text-brand-warmgray italic">{t('grid.no_products')}</p>
          <button
            id="btn-clear-filters"
            onClick={() => { setSelectedSubcategory('all'); setSortBy('default'); }}
            className="mt-4 text-xs font-sans tracking-widest text-brand-terracotta hover:underline uppercase"
          >
            {language === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters'}
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                id={`product-card-${product.id}`}
                className="group cursor-pointer flex flex-col"
                onClick={() => onSelectProduct(product)}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                layout
                whileHover={{ y: -4 }}
              >
                {/* Product Image */}
                <div className="relative overflow-hidden aspect-[4/5] rounded-[1px] bg-brand-sand/50 shadow-sm border border-brand-sand/30">
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-all duration-[1000ms] group-hover:scale-105 filter saturate-[0.95] group-hover:saturate-100"
                  />
                  
                  {/* Subcategory Badge in place of old badges */}
                  {product.subcategory && (
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <span className="bg-brand-charcoal/85 text-brand-beige text-[8.5px] font-sans tracking-[0.2em] uppercase px-2.5 py-1 rounded-[1px] shadow-sm backdrop-blur-[2px] font-medium border border-white/10 flex items-center gap-1">
                        <Tag size={8} className="text-brand-terracotta" />
                        {product.subcategory}
                      </span>
                    </div>
                  )}

                  {/* Gentle hover overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>

                {/* Product Metadata */}
                <div className="mt-4 flex flex-col">
                  {product.material && (
                    <span className="text-[9px] font-sans tracking-widest text-brand-warmgray uppercase mb-1 font-medium truncate">
                      {product.material}
                    </span>
                  )}
                  <h3 className="font-serif text-lg text-brand-charcoal group-hover:text-brand-terracotta transition-colors duration-200 line-clamp-1">
                    {product.title}
                  </h3>
                  <div className="w-4 h-[1px] bg-brand-warmgray/20 my-1.5 group-hover:w-8 group-hover:bg-brand-terracotta/40 transition-all duration-300" />
                  <span className="text-sm font-sans font-medium text-brand-charcoal tracking-wide">
                    {product.price.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
