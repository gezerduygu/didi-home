export type Category = string;

export interface CategoryItem {
  id: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
  description?: string;
  descriptionEn?: string;
  image?: string;
  subcategories?: string[];
}

export type ProductStatus = 'taslak' | 'yayinda' | 'satildi';

export interface Product {
  id: string;
  title: string;
  category: Category;
  subcategory?: string;
  price: number;
  image: string;
  images?: string[];
  story: string;
  condition?: string; // e.g., "Mükemmel (Vintage)", "Yeni", "Zamanın Patinasıyla (Retro)"
  material?: string;  // e.g., "%100 Saf Keten", "Şamot Çamuru", "Masif Pirinç"
  dimensions?: string; // e.g., "38 cm x 45 cm", "Yükseklik: 22 cm"
  isSecondHand?: boolean;
  createdAt: string;

  // --- Asama 1 ile eklenenler ---
  /** taslak: sitede gorunmez | yayinda: gorunur | satildi: gorunur, sepete eklenemez */
  status?: ProductStatus;
  /** Magaza akisindaki sira */
  sortOrder?: number;
  /** Dolu ise urun cop kutusunda demektir */
  deletedAt?: string | null;
  updatedAt?: string;

  // --- Ingilizce alanlar (bos ise Turkcesi gosterilir) ---
  titleEn?: string;
  storyEn?: string;
  conditionEn?: string;
  materialEn?: string;
  dimensionsEn?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CoverSettings {
  hauteCoutureCover: string;
  ceramicCover: string;
  homeCover: string;
  homeDesignBanner: string;
}

