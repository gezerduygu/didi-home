import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

import Header from './components/Header';
import CategoryCard from './components/CategoryCard';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import AboutModal from './components/AboutModal';
import AdminPanel from './components/AdminPanel';

import { 
  getStoredProducts, 
  saveProducts, 
  fetchProductsFromServer, 
  getStoredCovers, 
  saveCovers, 
  fetchCoversFromServer, 
  DEFAULT_COVERS,
  DEFAULT_CATEGORIES,
  getStoredCategories,
  saveCategories,
  fetchCategoriesFromServer
} from './data';
import { Product, CartItem, Category, CoverSettings, CategoryItem } from './types';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(getStoredCategories());
  const [covers, setCovers] = useState<CoverSettings>(getStoredCovers());
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Modal / Drawer control states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize products & categories & covers & cart on load
  useEffect(() => {
    // Synchronously set stored data first for fast paint
    setProducts(getStoredProducts());
    setCategories(getStoredCategories());
    setCovers(getStoredCovers());

    // Fetch disk file backed products from server
    fetchProductsFromServer().then(prods => {
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
    });

    // Fetch disk file backed categories from server
    fetchCategoriesFromServer().then(cats => {
      if (cats && cats.length > 0) {
        setCategories(cats);
      }
    });

    // Fetch disk file backed covers from server
    fetchCoversFromServer().then(covs => {
      if (covs) {
        setCovers(covs);
      }
    });

    const storedCart = localStorage.getItem('didi_home_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // URL routing for /admin
  useEffect(() => {
    const checkPath = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path === '/admin') {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }
    };

    checkPath();
    window.addEventListener('popstate', checkPath);
    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  const handleOpenAdmin = () => {
    if (window.location.pathname.toLowerCase().replace(/\/$/, '') !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setIsAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    if (window.location.pathname.toLowerCase().replace(/\/$/, '') === '/admin') {
      window.history.pushState({}, '', '/');
    }
    setIsAdminOpen(false);
    setProducts(getStoredProducts());
  };

  // Scroll to top on category change (fixes scrolled home page issue)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeCategory]);

  // Sync cart to local storage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('didi_home_cart', JSON.stringify(newCart));
  };

  // Notification trigger
  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- ACTIONS ---

  // Add Custom Product (Admin)
  const handleAddProduct = (newProduct: Product) => {
    const updatedProducts = [newProduct, ...products];
    try {
      saveProducts(updatedProducts);
      setProducts(updatedProducts);
      triggerNotification(
        language === 'tr' 
          ? `"${newProduct.title}" başarıyla atölyeye eklendi ve yayına alındı!` 
          : `"${newProduct.title}" successfully added to the workshop and published!`
      );
    } catch (e) {
      console.error('Failed to save to localStorage due to size limit', e);
      setProducts(updatedProducts);
      triggerNotification(
        language === 'tr' 
          ? "Hafıza Uyarısı: Fotoğraf başarıyla yüklendi ve yayına alındı, ancak tarayıcı hafızanız dolu olduğu için kalıcı kaydedilemedi." 
          : "Storage Warning: Image successfully uploaded and published, but could not be permanently saved due to full browser storage."
      );
    }
  };

  // Update Custom Product (Admin)
  const handleUpdateProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    try {
      saveProducts(updatedProducts);
      setProducts(updatedProducts);
      triggerNotification(
        language === 'tr' 
          ? `"${updatedProduct.title}" başarıyla güncellendi!` 
          : `"${updatedProduct.title}" successfully updated!`
      );
    } catch (e) {
      console.error('Failed to save to localStorage due to size limit', e);
      setProducts(updatedProducts);
      triggerNotification(
        language === 'tr' 
          ? "Hafıza Uyarısı: Güncelleme yapıldı ve yayına alındı, ancak tarayıcı hafızanız dolu olduğu için kalıcı kaydedilemedi." 
          : "Storage Warning: Updated and published, but could not be permanently saved due to full browser storage."
      );
    }
  };

  // Delete Product (Admin)
  const handleDeleteProduct = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
    triggerNotification(
      language === 'tr' ? "Ürün başarıyla silindi." : "Product successfully deleted."
    );
  };

  // Reset Products to Defaults (Admin)
  const handleResetProducts = () => {
    localStorage.removeItem('didi_home_products');
    const defaults = getStoredProducts();
    setProducts(defaults);
    triggerNotification(
      language === 'tr' 
        ? "Katalog başarıyla varsayılan fabrika ayarlarına sıfırlandı!" 
        : "Catalog successfully reset to factory defaults!"
    );
  };

  // Add New Category (Admin)
  const handleAddCategory = (newCat: CategoryItem) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    triggerNotification(
      language === 'tr' 
        ? `"${newCat.title}" kategorisi başarıyla oluşturuldu!` 
        : `Category "${newCat.title}" successfully created!`
    );
  };

  // Update Category (Admin)
  const handleUpdateCategory = (updatedCat: CategoryItem) => {
    const updated = categories.map(c => c.id === updatedCat.id ? updatedCat : c);
    setCategories(updated);
    saveCategories(updated);
    triggerNotification(
      language === 'tr' 
        ? `"${updatedCat.title}" kategorisi güncellendi!` 
        : `Category "${updatedCat.title}" updated!`
    );
  };

  // Delete Category (Admin)
  const handleDeleteCategory = (catId: string) => {
    const target = categories.find(c => c.id === catId);
    const updated = categories.filter(c => c.id !== catId);
    setCategories(updated);
    saveCategories(updated);
    triggerNotification(
      language === 'tr' 
        ? `"${target?.title || catId}" kategorisi silindi.` 
        : `Category "${target?.title || catId}" deleted.`
    );
  };

  // Reset Categories to Defaults (Admin)
  const handleResetCategories = () => {
    setCategories(DEFAULT_CATEGORIES);
    saveCategories(DEFAULT_CATEGORIES);
    triggerNotification(
      language === 'tr' 
        ? "Kategoriler varsayılan ayarlara sıfırlandı!" 
        : "Categories reset to factory defaults!"
    );
  };

  // Update Cover Settings (Admin)
  const handleUpdateCovers = (newCovers: CoverSettings) => {
    setCovers(newCovers);
    saveCovers(newCovers);
    triggerNotification(
      language === 'tr' 
        ? "Kapak fotoğrafları başarıyla güncellendi ve yayına alındı!" 
        : "Cover photos successfully updated and published!"
    );
  };

  // Reset Cover Settings to Defaults (Admin)
  const handleResetCovers = () => {
    setCovers(DEFAULT_COVERS);
    saveCovers(DEFAULT_COVERS);
    triggerNotification(
      language === 'tr' 
        ? "Kapak fotoğrafları varsayılan ayarlara sıfırlandı!" 
        : "Cover photos reset to factory defaults!"
    );
  };

  // Add product to cart
  const handleAddToCart = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    let updatedCart = [...cart];
    
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push({ product, quantity: 1 });
    }
    
    saveCart(updatedCart);
    triggerNotification(
      language === 'tr' ? `"${product.title}" sepetinize eklendi.` : `"${product.title}" added to your cart.`
    );
  };

  // Update Cart Quantities
  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const updatedCart = cart.map(item => 
      item.product.id === productId ? { ...item, quantity: newQty } : item
    );
    saveCart(updatedCart);
  };

  // Remove item from cart
  const handleRemoveCartItem = (productId: string) => {
    const updatedCart = cart.filter(item => item.product.id !== productId);
    saveCart(updatedCart);
  };

  // Clear Cart after success checkout
  const handleClearCart = () => {
    saveCart([]);
  };

  // Count items per category
  const getCategoryCount = (cat: Category) => {
    return products.filter(p => p.category === cat).length;
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (isAdminOpen) {
    return (
      <div className="min-h-screen bg-brand-beige text-brand-charcoal flex flex-col justify-between selection:bg-brand-sand selection:text-brand-charcoal relative">
        {/* Dynamic Success Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              id="toast-notification"
              className="fixed bottom-6 right-6 z-50 bg-brand-charcoal text-brand-beige border border-brand-sand/50 shadow-2xl px-5 py-4 rounded-[2px] flex items-center gap-3 text-xs font-sans tracking-wide max-w-sm"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <Sparkles size={14} className="text-brand-terracotta shrink-0 animate-pulse" />
              <span>{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AdminPanel
          products={products}
          categories={categories}
          covers={covers}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetProducts={handleResetProducts}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onResetCategories={handleResetCategories}
          onUpdateCovers={handleUpdateCovers}
          onResetCovers={handleResetCovers}
          onClose={handleCloseAdmin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal flex flex-col justify-between selection:bg-brand-sand selection:text-brand-charcoal relative">
      
      {/* Dynamic Success Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            id="toast-notification"
            className="fixed bottom-6 right-6 z-50 bg-brand-charcoal text-brand-beige border border-brand-sand/50 shadow-2xl px-5 py-4 rounded-[2px] flex items-center gap-3 text-xs font-sans tracking-wide max-w-sm"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <Sparkles size={14} className="text-brand-terracotta shrink-0 animate-pulse" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shared Navigation Header */}
      <Header
        cartCount={totalCartItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onResetCategory={() => setActiveCategory(null)}
        activeCategory={activeCategory}
        categories={categories}
      />

      <main className="flex-grow flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* --- HOMEPAGE VIEW (Dynamic Vitrines) --- */}
          {!activeCategory ? (
            <motion.div
              key="homepage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto px-6 py-8 md:py-12 w-full flex flex-col justify-center"
            >
              {/* Dynamic Showcase Grid */}
              <div className={`grid grid-cols-1 ${categories.length === 2 ? 'md:grid-cols-2 max-w-4xl' : categories.length >= 3 ? 'md:grid-cols-3 max-w-6xl' : 'max-w-md'} gap-6 md:gap-8 lg:gap-10 mx-auto w-full items-stretch`}>
                {categories.map((cat) => {
                  const title = language === 'en' && cat.titleEn 
                    ? cat.titleEn 
                    : (cat.id === 'houte-couture' ? t('cat.hc.title') : cat.id === 'seramik' ? t('cat.ceramic.title') : cat.id === 'ev-to-home' ? t('cat.home.title') : cat.title);
                  
                  const subtitle = language === 'en' && cat.subtitleEn 
                    ? cat.subtitleEn 
                    : (cat.id === 'houte-couture' ? t('cat.hc.subtitle') : cat.id === 'seramik' ? t('cat.ceramic.subtitle') : cat.id === 'ev-to-home' ? t('cat.home.subtitle') : (cat.subtitle || ''));

                  const image = cat.id === 'houte-couture' 
                    ? covers.hauteCoutureCover 
                    : cat.id === 'seramik' 
                    ? covers.ceramicCover 
                    : cat.id === 'ev-to-home' 
                    ? covers.homeCover 
                    : (cat.image || '/images/ceramic-cover.jpg');

                  return (
                    <CategoryCard
                      key={cat.id}
                      id={cat.id}
                      title={title}
                      subtitle={subtitle}
                      image={image}
                      itemCount={getCategoryCount(cat.id)}
                      onSelect={(selectedId) => setActiveCategory(selectedId)}
                    />
                  );
                })}
              </div>

              {/* Bottom Philosophical Invitation */}
              <div className="mt-12 md:mt-14 border-t border-brand-sand/50 pt-8 text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-brand-warmgray/80 text-xs font-sans tracking-widest">
                  <Heart size={12} className="text-brand-terracotta shrink-0" />
                  {t('phil.badge')}
                </div>
                <p className="text-xs font-sans font-light text-brand-warmgray leading-relaxed max-w-xl">
                  {t('phil.text')}
                </p>
                <button
                  id="btn-discover-story"
                  onClick={() => setIsAboutOpen(true)}
                  className="mt-2 text-xs font-sans tracking-widest text-brand-charcoal hover:text-brand-terracotta font-medium flex items-center gap-1.5 transition-colors duration-200 group uppercase"
                >
                  {t('phil.more')}
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          ) : (
            
            /* --- CATEGORY PRODUCTS GRID VIEW --- */
            <motion.div
              key="products-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ProductGrid
                products={products}
                category={activeCategory}
                categories={categories}
                onBack={() => setActiveCategory(null)}
                onSelectProduct={(prod) => setSelectedProduct(prod)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- ELITE MODALS & DRAWERS --- */}

      {/* 1. Product Detail Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* 2. Shopping Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
          />
        )}
      </AnimatePresence>

      {/* 3. About "Hikayemiz" Brand Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <AboutModal
            isOpen={isAboutOpen}
            onClose={() => setIsAboutOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Elegant Minimal Footer */}
      <footer className="border-t border-brand-sand/40 bg-brand-sand/10 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-sans tracking-widest text-brand-warmgray/90">
          <div className="flex items-center gap-2">
            <span>{t('footer.istanbul')}</span>
          </div>
          <div className="flex gap-6">
            <button
              id="footer-about"
              onClick={() => setIsAboutOpen(true)}
              className="hover:text-brand-charcoal transition-colors"
            >
              {t('nav.story')}
            </button>
            <button
              id="footer-seramik"
              onClick={() => setActiveCategory('seramik')}
              className="hover:text-brand-charcoal transition-colors"
            >
              {t('nav.ceramic')}
            </button>
            <button
              id="footer-clothing"
              onClick={() => setActiveCategory('houte-couture')}
              className="hover:text-brand-charcoal transition-colors"
            >
              {t('footer.clothes')}
            </button>
            <button
              id="footer-decor"
              onClick={() => setActiveCategory('ev-to-home')}
              className="hover:text-brand-charcoal transition-colors"
            >
              {t('footer.decor')}
            </button>
          </div>
          <div className="text-[10px] text-brand-warmgray/60 italic">
            {t('footer.motto')}
          </div>
        </div>
      </footer>

    </div>
  );
}
