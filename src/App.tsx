import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

import Header from './components/Header';
import CategoryCard from './components/CategoryCard';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import AboutModal from './components/AboutModal';
// Yönetim paneli ayrı bir dosya olarak yalnızca /admin açılınca indirilir;
// ziyaretçiler panel kodunu hiç indirmez.
const AdminPanel = lazy(() => import('./components/AdminPanel'));

import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { yoneticiMi } from './auth';
import {
  StoreError,
  listVisibleProducts,
  listAllProducts,
  listCategories,
  saveProduct,
  softDeleteProduct,
  restoreProduct,
  saveProductOrder,
  saveCategory,
  softDeleteCategory
} from './store';
import { Product, CartItem, Category, CategoryItem } from './types';
import { useLanguage } from './context/LanguageContext';
import { SIPARIS_AKTIF } from './ozellikler';

interface HistoryState {
  category: Category | null;
  productId: string | null;
  isCartOpen: boolean;
  isAboutOpen: boolean;
  isAdminOpen: boolean;
  /**
   * Bu geçmiş kaydını site İÇİNDEN biz mi ekledik?
   * Doğrudan bağlantıyla gelinen sayfalarda (Instagram'da paylaşılan ürün linki,
   * adres çubuğuna yazılan /admin) "geri" gitmek ziyaretçiyi siteden çıkarır.
   * Pencereler yalnızca bu bayrak doluysa history.back() ile kapatılır.
   */
  pushed?: boolean;
}

/**
 * Yalnızca küçük veriler (kategoriler, kapak ayarları) önbelleğe alınır; sonraki
 * ziyarette ana sayfa kartları anında çizilsin diye. Ürünler bilerek önbelleğe
 * ALINMAZ: eskiden kota dolunca sahte ürünlerin görünmesine yol açıyordu.
 */
const onbellektenOku = <T,>(anahtar: string, varsayilan: T): T => {
  try {
    const v = localStorage.getItem(anahtar);
    return v ? (JSON.parse(v) as T) : varsayilan;
  } catch {
    return varsayilan;
  }
};

const onbellegeYaz = (anahtar: string, deger: unknown) => {
  try {
    localStorage.setItem(anahtar, JSON.stringify(deger));
  } catch {
    /* kota dolu olabilir; önbellek şart değil */
  }
};

const parseUrlState = (): HistoryState => {
  if (typeof window === 'undefined') {
    return { category: null, productId: null, isCartOpen: false, isAboutOpen: false, isAdminOpen: false };
  }
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const searchParams = new URLSearchParams(window.location.search);
  const paramProduct = searchParams.get('product');

  if (path === '/admin') {
    return {
      category: null,
      productId: null,
      isCartOpen: false,
      isAboutOpen: false,
      isAdminOpen: true
    };
  }

  let cat: Category | null = null;
  if (path.startsWith('/category/')) {
    cat = decodeURIComponent(path.replace('/category/', ''));
  }

  return {
    category: cat,
    productId: paramProduct || null,
    isCartOpen: false,
    isAboutOpen: false,
    isAdminOpen: false
  };
};

export default function App() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  // Geri tuşu işleyicisi için ürünlerin güncel kopyası (kapanış değişkeni tuzağını önler)
  const productsRef = useRef<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(() => onbellektenOku('didi_cache_categories', []));
  // İlk çizimde adresten okunur: paylaşılan kategori/ürün bağlantısında ana sayfa bir an görünüp kaybolmasın
  const [activeCategory, setActiveCategory] = useState<Category | null>(() => parseUrlState().category);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Modal / Drawer control states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => parseUrlState().isAdminOpen);
  const [notification, setNotification] = useState<string | null>(null);

  // Veri yükleme durumu
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yuklemeHatasi, setYuklemeHatasi] = useState<string | null>(null);

  // Yönetici oturumu (Supabase Auth)
  const [oturum, setOturum] = useState<Session | null>(null);
  const [sifreYenilemeModu, setSifreYenilemeModu] = useState(false);
  const isAdmin = yoneticiMi(oturum);

  // Initialize products & categories & covers & cart & history state on load
  useEffect(() => {
    // Eski sürümden kalan büyük önbellek anahtarlarını temizle (tarayıcı kotası dolmasın)
    try {
      [
        'didi_home_products', 'didi_products', 'didi_home_covers', 'didi_covers', 'didi_cache_covers',
        'didi_home_categories', 'didi_categories', 'didi_cache_ver'
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      /* önemli değil */
    }

    const initial = parseUrlState();
    setActiveCategory(initial.category);
    setIsAdminOpen(initial.isAdminOpen);

    // Set initial replaceState so the current history entry has a full state object
    const currentUrl = window.location.pathname + window.location.search;
    window.history.replaceState(initial, '', currentUrl);

    const storedCart = localStorage.getItem('didi_home_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // --- Yönetici oturumu ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setOturum(data.session));
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((olay, session) => {
      setOturum(session);
      // E-postadaki "şifre belirle" bağlantısıyla gelindi
      if (olay === 'PASSWORD_RECOVERY') setSifreYenilemeModu(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- Veri yükleme ---
  // Yönetici girişi yapılınca taslaklar dahil tüm ürünler yeniden yüklenir.
  // Veri gelmezse örnek katalog GÖSTERİLMEZ; hata mesajı gösterilir (Altın kural 4).
  const veriyiYukle = useCallback(async () => {
    try {
      const [urunler, kategoriler] = await Promise.all([
        isAdmin ? listAllProducts() : listVisibleProducts(),
        listCategories()
      ]);
      setProducts(urunler);
      setCategories(kategoriler);
      setYuklemeHatasi(null);
      onbellegeYaz('didi_cache_categories', kategoriler);

      // Doğrudan ürün bağlantısıyla gelindiyse ve kullanıcı HÂLÂ o üründeyse aç.
      // (Veri geç gelirse kullanıcının kapattığı pencere yeniden açılmasın.)
      const acikUrunId = window.history.state?.productId;
      if (acikUrunId) {
        const bulunan = urunler.find((u) => u.id === acikUrunId);
        if (bulunan) setSelectedProduct(bulunan);
      }
    } catch (e) {
      console.error('[Veri] Yüklenemedi:', e);
      setYuklemeHatasi(e instanceof Error ? e.message : String(e));
    } finally {
      setYukleniyor(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    veriyiYukle();
  }, [veriyiYukle]);

  // Listen for browser / phone hardware / gesture back & forward buttons (Step-by-step back)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // NOT: Buradaki veriler bilerek localStorage'dan yeniden okunmaz.
      // Önbellek doluysa sorun yoktu; boş ya da kota nedeniyle yazılamamışsa
      // geri tuşuna basan ziyaretçiye örnek (sahte) ürünler gösteriliyordu.
      const state: HistoryState = event.state || parseUrlState();

      setIsAdminOpen(Boolean(state.isAdminOpen));
      setIsCartOpen(Boolean(state.isCartOpen));
      setIsAboutOpen(Boolean(state.isAboutOpen));
      setActiveCategory(state.category || null);

      if (state.productId) {
        const found = productsRef.current.find(p => p.id === state.productId);
        setSelectedProduct(found || null);
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Step-by-step History Navigation Handlers
  const handleSelectCategory = (catId: Category | null) => {
    if (catId === activeCategory && !selectedProduct && !isCartOpen && !isAboutOpen && !isAdminOpen) return;

    const url = catId ? `/category/${catId}` : '/';
    const newState: HistoryState = {
      category: catId,
      productId: null,
      isCartOpen: false,
      isAboutOpen: false,
      isAdminOpen: false
    };

    window.history.pushState(newState, '', url);
    setActiveCategory(catId);
    setSelectedProduct(null);
    setIsCartOpen(false);
    setIsAboutOpen(false);
    setIsAdminOpen(false);
  };

  const handleSelectProduct = (product: Product) => {
    const url = activeCategory ? `/category/${activeCategory}?product=${product.id}` : `/?product=${product.id}`;
    const newState: HistoryState = {
      category: activeCategory,
      productId: product.id,
      isCartOpen: false,
      isAboutOpen: false,
      isAdminOpen: false,
      pushed: true
    };

    window.history.pushState(newState, '', url);
    setSelectedProduct(product);
  };

  const handleCloseProduct = () => {
    if (window.history.state?.productId && window.history.state?.pushed) {
      window.history.back();
    } else {
      const url = activeCategory ? `/category/${activeCategory}` : '/';
      const newState: HistoryState = {
        category: activeCategory,
        productId: null,
        isCartOpen: false,
        isAboutOpen: false,
        isAdminOpen: false
      };
      window.history.replaceState(newState, '', url);
      setSelectedProduct(null);
    }
  };

  const handleOpenCart = () => {
    const newState: HistoryState = {
      category: activeCategory,
      productId: selectedProduct?.id || null,
      isCartOpen: true,
      isAboutOpen: false,
      isAdminOpen: false,
      pushed: true
    };
    window.history.pushState(newState, '');
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    if (window.history.state?.isCartOpen && window.history.state?.pushed) {
      window.history.back();
    } else {
      setIsCartOpen(false);
    }
  };

  const handleOpenAbout = () => {
    const newState: HistoryState = {
      category: activeCategory,
      productId: selectedProduct?.id || null,
      isCartOpen: false,
      isAboutOpen: true,
      isAdminOpen: false,
      pushed: true
    };
    window.history.pushState(newState, '');
    setIsAboutOpen(true);
  };

  const handleCloseAbout = () => {
    if (window.history.state?.isAboutOpen && window.history.state?.pushed) {
      window.history.back();
    } else {
      setIsAboutOpen(false);
    }
  };

  const handleCloseAdmin = () => {
    // Panelde yapılan değişiklikler zaten bellekteki listede; yeniden okumaya gerek yok.
    if (window.history.state?.isAdminOpen && window.history.state?.pushed) {
      window.history.back();
    } else {
      const newState: HistoryState = {
        category: null,
        productId: null,
        isCartOpen: false,
        isAboutOpen: false,
        isAdminOpen: false
      };
      window.history.pushState(newState, '', '/');
      setIsAdminOpen(false);
    }
  };

  // Ürün listesinin güncel kopyasını ref'te tut
  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  // Sekme başlığı ve açıklama: açık ürün / kategoriye göre güncellenir
  // (tarayıcı geçmişi, sekmeler ve arama motorları için)
  useEffect(() => {
    const varsayilanBaslik = 'Didi Home · El Yapımı Seramik, Nakışlı Kaftan ve Vintage Ev Objeleri';
    const aciklamaEtiketi = document.querySelector('meta[name="description"]');
    if (!aciklamaEtiketi?.getAttribute('data-varsayilan')) {
      aciklamaEtiketi?.setAttribute('data-varsayilan', aciklamaEtiketi.getAttribute('content') || '');
    }
    const varsayilanAciklama = aciklamaEtiketi?.getAttribute('data-varsayilan') || '';

    if (isAdminOpen) {
      document.title = 'Yönetim Paneli · Didi Home';
    } else if (selectedProduct) {
      const baslik = language === 'en' && selectedProduct.titleEn ? selectedProduct.titleEn : selectedProduct.title;
      document.title = `${baslik} · Didi Home`;
      const hikaye = (language === 'en' && selectedProduct.storyEn) || selectedProduct.story || '';
      aciklamaEtiketi?.setAttribute('content', hikaye.slice(0, 160) || varsayilanAciklama);
    } else if (activeCategory) {
      const kategori = categories.find((c) => c.id === activeCategory);
      const ad = kategori ? (language === 'en' && kategori.titleEn ? kategori.titleEn : kategori.title) : activeCategory;
      document.title = `${ad} · Didi Home`;
      aciklamaEtiketi?.setAttribute('content', kategori?.description || varsayilanAciklama);
    } else {
      document.title = varsayilanBaslik;
      aciklamaEtiketi?.setAttribute('content', varsayilanAciklama);
    }
  }, [isAdminOpen, selectedProduct, activeCategory, categories, language]);

  // Scroll to top on category change (fixes scrolled home page issue)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeCategory]);

  // Sync cart to local storage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    onbellegeYaz('didi_home_cart', newCart);
  };

  // Notification trigger
  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // --- ACTIONS ---

  // --- KAYIT YARDIMCISI ---
  // Tüm yazma işlemleri buradan geçer ve veritabanının yanıtı BEKLENİR.
  // Başarı mesajı yalnızca kayıt gerçekten tamamlanınca gösterilir (Altın kural 7).
  // Hata olursa ekrandaki liste değişmez.
  const kaydet = async (islem: () => Promise<void>, basariMesaji: string): Promise<boolean> => {
    try {
      await islem();
      triggerNotification(basariMesaji);
      return true;
    } catch (err) {
      console.error('[Kayıt] İşlem tamamlanamadı:', err);
      const ayrinti = err instanceof StoreError ? err.message : '';
      triggerNotification(
        language === 'tr'
          ? `Kaydedilemedi, değişikliğiniz uygulanmadı. ${ayrinti}`
          : `Could not save; your change was not applied. ${ayrinti}`
      );
      return false;
    }
  };

  const urunKayitMesaji = (u: Product) =>
    language === 'tr'
      ? u.status === 'taslak'
        ? `"${u.title}" taslak olarak kaydedildi (sitede görünmez).`
        : `"${u.title}" kaydedildi ve yayında.`
      : u.status === 'taslak'
        ? `"${u.title}" saved as draft (hidden from the store).`
        : `"${u.title}" saved and published.`;

  // Add Product (Admin) — yeni ürün listenin en başına gelir
  const handleAddProduct = (newProduct: Product) =>
    kaydet(async () => {
      const enUst = products.reduce((min, u) => Math.min(min, u.sortOrder ?? 0), 0);
      const kayitli = await saveProduct({ ...newProduct, sortOrder: enUst - 1 });
      setProducts((onceki) => [kayitli, ...onceki]);
    }, urunKayitMesaji(newProduct));

  // Update Product (Admin) — yalnızca bu ürünün satırı yazılır
  const handleUpdateProduct = (updatedProduct: Product) =>
    kaydet(async () => {
      const kayitli = await saveProduct(updatedProduct);
      setProducts((onceki) => onceki.map((u) => (u.id === kayitli.id ? kayitli : u)));
    }, urunKayitMesaji(updatedProduct));

  // Reorder Products (Admin) — ekranda anında değişir, kayıt başarısız olursa geri alınır
  const handleReorderProducts = (reorderedProducts: Product[]) => {
    const oncekiSira = products;
    const yeniSira = reorderedProducts.map((u, i) => ({ ...u, sortOrder: i }));
    setProducts(yeniSira);
    kaydet(
      () => saveProductOrder(yeniSira.map((u) => u.id)),
      language === 'tr' ? 'Sıralama kaydedildi.' : 'Order saved.'
    ).then((basarili) => {
      if (!basarili) setProducts(oncekiSira);
    });
  };

  // Delete Product (Admin) — kalıcı silmez, çöp kutusuna taşır
  const handleDeleteProduct = (id: string) => {
    const hedef = products.find((u) => u.id === id);
    return kaydet(async () => {
      await softDeleteProduct(id);
      setProducts((onceki) => onceki.filter((u) => u.id !== id));
    }, language === 'tr'
      ? `"${hedef?.title || id}" çöp kutusuna taşındı. Çöp Kutusu sekmesinden geri getirebilirsiniz.`
      : `"${hedef?.title || id}" moved to trash. You can restore it from the Trash tab.`);
  };

  // Restore Product (Admin)
  const handleRestoreProduct = (urun: Product) =>
    kaydet(async () => {
      await restoreProduct(urun.id);
      setProducts((onceki) =>
        [...onceki.filter((u) => u.id !== urun.id), { ...urun, deletedAt: null }].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        )
      );
    }, language === 'tr' ? `"${urun.title}" geri getirildi.` : `"${urun.title}" restored.`);

  // Add New Category (Admin)
  const handleAddCategory = (newCat: CategoryItem) =>
    kaydet(async () => {
      const kayitli = await saveCategory(newCat, categories.length);
      setCategories((onceki) => [...onceki, kayitli]);
    }, language === 'tr'
      ? `"${newCat.title}" kategorisi oluşturuldu.`
      : `Category "${newCat.title}" created.`);

  // Update Category (Admin)
  const handleUpdateCategory = (updatedCat: CategoryItem) =>
    kaydet(async () => {
      const sira = Math.max(0, categories.findIndex((c) => c.id === updatedCat.id));
      const kayitli = await saveCategory(updatedCat, sira);
      setCategories((onceki) => onceki.map((c) => (c.id === kayitli.id ? kayitli : c)));
    }, language === 'tr'
      ? `"${updatedCat.title}" kategorisi güncellendi.`
      : `Category "${updatedCat.title}" updated.`);

  // Delete Category (Admin) — içinde ürün varsa veri katmanı engeller
  const handleDeleteCategory = (catId: string) => {
    const hedef = categories.find((c) => c.id === catId);
    return kaydet(async () => {
      await softDeleteCategory(catId);
      setCategories((onceki) => onceki.filter((c) => c.id !== catId));
    }, language === 'tr'
      ? `"${hedef?.title || catId}" kategorisi silindi.`
      : `Category "${hedef?.title || catId}" deleted.`);
  };


  // Add product to cart
  const handleAddToCart = (product: Product) => {
    if (product.status === 'satildi') {
      triggerNotification(language === 'tr' ? 'Bu parça satıldı.' : 'This piece has been sold.');
      return;
    }

    const varOlan = cart.find((item) => item.product.id === product.id);
    // Sepette fotoğraf listesine gerek yok; tarayıcı depolamasını şişirmesin
    const sepetUrunu: Product = { ...product, images: undefined };
    const updatedCart = varOlan
      ? cart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      : [...cart, { product: sepetUrunu, quantity: 1 }];

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

  // Mağazada gösterilecek ürünler: taslaklar ve çöp kutusundakiler hariç.
  // (Yönetici girişi açıkken products listesi taslakları da içerir.)
  const vitrinUrunleri = products.filter((u) => !u.deletedAt && u.status !== 'taslak');

  // Count items per category
  const getCategoryCount = (cat: Category) => {
    return vitrinUrunleri.filter((u) => u.category === cat).length;
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Ana sayfa vitrin ızgarası. Tailwind sınıfları sabit yazılmalı (dinamik üretilemez).
  const vitrinDuzeni = (() => {
    const adet = categories.length;
    if (adet <= 1) return { kapsayici: 'max-w-md', kart: (_: number) => '' };
    if (adet === 2) return { kapsayici: 'md:grid-cols-2 max-w-4xl', kart: (_: number) => '' };
    if (adet === 4) return { kapsayici: 'md:grid-cols-2 lg:grid-cols-4 max-w-7xl', kart: (_: number) => '' };
    const kalan = adet % 3;
    return {
      kapsayici: 'md:grid-cols-6 max-w-6xl',
      kart: (sira: number) => {
        if (kalan === 1 && sira === adet - 1) return 'md:col-span-2 md:col-start-3';
        if (kalan === 2 && sira === adet - 2) return 'md:col-span-2 md:col-start-2';
        return 'md:col-span-2';
      }
    };
  })();

  // Kategori kodunu görünen ada çevirir (yeni eklenen kategoriler dahil)
  const kategoriAdi = (kategoriId: string) => {
    const kategori = categories.find((c) => c.id === kategoriId);
    if (!kategori) return kategoriId;
    return language === 'en' && kategori.titleEn ? kategori.titleEn : kategori.title;
  };

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

        <Suspense
          fallback={
            <div className="min-h-[85vh] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-brand-sand border-t-brand-terracotta rounded-full animate-spin" />
            </div>
          }
        >
        <AdminPanel
          products={products}
          categories={categories}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onReorderProducts={handleReorderProducts}
          onRestoreProduct={handleRestoreProduct}
          isAdmin={isAdmin}
          oturumEposta={oturum?.user?.email ?? null}
          sifreYenilemeModu={sifreYenilemeModu}
          onSifreYenilendi={() => setSifreYenilemeModu(false)}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onClose={handleCloseAdmin}
        />
        </Suspense>
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
        onOpenCart={handleOpenCart}
        onOpenAbout={handleOpenAbout}
        onResetCategory={() => handleSelectCategory(null)}
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
              {/* Dynamic Showcase Grid
                  Kategori sayısına göre düzen:
                    1 → tek kart · 2 → iki sütun · 4 → tablette 2×2, geniş ekranda 4 sütun
                    3 ve diğerleri → üç sütun; son satırda kalan kartlar ORTALANIR
                  (Ortalamak için 6 sütunlu ızgara, her kart 2 sütun kaplar.) */}
              <div className={`grid grid-cols-1 ${vitrinDuzeni.kapsayici} gap-6 md:gap-8 lg:gap-10 mx-auto w-full items-stretch`}>
                {categories.map((cat, sira) => {
                  const title = language === 'en' && cat.titleEn
                    ? cat.titleEn
                    : (cat.title || (cat.id === 'houte-couture' ? t('cat.hc.title') : cat.id === 'seramik' ? t('cat.ceramic.title') : cat.id === 'ev-to-home' ? t('cat.home.title') : cat.id));

                  const subtitle = language === 'en' && cat.subtitleEn
                    ? cat.subtitleEn
                    : (cat.subtitle !== undefined ? cat.subtitle : (cat.id === 'houte-couture' ? t('cat.hc.subtitle') : cat.id === 'seramik' ? t('cat.ceramic.subtitle') : cat.id === 'ev-to-home' ? t('cat.home.subtitle') : ''));

                  // Tek kaynak: kategorinin kendi vitrin görseli (panelden düzenlenen)
                  const image = cat.image || '/images/ceramic-cover.jpg';

                  return (
                    <div key={cat.id} className={`flex ${vitrinDuzeni.kart(sira)}`}>
                      <CategoryCard
                        id={cat.id}
                        title={title}
                        subtitle={subtitle}
                        image={image}
                        itemCount={yukleniyor ? undefined : getCategoryCount(cat.id)}
                        onSelect={(selectedId) => handleSelectCategory(selectedId)}
                      />
                    </div>
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
                  onClick={handleOpenAbout}
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
                products={vitrinUrunleri}
                yukleniyor={yukleniyor}
                yuklemeHatasi={yuklemeHatasi}
                category={activeCategory}
                categories={categories}
                onBack={() => handleSelectCategory(null)}
                onSelectProduct={(prod) => handleSelectProduct(prod)}
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
            kategoriAdi={kategoriAdi(selectedProduct.category)}
            onClose={handleCloseProduct}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* 2. Shopping Cart Drawer */}
      <AnimatePresence>
        {SIPARIS_AKTIF && isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={handleCloseCart}
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
            onClose={handleCloseAbout}
          />
        )}
      </AnimatePresence>

      {/* Elegant Minimal Footer */}
      <footer className="border-t border-brand-sand/40 bg-brand-sand/10 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-sans tracking-widest text-brand-warmgray/90">
          <div className="flex items-center gap-2">
            <span>{t('footer.istanbul')}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button
              id="footer-about"
              onClick={handleOpenAbout}
              className="hover:text-brand-charcoal transition-colors"
            >
              {t('nav.story')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                id={`footer-${cat.id}`}
                onClick={() => handleSelectCategory(cat.id)}
                className="hover:text-brand-charcoal transition-colors"
              >
                {/* İlk üç kategori için mevcut footer metinleri korunur */}
                {cat.id === 'seramik'
                  ? t('nav.ceramic')
                  : cat.id === 'houte-couture'
                    ? t('footer.clothes')
                    : cat.id === 'ev-to-home'
                      ? t('footer.decor')
                      : language === 'en' && cat.titleEn
                        ? cat.titleEn
                        : cat.title}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-brand-warmgray/60 italic">
            {t('footer.motto')}
          </div>
        </div>
      </footer>

    </div>
  );
}
