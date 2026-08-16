import { Product, CoverSettings, CategoryItem } from './types';
import { fetchStoreData, saveStoreData } from './supabase';

export const INITIAL_PRODUCTS: Product[] = [
  // --- HOUTE COUTURE (Clothes) ---
  {
    id: 'hc-kaftan',
    title: 'Zümrüt Yeşili El Nakışlı Kaftan',
    category: 'houte-couture',
    subcategory: 'Kaftan & Kimono',
    price: 4850,
    image: '/images/products/green_kaftan_3.jpg',
    images: [
      '/images/products/green_kaftan_3.jpg',
      '/images/products/green_kaftan_1.jpg',
      '/images/products/green_kaftan_2.jpg',
      '/images/products/green_kaftan_4.jpg'
    ],
    story: 'Fas esintilerini ve asil el emeğini taşıyan bu başyapıt kaftan, derin zümrüt yeşili ham keten dokusu ve sırtındaki elmas formlu görkemli el nakışıyla göz kamaştırıyor. Nakışta yer alan şamanik motifler, kuşlar ve filler geleneksel anlatıları taşırken; kol manşetlerindeki rengarenk işlemeler ve pratik yan cepleriyle modern bohem şıklığın zirvesini sunar.',
    condition: 'Limitli Özel Seri',
    material: '%100 Doğal Ham Keten',
    dimensions: 'Standart Beden (Oversize)',
    isSecondHand: false,
    createdAt: '2026-07-18T12:00:00Z'
  },
  {
    id: 'hc-teal-peacock',
    title: 'Petrol Yeşili Tavuskuşu El Nakışlı Sabahlık',
    category: 'houte-couture',
    subcategory: 'Kaftan & Kimono',
    price: 5100,
    image: '/images/products/teal_peacock_1.jpg',
    images: [
      '/images/products/teal_peacock_1.jpg',
      '/images/products/teal_peacock_2.jpg'
    ],
    story: 'Zengin petrol yeşili tonlarındaki ham keten kumaş üzerine sırt bölgesinde zarif tavuskuşu nakış motifi işlenmiş özel tasarım. Kızıl saçlı modelimiz üzerinde sergilenen bu özgün parça; manşet nakış detayları, eforsuz bohem duruşu ve dökümlü yapısıyla şıklığı ve konforu yeniden tanımlıyor.',
    condition: 'Atölye Özel Üretimi (Tek Adet)',
    material: '%100 El Dokuması Ham Keten',
    dimensions: 'Standart Beden (Oversize S - M - L)',
    isSecondHand: false,
    createdAt: '2026-08-11T15:55:00Z'
  },
  {
    id: 'hc-black-peacock',
    title: 'Siyah Tavuskuşu El Nakışlı Sabahlık',
    category: 'houte-couture',
    subcategory: 'Kaftan & Kimono',
    price: 4950,
    image: '/images/products/black_peacock_1.jpg',
    images: [
      '/images/products/black_peacock_1.jpg',
      '/images/products/black_peacock_2.jpg'
    ],
    story: 'Doğal siyah ham keten dokusu üzerine sırt bölgesinde usta ellerce tek tek işlenmiş muhteşem tavuskuşu nakış detayı. Zarafeti, mistik enerjiyi ve zamansız lüksü bir araya getiren bu özel tasarım; kol manşetlerindeki etnik işlemeleri ve rahat oversize kesimiyle gardırobunuzun en nadide parçası olmaya aday.',
    condition: 'Atölye Özel Üretimi (Limitli Adet)',
    material: '%100 Ham Keten',
    dimensions: 'Standart Beden (Oversize S - M - L)',
    isSecondHand: false,
    createdAt: '2026-08-11T15:10:00Z'
  },
  {
    id: 'hc-2',
    title: 'Nostalji Örgü Hırka',
    category: 'houte-couture',
    subcategory: 'Hırka & Yelek',
    price: 1950,
    image: '/images/products/prod_img_16.jpg',
    images: ['/images/products/prod_img_16.jpg'],
    story: '1980\'lerden kalma bu ikinci el hırka, el örgüsü olup tiftik yün karışımıdır. Yumuşak yapısı, omuzlarındaki zarif desenleri ve vintage sedef düğmeleriyle tam bir dönem parçasıdır.',
    condition: 'Mükemmel (Vintage Second-Hand)',
    material: 'Tiftik & Merino Yün Karışımı',
    dimensions: 'S - M uyumlu',
    isSecondHand: true,
    createdAt: '2026-07-08T14:30:00Z'
  },
  {
    id: 'hc-3',
    title: 'Organik Clay Kimono',
    category: 'houte-couture',
    subcategory: 'Kaftan & Kimono',
    price: 2800,
    image: '/images/products/prod_img_6.jpg',
    images: ['/images/products/prod_img_6.jpg'],
    story: 'Sürdürülebilir tarımla elde edilmiş organik pamuk ipliklerinden dokunmuş, kök boyama kil renginde şık ve bohem bir kimono. Ev giyiminde ve plaj sonrasında eforsuz zarafet sunar.',
    condition: 'Yeni Koleksiyon',
    material: '%100 Organik Pamuk',
    dimensions: 'Unisex S/M/L',
    isSecondHand: false,
    createdAt: '2026-07-12T10:15:00Z'
  },
  {
    id: 'hc-4',
    title: 'Antik Detaylı Saten Bluz',
    category: 'houte-couture',
    subcategory: 'Elbise & Tunik',
    price: 1680,
    image: '/images/products/prod_img_5.jpg',
    images: ['/images/products/prod_img_5.jpg'],
    story: 'Yumuşak mat satenden üretilmiş, göğüs kısmında narin dantel işlemeleri barındıran bu bluz, gardırobunuza nostaljik bir hava katacak nadide bir parça.',
    condition: 'Çok İyi (Vintage)',
    material: 'Doğal İpek & Viskoz Karışımı',
    dimensions: 'M Beden',
    isSecondHand: true,
    createdAt: '2026-07-14T11:00:00Z'
  },

  // --- SERAMİK (Ceramics) ---
  {
    id: 'ser-1',
    title: 'Wabi-Sabi Ham Kum Vazo',
    category: 'seramik',
    subcategory: 'Vazo & Saksı',
    price: 1150,
    image: '/images/products/prod_img_15.jpg',
    images: ['/images/products/prod_img_15.jpg'],
    story: 'Didi Home atölyesinde şamot çamuruyla elle şekillendirilen bu vazo, kusurların mükemmelliğini simgeler. Sırsız, pürüzlü ve kumsu dokusuyla her bakışta toprağın ham enerjisini hissettirir.',
    condition: 'El Yapımı Sanatçı Eseri',
    material: 'Doğal Şamot Çamuru',
    dimensions: 'Yükseklik: 24 cm | Çap: 14 cm',
    isSecondHand: false,
    createdAt: '2026-07-15T09:00:00Z'
  },
  {
    id: 'ser-2',
    title: 'Terracotta İkili Çay Seti',
    category: 'seramik',
    subcategory: 'Fincan & Tabak',
    price: 850,
    image: '/images/products/prod_img_2.jpg',
    images: ['/images/products/prod_img_2.jpg'],
    story: 'Geleneksel terracotta çamurundan çarkta çekilerek üretilmiş, içi gıda uyumlu şeffaf sırlı, dışı ise toprağın sıcak mat dokusunu koruyan iki adet narin çay/kahve bardağı.',
    condition: 'El Yapımı',
    material: 'Kırmızı Terracotta Kil',
    dimensions: 'Hacim: 180 ml | Adet: 2',
    isSecondHand: false,
    createdAt: '2026-07-11T16:00:00Z'
  },
  {
    id: 'ser-3',
    title: 'Organik Formlu Meyvelik',
    category: 'seramik',
    subcategory: 'Kase & Meyvelik',
    price: 1450,
    image: '/images/products/prod_img_8.jpg',
    images: ['/images/products/prod_img_8.jpg'],
    story: 'Tabiatın asimetrik çizgilerinden ilham alan devasa meyvelik. Masanızda heykelsi bir odak noktası oluştururken, fırında kendiliğinden oluşan kahverengi benekleriyle benzersizdir.',
    condition: 'El Yapımı Sanatçı Eseri',
    material: 'Yüksek Derece Stoneware Çamuru',
    dimensions: 'Çap: 32 cm | Yükseklik: 8 cm',
    isSecondHand: false,
    createdAt: '2026-07-05T13:20:00Z'
  },
  {
    id: 'ser-4',
    title: 'Toprak Sır Altı Buhurdanlık',
    category: 'seramik',
    subcategory: 'Heykel & Buhurdanlık',
    price: 680,
    image: '/images/products/prod_img_14.jpg',
    images: ['/images/products/prod_img_14.jpg'],
    story: 'Uçucu yağlar ile yaşam alanınızı şifalandırmanız için tasarlanan el yapımı buhurdanlık. İki parçalı pratik kullanımı ve minimalist dairesel delikleriyle göz yormayan estetik bir obje.',
    condition: 'El Yapımı',
    material: 'Seramik Sır Altı Kil',
    dimensions: 'Yükseklik: 11 cm | Genişlik: 10 cm',
    isSecondHand: false,
    createdAt: '2026-07-09T15:45:00Z'
  },

  // --- EV TO HOME (Home Decor / Second Hand) ---
  {
    id: 'eh-1',
    title: 'Pirinç Antik İkili Şamdan',
    category: 'ev-to-home',
    subcategory: 'Şamdan & Mumluk',
    price: 1750,
    image: '/images/ev-illustration.jpg',
    images: ['/images/ev-illustration.jpg'],
    story: '1970\'li yıllardan kalma, pirinç döküm tekniğiyle üretilmiş şamdan seti. Zamanın narin patinasını taşıyan bu pirinç ikili, sofralarınıza ve şömine üstlerinize vintage ruhunu taşır.',
    condition: 'Mükemmel (Vintage Patinalı)',
    material: 'Masif Pirinç',
    dimensions: 'Yükseklik: 20 cm ve 25 cm',
    isSecondHand: true,
    createdAt: '2026-07-06T10:00:00Z'
  },
  {
    id: 'eh-2',
    title: 'Hasır Kenarlı El Aynası',
    category: 'ev-to-home',
    subcategory: 'Ayna & Çerçeve',
    price: 980,
    image: '/images/products/prod_img_17.jpg',
    images: ['/images/products/prod_img_17.jpg'],
    story: 'Palmiye yapraklarının ince el işçiliğiyle örülmesiyle çerçevelenmiş, bohem yatak odalarının ve dinlendirici makyaj masalarının vazgeçilmezi olan el yapımı dekoratif ayna.',
    condition: 'Çok İyi (Ekolojik Sanat)',
    material: 'Doğal Hasır & Cam Ayna',
    dimensions: 'Genişlik: 28 cm | Yükseklik: 40 cm',
    isSecondHand: false,
    createdAt: '2026-07-13T17:10:00Z'
  },
  {
    id: 'eh-3',
    title: 'Kök Boyalı Vintage Kilim Kırlent',
    category: 'ev-to-home',
    subcategory: 'Kırlent & Tekstil',
    price: 890,
    image: '/images/products/prod_img_9.jpg',
    images: ['/images/products/prod_img_9.jpg'],
    story: 'Anadolu\'da 50 yılı aşkın bir geçmişe sahip, kök boyalı yün kilimlerden seçilerek dönüştürülmüş özel kırlent kılıfı. Arkası pamuk astarlı ve gizli fermuarlıdır.',
    condition: 'Koleksiyonluk Vintage',
    material: '%100 El Dokuması Yün Kilim',
    dimensions: '40 cm x 40 cm',
    isSecondHand: true,
    createdAt: '2026-07-02T11:20:00Z'
  },
  {
    id: 'eh-4',
    title: 'Alabaster Heykelsi Taş Küre',
    category: 'ev-to-home',
    subcategory: 'Antika & Buluntu',
    price: 1250,
    image: '/images/products/prod_img_1.jpg',
    images: ['/images/products/prod_img_1.jpg'],
    story: 'Mermerin saydam kardeşi alabaster taşından el tornasında şekillendirilmiş, dinlendirici krem-bej tonlarında dekoratif obje. Güneş ışığı altında yarı saydam asil bir parıltı yayar.',
    condition: 'Vintage Buluntu',
    material: 'Doğal Alabaster Taşı',
    dimensions: 'Çap: 12 cm',
    isSecondHand: true,
    createdAt: '2026-07-16T15:00:00Z'
  }
];

export const getStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  const stored = localStorage.getItem('didi_home_products');
  if (stored) {
    try {
      const parsed: Product[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local storage products', e);
      return INITIAL_PRODUCTS;
    }
  }
  return INITIAL_PRODUCTS;
};

export const fetchProductsFromServer = async (): Promise<Product[]> => {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  
  // 1. Cloud First (Supabase)
  try {
    const cloudProducts = await fetchStoreData<Product[]>('products', INITIAL_PRODUCTS);
    if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
      localStorage.setItem('didi_home_products', JSON.stringify(cloudProducts));
      return cloudProducts;
    }
  } catch (e) {
    console.warn('[Cloud] Supabase products fetch error:', e);
  }

  // 2. Fallback to local dev API if running on Vite dev server
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('didi_home_products', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn('Local disk API not reachable, falling back to localStorage');
  }
  return getStoredProducts();
};

export const saveProducts = (products: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('didi_home_products', JSON.stringify(products));
    
    // 1. Save to Supabase Cloud
    saveStoreData('products', products).catch(err => {
      console.warn('[Cloud] Failed to sync products to Supabase:', err);
    });

    // 2. Persist permanently to disk file via local API if in dev mode
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products)
    }).catch(err => console.warn('Could not sync products to disk file:', err));
  }
};

export const DEFAULT_COVERS: CoverSettings = {
  hauteCoutureCover: '/images/haute-couture-cover.jpg',
  ceramicCover: '/images/ceramic-cover.jpg',
  homeCover: '/images/ev-illustration.jpg',
  homeDesignBanner: '/images/ev-to-home-cover.jpg'
};

export const getStoredCovers = (): CoverSettings => {
  if (typeof window === 'undefined') return DEFAULT_COVERS;
  const stored = localStorage.getItem('didi_home_covers');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_COVERS,
        ...parsed
      };
    } catch (e) {
      console.error('Failed to parse local storage covers', e);
      return DEFAULT_COVERS;
    }
  }
  return DEFAULT_COVERS;
};

export const fetchCoversFromServer = async (): Promise<CoverSettings> => {
  if (typeof window === 'undefined') return DEFAULT_COVERS;

  // 1. Cloud First (Supabase)
  try {
    const cloudCovers = await fetchStoreData<CoverSettings>('covers', DEFAULT_COVERS);
    if (cloudCovers && typeof cloudCovers === 'object') {
      const merged = { ...DEFAULT_COVERS, ...cloudCovers };
      localStorage.setItem('didi_home_covers', JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn('[Cloud] Supabase covers fetch error:', e);
  }

  // 2. Fallback to local dev API
  try {
    const res = await fetch('/api/covers');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const merged = { ...DEFAULT_COVERS, ...data };
        localStorage.setItem('didi_home_covers', JSON.stringify(merged));
        return merged;
      }
    }
  } catch (e) {
    console.warn('Local disk API not reachable for covers, falling back to localStorage');
  }
  return getStoredCovers();
};

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'houte-couture',
    title: 'Haute Couture',
    titleEn: 'Haute Couture',
    subtitle: 'Özel Tasarım Nakışlı Kıyafetler',
    subtitleEn: 'Bespoke Embroidered Clothing',
    description: 'Sürdürülebilir, doğal liflerle dokunan kıyafetler ve dönemsel ikinci el gardırop seçkileri.',
    descriptionEn: 'Sustainable clothing woven with natural fibers and seasonal vintage wardrobe selections.',
    image: '/images/haute-couture-cover.jpg',
    subcategories: [
      'Kaftan & Kimono',
      'Hırka & Yelek',
      'Elbise & Tunik',
      'İpek Şal & Aksesuar'
    ]
  },
  {
    id: 'seramik',
    title: 'Seramik',
    titleEn: 'Ceramics',
    subtitle: 'El Yapımı Sanatsal Objeler',
    subtitleEn: 'Handcrafted Art Objects',
    description: 'Sırlı ve ham stoneware çamurundan elle üretilmiş, wabi-sabi felsefesini taşıyan eşsiz çamur formları.',
    descriptionEn: 'Unique clay forms crafted by hand from glazed and raw stoneware clay carrying the wabi-sabi philosophy.',
    image: '/images/ceramic-cover.jpg',
    subcategories: [
      'Vazo & Saksı',
      'Fincan & Tabak',
      'Kase & Meyvelik',
      'Heykel & Buhurdanlık'
    ]
  },
  {
    id: 'ev-to-home',
    title: 'Ev',
    titleEn: 'Home Decor',
    subtitle: 'Zamansız Ev Aksesuarları',
    subtitleEn: 'Timeless Home Accessories',
    description: 'Yaşanmışlık dolu vintage şamdanlar, dekoratif heykeller ve el dokuması sürdürülebilir ev süslemeleri.',
    descriptionEn: 'Vintage candle holders full of character, decorative sculptures, and hand-woven home accents.',
    image: '/images/ev-illustration.jpg',
    subcategories: [
      'Şamdan & Mumluk',
      'Ayna & Çerçeve',
      'Kırlent & Tekstil',
      'Antika & Buluntu'
    ]
  }
];

export const getStoredCategories = (): CategoryItem[] => {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const stored = localStorage.getItem('didi_home_categories');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local storage categories', e);
    }
  }
  return DEFAULT_CATEGORIES;
};

export const fetchCategoriesFromServer = async (): Promise<CategoryItem[]> => {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;

  // 1. Cloud First (Supabase)
  try {
    const cloudCategories = await fetchStoreData<CategoryItem[]>('categories', DEFAULT_CATEGORIES);
    if (Array.isArray(cloudCategories) && cloudCategories.length > 0) {
      localStorage.setItem('didi_home_categories', JSON.stringify(cloudCategories));
      return cloudCategories;
    }
  } catch (e) {
    console.warn('[Cloud] Supabase categories fetch error:', e);
  }

  // 2. Fallback to local dev API
  try {
    const res = await fetch('/api/categories');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem('didi_home_categories', JSON.stringify(data));
        return data;
      }
    }
  } catch (e) {
    console.warn('Local disk API not reachable for categories, falling back to localStorage');
  }
  return getStoredCategories();
};

export const saveCategories = (categories: CategoryItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('didi_home_categories', JSON.stringify(categories));
    
    // 1. Save to Supabase Cloud
    saveStoreData('categories', categories).catch(err => {
      console.warn('[Cloud] Failed to sync categories to Supabase:', err);
    });

    // 2. Persist permanently to disk file via local API
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categories)
    }).catch(err => console.warn('Could not sync categories to disk file:', err));
  }
};

export const saveCovers = (covers: CoverSettings) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('didi_home_covers', JSON.stringify(covers));
    
    // 1. Save to Supabase Cloud
    saveStoreData('covers', covers).catch(err => {
      console.warn('[Cloud] Failed to sync covers to Supabase:', err);
    });

    // 2. Persist permanently to disk file via local API
    fetch('/api/covers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(covers)
    }).catch(err => console.warn('Could not sync covers to disk file:', err));
  }
};
