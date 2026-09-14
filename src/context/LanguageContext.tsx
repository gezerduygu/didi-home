import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

type Language = 'tr' | 'en';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateProduct: (product: Product) => Product;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  tr: {
    // Header
    'nav.story': 'Hikayemiz',
    'nav.cart': 'SEPET',
    'nav.home': 'Didi Home',
    'nav.houteCouture': 'Haute Couture',
    'nav.ceramic': 'Seramik',
    'nav.homeCategory': 'Ev',

    // Homepage categories
    'cat.hc.title': 'Haute Couture',
    'cat.hc.subtitle': 'Özel Tasarım Nakışlı Kıyafetler',
    'cat.ceramic.title': 'Seramik',
    'cat.ceramic.subtitle': 'El Yapımı Sanatsal Objeler',
    'cat.home.title': 'Ev',
    'cat.home.subtitle': 'Zamansız Ev Aksesuarları',

    // Philosophy section
    'phil.badge': 'SANATLA YENİDEN RUH KAZANAN YAŞAYAN BİR KOLEKSİYON',
    'phil.text': 'Didi Home; tüketmek yerine var olanı koruyarak sanatla yeniden ruh kazandırma felsefesiyle doğdu. Ev renovasyonundan seramiğe, özel tasarım kıyafetten dekorasyona kadar hayata geçen tüm orijinal tasarımlarımız, her gün yenisi eklenen yaşayan bir koleksiyonun parçasıdır.',
    'phil.more': 'Hikayemiz ve Felsefemiz Hakkında',

    // Footer
    'footer.istanbul': 'Didi Home © 2026 · İSTANBUL',
    'footer.admin': 'YÖNETİCİ GİRİŞİ',
    'footer.story': 'HİKAYEMİZ',
    'footer.ceramic': 'SERAMİK',
    'footer.clothes': 'KIYAFET',
    'footer.decor': 'EV',
    'footer.motto': 'Sürdürülebilir, El Yapımı ve Zamansız Yaşam Öğeleri',

    // Product Grid (Category view)
    'grid.all_collections': 'Tüm Koleksiyonlar',
    'grid.items_listed': 'adet ürün listelendi',
    'grid.filter.all': 'TÜMÜ',
    'grid.filter.handmade': 'EL YAPIMI',
    'grid.filter.vintage': 'VİNTAGE / SECOND-HAND',
    'grid.sort.label': 'SIRALA:',
    'grid.sort.default': 'Önerilen',
    'grid.sort.price_asc': 'Fiyat: Artan',
    'grid.sort.price_desc': 'Fiyat: Azalan',
    'grid.sort.newest': 'En Yeniler',
    'grid.no_products': 'Bu filtrelere uygun ürün bulunmuyor.',
    'grid.clear_filters': 'Filtreleri Temizle',
    'grid.hc.desc': 'Sürdürülebilir, doğal liflerle dokunan kıyafetler ve dönemsel ikinci el gardırop seçkileri.',
    'grid.ceramic.desc': 'Sırlı ve ham stoneware çamurundan elle üretilmiş, wabi-sabi felsefesini taşıyan eşsiz çamur formları.',
    'grid.home.desc': 'Yaşanmışlık dolu vintage şamdanlar, dekoratif heykeller ve el dokuması sürdürülebilir ev süslemeleri.',

    // Product Detail
    'prod.curator_note': 'Atölye Sorumlusu Notu',
    'prod.specs': 'Özellikler',
    'prod.spec.condition': 'Kondisyon',
    'prod.spec.material': 'Malzeme',
    'prod.spec.dimensions': 'Ölçüler',
    'prod.badge.unique': 'Eşsiz Eser',
    'prod.badge.second_hand': 'İkinci El',
    'prod.add_to_cart': 'Atölyeden Sepete Ekle',
    'prod.sold_out': 'Tükendi',
    'prod.close_details': 'Detayları Kapat',

    // Cart Drawer
    'cart.title': 'Alışveriş Sepetiniz',
    'cart.empty': 'Sepetiniz Boş',
    'cart.explore': 'Koleksiyonu Keşfet',
    'cart.currency': 'TL',
    'cart.subtotal': 'Ara Toplam',
    'cart.checkout': 'Ödeme Adımına Geç',
    'cart.remove': 'Seçili ürünü sepetten çıkar',
    'cart.continue': 'Devam Et',
    'cart.sustainability_fee': 'Atölye ve Sürdürülebilirlik Katkısı',
    'cart.qty': 'Adet',
    'cart.free_shipping': 'Kargo ücretsiz',
    'cart.success_title': 'Siparişiniz Başarıyla Alındı!',
    'cart.success_text': 'Teşekkürler! Siparişiniz atölyemizde hazırlanmaya başlandı. En kısa sürede sizinle iletişime geçeceğiz.',
    'cart.success_continue': 'Alışverişe Devam Et',
    'cart.complete_order': 'Siparişi Tamamla',
    'cart.checkout_form.name': 'Adınız Soyadınız',
    'cart.checkout_form.email': 'E-posta Adresiniz',
    'cart.checkout_form.phone': 'Telefon Numaranız',
    'cart.checkout_form.address': 'Teslimat Adresi',
    'cart.checkout_form.confirm': 'Siparişi Onayla',
    'cart.checkout_form.cancel': 'İptal',
    'cart.checkout_form.payment': 'Ödeme Bilgileri',
    'cart.checkout_form.payment_method': 'Kapıda Nakit / Havale ile Ödeme',
    'cart.checkout_form.note': 'Sipariş Notu (İsteğe Bağlı)',

    // About brand modal
    'about.story': 'Hikayemiz & Felsefemiz',
    'about.title': 'Tasarım Tutkusu & \n Yaşayan Bir Koleksiyon',
    'about.para1': 'Didi Home, yıllar içinde farklı disiplinlerdeki tasarım tutkusunun ve el emeğinin yansıması olarak ortaya çıktı. Felsefesinin merkezinde tüketmek yerine, var olanı koruyarak sanatla yeniden ruh kazandırmak yatar.',
    'about.para2': 'Didi Home; ev renovasyonundan kıyafet tasarımına, seramikten dekorasyona kadar bugüne dek hayata geçirdiğim tamamı orijinal parçalardan oluşan ve her gün yenisi eklenen yaşayan bir koleksiyondur.',
    'about.para3': "Didi Home'a hoş geldiniz.",
    'about.value1.title': 'ÖZGÜN TASARIM',
    'about.value1.desc': 'Farklı Disiplinlerin Uyumu',
    'about.value2.title': 'KORUMA & SANAT',
    'about.value2.desc': 'Var Olana Yeniden Ruh Kazandırmak',
    'about.value3.title': 'YAŞAYAN KOLEKSİYON',
    'about.value3.desc': 'Her Gün Eklenen Orijinal Parçalar',
    'about.quote': '"Var olanı koruyarak sanatla yeniden ruh kazandırmak." · Didi Home',
    'about.explore_space': 'KOLEKSİYONU KEŞFET',

    // Admin panel toast or common actions
    'admin.added_success': 'başarıyla atölyeye eklendi ve yayına alındı!',
    'admin.updated_success': 'başarıyla güncellendi!',
    'admin.deleted_success': 'Ürün başarıyla silindi.',
    'admin.reset_success': 'Katalog başarıyla varsayılan fabrika ayarlarına sıfırlandı!'
  },
  en: {
    // Header
    'nav.story': 'Our Story',
    'nav.cart': 'CART',
    'nav.home': 'Didi Home',
    'nav.houteCouture': 'Haute Couture',
    'nav.ceramic': 'Ceramic',
    'nav.homeCategory': 'Home',

    // Homepage categories
    'cat.hc.title': 'Haute Couture',
    'cat.hc.subtitle': 'Custom Embroidered Garments',
    'cat.ceramic.title': 'Ceramic',
    'cat.ceramic.subtitle': 'Handcrafted Artistic Objects',
    'cat.home.title': 'Home',
    'cat.home.subtitle': 'Timeless Home Accessories',

    // Philosophy section
    'phil.badge': 'A LIVING COLLECTION BREATHING SOUL THROUGH ART',
    'phil.text': 'Didi Home was born from the philosophy of preserving what already exists and breathing new soul into it through art, rather than mere consumption. From home renovation and ceramics to bespoke fashion and decor, all our original designs form a vibrant, living collection growing every day.',
    'phil.more': 'About Our Story & Philosophy',

    // Footer
    'footer.istanbul': 'Didi Home © 2026 · ISTANBUL',
    'footer.admin': 'ADMIN ACCESS',
    'footer.story': 'OUR STORY',
    'footer.ceramic': 'CERAMIC',
    'footer.clothes': 'CLOTHES',
    'footer.decor': 'HOME DECOR',
    'footer.motto': 'Sustainable, Handcrafted and Timeless Objects for Living',

    // Product Grid (Category view)
    'grid.all_collections': 'All Collections',
    'grid.items_listed': 'products listed',
    'grid.filter.all': 'ALL',
    'grid.filter.handmade': 'HANDMADE',
    'grid.filter.vintage': 'VINTAGE / SECOND-HAND',
    'grid.sort.label': 'SORT BY:',
    'grid.sort.default': 'Recommended',
    'grid.sort.price_asc': 'Price: Low to High',
    'grid.sort.price_desc': 'Price: High to Low',
    'grid.sort.newest': 'Newest',
    'grid.no_products': 'No products match these filters.',
    'grid.clear_filters': 'Clear Filters',
    'grid.hc.desc': 'Sustainable apparel woven with natural fibers and seasonal curated second-hand wardrobes.',
    'grid.ceramic.desc': 'Unique ceramic forms carrying the wabi-sabi philosophy, handcrafted from glazed and raw stoneware clay.',
    'grid.home.desc': 'Vintage candlesticks, decorative sculptures, and hand-woven sustainable home decorations full of history.',

    // Product Detail
    'prod.curator_note': 'Atelier Curator Note',
    'prod.specs': 'Specifications',
    'prod.spec.condition': 'Condition',
    'prod.spec.material': 'Material',
    'prod.spec.dimensions': 'Dimensions',
    'prod.badge.unique': 'Unique Piece',
    'prod.badge.second_hand': 'Second Hand',
    'prod.add_to_cart': 'Add to Cart from Atelier',
    'prod.sold_out': 'Sold Out',
    'prod.close_details': 'Close Details',

    // Cart Drawer
    'cart.title': 'Your Shopping Cart',
    'cart.empty': 'Your Cart is Empty',
    'cart.explore': 'Explore Collections',
    'cart.currency': 'TL',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Proceed to Checkout',
    'cart.remove': 'Remove item from cart',
    'cart.continue': 'Continue',
    'cart.sustainability_fee': 'Atelier & Sustainability Contribution',
    'cart.qty': 'Qty',
    'cart.free_shipping': 'Free shipping',
    'cart.success_title': 'Order Placed Successfully!',
    'cart.success_text': 'Thank you! Your order is being prepared in our workshop. We will contact you as soon as possible.',
    'cart.success_continue': 'Continue Shopping',
    'cart.complete_order': 'Complete Order',
    'cart.checkout_form.name': 'Your Full Name',
    'cart.checkout_form.email': 'Your Email Address',
    'cart.checkout_form.phone': 'Your Phone Number',
    'cart.checkout_form.address': 'Delivery Address',
    'cart.checkout_form.confirm': 'Confirm Order',
    'cart.checkout_form.cancel': 'Cancel',
    'cart.checkout_form.payment': 'Payment Information',
    'cart.checkout_form.payment_method': 'Cash on Delivery / Bank Transfer',
    'cart.checkout_form.note': 'Order Note (Optional)',

    // About brand modal
    'about.story': 'Our Story & Philosophy',
    'about.title': 'Passion for Design & \n A Living Collection',
    'about.para1': 'Didi Home emerged over the years as a reflection of a passion for design across diverse disciplines and dedicated craftsmanship. At the heart of its philosophy lies breathing new soul into what already exists through art and preservation, rather than mere consumption.',
    'about.para2': 'From home renovation to bespoke clothing design, and from ceramics to artisanal decor, Didi Home is a living collection composed entirely of original pieces crafted to this day, with new creations added every day.',
    'about.para3': 'Welcome to Didi Home.',
    'about.value1.title': 'ORIGINAL DESIGN',
    'about.value1.desc': 'Harmony Across Diverse Disciplines',
    'about.value2.title': 'PRESERVE & REVITALIZE',
    'about.value2.desc': 'Breathing Soul into What Exists',
    'about.value3.title': 'LIVING COLLECTION',
    'about.value3.desc': 'Original Pieces Added Daily',
    'about.quote': '"Preserving what exists, breathing new soul through art." · Didi Home',
    'about.explore_space': 'EXPLORE THE COLLECTION',

    // Admin panel toast or common actions
    'admin.added_success': 'successfully added to the atelier and published!',
    'admin.updated_success': 'successfully updated!',
    'admin.deleted_success': 'Product deleted successfully.',
    'admin.reset_success': 'Catalog successfully reset to default settings!'
  }
};

// English Translations for default product titles, materials, conditions and stories
const PRODUCT_TRANSLATIONS: Record<string, Partial<Product>> = {
  'hc-yellow-kaftan': {
    title: 'Yellow Hand-Embroidered Cotton Kaftan',
    story: 'This custom piece in warm yellow tones merges with the breathable texture of natural raw cotton, turning into a unique work of art with traditional hand embroidery on its cuffs and hem. Prepared individually in our atelier, this piece represents the noble stance of the modern, bohemian woman. It offers comfort and luxury together with its side pockets and elegant belt.',
    condition: 'Atelier Limited Production (Single Piece)',
    material: '100% Handwoven Raw Cotton',
    dimensions: 'Oversize (Fits S - M - L)'
  },
  'hc-kaftan': {
    title: 'Emerald Green Hand-Embroidered Kaftan',
    story: 'Carrying Moroccan breezes and noble handwork, this masterpiece kaftan dazzles with its deep emerald green raw linen texture and magnificent diamond-shaped hand embroidery on the back. While shamanic motifs, birds, and elephants reflect traditional stories, the colorful embroideries on the cuffs and its practical side pockets offer the pinnacle of modern bohemian elegance.',
    condition: 'Limited Special Collection',
    material: '100% Natural Raw Linen',
    dimensions: 'Standard Size (Oversize)'
  },
  'hc-1': {
    title: 'Linen Sand Dress',
    story: 'Handcrafted from pure, unprocessed linen, this dress lets your skin breathe on hot summer days with its draped and relaxed cut. It reflects the calmness of sand tones.',
    condition: 'New Collection',
    material: '100% Raw Linen',
    dimensions: 'Standard Size (Oversize)'
  },
  'hc-2': {
    title: 'Nostalgia Knit Cardigan',
    story: 'Dating back to the 1980s, this hand-knit cardigan is a mohair-wool blend. It is a true vintage piece with its soft structure, elegant shoulder patterns, and vintage mother-of-pearl buttons.',
    condition: 'Excellent (Vintage Second-Hand)',
    material: 'Mohair & Merino Wool Blend',
    dimensions: 'Fits S - M'
  },
  'hc-3': {
    title: 'Organic Clay Kimono',
    story: 'Woven from organic cotton yarns obtained through sustainable agriculture, this chic and bohemian kimono is dyed in natural root clay color. It offers effortless elegance for home wear or beach transitions.',
    condition: 'New Collection',
    material: '100% Organic Cotton',
    dimensions: 'Unisex S/M/L'
  },
  'hc-4': {
    title: 'Antique Detailed Satin Blouse',
    story: 'Produced from soft matte satin with delicate lace embroidery on the chest, this blouse is a rare piece that will add a nostalgic atmosphere to your wardrobe.',
    condition: 'Very Good (Vintage)',
    material: 'Natural Silk & Viscose Blend',
    dimensions: 'Size M'
  },
  'ser-1': {
    title: 'Wabi-Sabi Raw Sand Vase',
    story: 'Hand-shaped with chamotte clay in the Didi Home atelier, this vase symbolizes the beauty of imperfections. With its unglazed, rough, and sandy texture, it radiates the raw energy of the earth at every glance.',
    condition: 'Handmade Artist Piece',
    material: 'Natural Chamotte Clay',
    dimensions: 'Height: 24 cm | Diameter: 14 cm'
  },
  'ser-2': {
    title: 'Terracotta Tea Set (Set of 2)',
    story: 'Produced on the wheel from traditional terracotta clay, this set features two delicate tea/coffee cups with a food-safe clear glaze inside, while preserving the warm matte texture of the soil on the outside.',
    condition: 'Handmade',
    material: 'Red Terracotta Clay',
    dimensions: 'Volume: 180 ml | Qty: 2'
  },
  'ser-3': {
    title: 'Organically Formed Fruit Bowl',
    story: 'A massive fruit bowl inspired by nature’s asymmetrical lines. Creating a sculptural focal point on your table, it is completely unique with brown spots occurring naturally during firing.',
    condition: 'Handmade Artist Piece',
    material: 'High-Fired Stoneware Clay',
    dimensions: 'Diameter: 32 cm | Height: 8 cm'
  },
  'ser-4': {
    title: 'Earthy Underglaze Incense Burner',
    story: 'Designed to heal your living space with essential oils, this handmade incense burner is practical with its two-piece design and easy on the eyes with its minimalist circular holes.',
    condition: 'Handmade',
    material: 'Underglaze Ceramic Clay',
    dimensions: 'Height: 11 cm | Width: 10 cm'
  },
  'eh-1': {
    title: 'Brass Antique Candle Holder Set',
    story: 'Dating back to the 1970s, this candle holder set is made using the brass casting technique. Carrying the delicate patina of time, this brass duo brings vintage spirit to your tables and mantels.',
    condition: 'Excellent (Vintage Patina)',
    material: 'Solid Brass',
    dimensions: 'Height: 20 cm and 25 cm'
  },
  'eh-2': {
    title: 'Rattan Hand Mirror',
    story: 'Framed by palm leaves meticulously hand-woven, this decorative hand mirror is an indispensable companion for bohemian bedrooms and restful makeup tables.',
    condition: 'Very Good (Ecological Art)',
    material: 'Natural Rattan & Glass Mirror',
    dimensions: 'Width: 28 cm | Height: 40 cm'
  },
  'eh-3': {
    title: 'Root-Dyed Vintage Kilim Cushion',
    story: 'An exclusive cushion cover selected and transformed from hand-dyed wool kilims in Anatolia, dating back over 50 years. It features cotton lining and a hidden zipper on the back.',
    condition: 'Collectible Vintage',
    material: '100% Handwoven Wool Kilim',
    dimensions: '40 cm x 40 cm'
  },
  'eh-4': {
    title: 'Alabaster Sculptural Stone Sphere',
    story: 'A decorative object shaped on a hand lathe from alabaster stone—the translucent cousin of marble—in relaxing cream-beige tones. It radiates a noble semi-translucent glow under sunlight.',
    condition: 'Vintage Find',
    material: 'Natural Alabaster Stone',
    dimensions: 'Diameter: 12 cm'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('didi_home_lang');
      if (stored === 'en' || stored === 'tr') return stored;
    }
    return 'tr'; // Default language is Turkish
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('didi_home_lang', lang);
    }
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language][key] || key;
  };

  const translateProduct = (product: Product): Product => {
    if (language === 'tr') return product; // Already in Turkish
    
    const translation = PRODUCT_TRANSLATIONS[product.id];
    if (translation) {
      return {
        ...product,
        title: translation.title || product.title,
        story: translation.story || product.story,
        condition: translation.condition || product.condition,
        material: translation.material || product.material,
        dimensions: translation.dimensions || product.dimensions,
      };
    }
    
    // For newly added custom products, if they don't have English translations, we can leave them or do a gentle auto-translation fallback for UI elements
    return product;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateProduct }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
