import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  LogIn, 
  LogOut, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package, 
  Tag, 
  Check, 
  DollarSign, 
  ShoppingBag,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Upload,
  Loader2,
  RotateCcw,
  X,
  Link as LinkIcon,
  CheckCircle2,
  SlidersHorizontal,
  ExternalLink,
  Eye,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Archive,
  Download,
  Undo2
} from 'lucide-react';
import { Product, Category, CategoryItem, ProductStatus } from '../types';
import { listDeletedProducts, exportAll, StoreError } from '../store';
import { gorselYukle } from '../images';
import { cikisYap } from '../auth';
import AdminLogin from './AdminLogin';
import { useLanguage } from '../context/LanguageContext';

interface AdminPanelProps {
  products: Product[];
  categories: CategoryItem[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onReorderProducts?: (products: Product[]) => void;
  onRestoreProduct: (product: Product) => Promise<unknown> | void;
  /** Oturum yönetici e-postasına mı ait? (Asıl koruma veritabanı RLS kurallarıdır.) */
  isAdmin: boolean;
  oturumEposta: string | null;
  /** E-postadaki şifre belirleme bağlantısıyla gelindiyse true */
  sifreYenilemeModu: boolean;
  onSifreYenilendi: () => void;
  onAddCategory: (category: CategoryItem) => void;
  /** Kayıt başarılıysa true döner (vitrin görseli ekranında onay göstermek için) */
  onUpdateCategory: (category: CategoryItem) => Promise<boolean> | void;
  onDeleteCategory: (categoryId: string) => void;
  onClose: () => void;
}

/** Hazır vitrin görselleri — kategori koduna göre. Yeni kategorilerde galeri çıkmaz. */
const COVER_PRESETS: Record<string, { url: string; label: string }[]> = {
  'houte-couture': [
    { url: '/images/haute-couture-cover.jpg', label: 'Klasik Model (Varsayılan)' },
    { url: '/images/products/green_kaftan_3.jpg', label: 'Zümrüt Yeşili Kaftan' },
    { url: '/images/products/teal_peacock_1.jpg', label: 'Petrol Tavuskuşu' },
    { url: '/images/products/black_peacock_1.jpg', label: 'Siyah Tavuskuşu' },
    { url: '/images/products/prod_img_6.jpg', label: 'Clay Kimono' },
    { url: '/images/products/prod_img_16.jpg', label: 'Örgü Hırka' }
  ],
  seramik: [
    { url: '/images/ceramic-cover.jpg', label: 'Wabi Ham Vazo (Varsayılan)' },
    { url: '/images/products/prod_img_15.jpg', label: 'Şamot Kum Vazo' },
    { url: '/images/products/prod_img_2.jpg', label: 'Terracotta Çay Seti' },
    { url: '/images/products/prod_img_8.jpg', label: 'Organik Meyvelik' },
    { url: '/images/products/prod_img_14.jpg', label: 'Sır Altı Buhurdanlık' }
  ],
  'ev-to-home': [
    { url: '/images/ev-illustration.jpg', label: 'Taş Ev Çerçeveli Tablo (Varsayılan)' },
    { url: '/images/products/prod_img_17.jpg', label: 'Hasır Kenarlı Ayna' },
    { url: '/images/products/prod_img_9.jpg', label: 'Vintage Kilim Kırlent' },
    { url: '/images/products/prod_img_1.jpg', label: 'Alabaster Taş Küre' },
    { url: '/images/products/prod_img_10.jpg', label: 'Antik Rustik Kase' }
  ]
};

/** İlk üç kategorinin fabrika vitrin görselleri ("Varsayılana sıfırla" için). */
const VARSAYILAN_VITRIN: Record<string, string> = {
  'houte-couture': '/images/haute-couture-cover.jpg',
  seramik: '/images/ceramic-cover.jpg',
  'ev-to-home': '/images/ev-illustration.jpg'
};

/** Kullanıcıya gösterilecek yükleme hata metni */
const yuklemeHatasi = (err: unknown, dil: 'tr' | 'en') =>
  err instanceof StoreError
    ? err.message
    : dil === 'tr'
      ? 'Görsel yüklenirken bir hata oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.'
      : 'An error occurred while uploading. Check your connection and try again.';

const PRESET_IMAGES: Record<Category, { url: string; label: string }[]> = {
  'houte-couture': [
    { url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600', label: 'Earthy Dress' },
    { url: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=600', label: 'Linen Set' },
    { url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=600', label: 'Wool Knit' },
    { url: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?q=80&w=600', label: 'Vintage Fabric' }
  ],
  'seramik': [
    { url: 'https://images.unsplash.com/photo-1576016770956-debb63d900ee?q=80&w=600', label: 'Rustic Mug' },
    { url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=600', label: 'Earthy Plate' },
    { url: 'https://images.unsplash.com/photo-1525974160448-038cbe7718fc?q=80&w=600', label: 'Handmade Jug' },
    { url: 'https://images.unsplash.com/photo-1565192647048-f997ed8799d4?q=80&w=600', label: 'Wabi Clay Vase' }
  ],
  'ev-to-home': [
    { url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600', label: 'Alabaster Stone' },
    { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=600', label: 'Cozy Blanket' },
    { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=600', label: 'Vintage Table' },
    { url: 'https://images.unsplash.com/photo-1532372320978-9b4d7a92b24d?q=80&w=600', label: 'Dried Florals' }
  ]
};

/**
 * Görsel oran rehberi.
 * Üretim araçlarındaki 16:9 / 4:3 / 1:1 / 3:4 / 9:16 seçenekleriyle aynı dili konuşur.
 * Sitenin kart düzeni dikey 3:4 üzerine kuruludur.
 */
const ORANLAR = [
  { etiket: '16:9', g: 32, y: 18, tavsiye: 'kacinin' },
  { etiket: '4:3', g: 27, y: 20, tavsiye: 'olur' },
  { etiket: '1:1', g: 22, y: 22, tavsiye: 'olur' },
  { etiket: '3:4', g: 18, y: 24, tavsiye: 'onerilen' },
  { etiket: '9:16', g: 14, y: 25, tavsiye: 'kacinin' }
] as const;

function OranRehberi({ language }: { language: 'tr' | 'en' }) {
  return (
    <div className="flex items-end gap-3 flex-wrap mb-2.5">
      {ORANLAR.map((o) => (
        <div key={o.etiket} className="flex flex-col items-center gap-1">
          <div
            style={{ width: o.g, height: o.y }}
            className={`rounded-[1px] border ${
              o.tavsiye === 'onerilen'
                ? 'border-brand-terracotta bg-brand-terracotta/20'
                : o.tavsiye === 'olur'
                ? 'border-brand-warmgray/50 bg-brand-sand/50'
                : 'border-brand-sand border-dashed'
            }`}
          />
          <span
            className={`text-[9px] tracking-wide ${
              o.tavsiye === 'onerilen' ? 'text-brand-terracotta font-semibold' : 'text-brand-warmgray/70'
            }`}
          >
            {o.etiket}
          </span>
        </div>
      ))}
      <span className="text-[10px] text-brand-warmgray/80 leading-snug">
        {language === 'tr'
          ? 'Önerilen: 3:4 · Uyumlu: 1:1, 4:3 · Kaçının: 16:9, 9:16'
          : 'Best: 3:4 · Works: 1:1, 4:3 · Avoid: 16:9, 9:16'}
      </span>
    </div>
  );
}

export default function AdminPanel({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onReorderProducts,
  onRestoreProduct,
  isAdmin,
  oturumEposta,
  sifreYenilemeModu,
  onSifreYenilendi,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onClose
}: AdminPanelProps) {
  const { language, t } = useLanguage();
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragOverProductId, setDragOverProductId] = useState<string | null>(null);
  // Çöp kutusu ve yedekleme
  const [silinenler, setSilinenler] = useState<Product[]>([]);
  const [copYukleniyor, setCopYukleniyor] = useState(false);
  const [geriGetirilenId, setGeriGetirilenId] = useState<string | null>(null);
  const [yedekIndiriliyor, setYedekIndiriliyor] = useState(false);
  
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'covers' | 'trash'>('products');

  // Cover Photos management states
  const [coverUrlInputs, setCoverUrlInputs] = useState<Record<string, string>>({});
  const [coverLoadingKey, setCoverLoadingKey] = useState<string | null>(null);
  const [coverSuccessKey, setCoverSuccessKey] = useState<string | null>(null);
  const [openPresetTrayKey, setOpenPresetTrayKey] = useState<string | null>(null);

  // --- Category Management state ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catFormId, setCatFormId] = useState('');
  const [catFormTitle, setCatFormTitle] = useState('');
  const [catFormTitleEn, setCatFormTitleEn] = useState('');
  const [catFormSubtitle, setCatFormSubtitle] = useState('');
  const [catFormSubtitleEn, setCatFormSubtitleEn] = useState('');
  const [catFormDescription, setCatFormDescription] = useState('');
  const [catFormDescriptionEn, setCatFormDescriptionEn] = useState('');
  const [catFormImage, setCatFormImage] = useState('');
  const [catFormSubcategories, setCatFormSubcategories] = useState<string[]>([]);
  const [catFormNewSub, setCatFormNewSub] = useState('');
  const [isCatUploading, setIsCatUploading] = useState(false);
  const [catError, setCatError] = useState('');

  // Table search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Add/Edit Product Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form fields
  const [formCategory, setFormCategory] = useState<Category>('seramik');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStory, setFormStory] = useState('');
  const [formCondition, setFormCondition] = useState('El Yapımı Sanatçı Eseri');
  const [formMaterial, setFormMaterial] = useState('');
  const [formDimensions, setFormDimensions] = useState('');
  const [formIsSecondHand, setFormIsSecondHand] = useState(false);
  const [formStatus, setFormStatus] = useState<ProductStatus>('yayinda');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formPresetIndex, setFormPresetIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Upload/Drag-drop states
  const [imageSource, setImageSource] = useState<'preset' | 'upload'>('preset');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Auto-slugify helper
  const slugify = (text: string) => {
    const trMap: Record<string, string> = {
      'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'I': 'i', 'İ': 'i',
      'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u'
    };
    return text
      .split('')
      .map(char => trMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Güvenli çıkış (Supabase oturumu kapatılır)
  const handleLogout = () => {
    cikisYap();
  };

  // --- ÇÖP KUTUSU ---
  const copKutusunuYukle = async () => {
    setCopYukleniyor(true);
    try {
      setSilinenler(await listDeletedProducts());
    } catch (e) {
      console.error(e);
      alert(language === 'tr' ? 'Çöp kutusu yüklenemedi. Sayfayı yenileyip tekrar deneyin.' : 'Could not load the trash. Please refresh and try again.');
    } finally {
      setCopYukleniyor(false);
    }
  };

  const handleRestore = async (urun: Product) => {
    setGeriGetirilenId(urun.id);
    try {
      await onRestoreProduct(urun);
      await copKutusunuYukle();
    } finally {
      setGeriGetirilenId(null);
    }
  };

  // --- YEDEK İNDİR ---
  // Tüm katalog tek bir JSON dosyası olarak bilgisayara iner.
  const yedekIndir = async () => {
    setYedekIndiriliyor(true);
    try {
      const veri = await exportAll();
      const blob = new Blob([JSON.stringify(veri, null, 2)], { type: 'application/json' });
      const adres = URL.createObjectURL(blob);
      const baglanti = document.createElement('a');
      baglanti.href = adres;
      baglanti.download = `didi-home-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      baglanti.click();
      URL.revokeObjectURL(adres);
    } catch (e) {
      console.error(e);
      alert(language === 'tr' ? 'Yedek oluşturulamadı. Lütfen tekrar deneyin.' : 'Backup could not be created. Please try again.');
    } finally {
      setYedekIndiriliyor(false);
    }
  };

  // --- CATEGORY ACTIONS ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatFormId('');
    setCatFormTitle('');
    setCatFormTitleEn('');
    setCatFormSubtitle('');
    setCatFormSubtitleEn('');
    setCatFormDescription('');
    setCatFormDescriptionEn('');
    setCatFormImage('/images/ceramic-cover.jpg');
    setCatFormSubcategories([]);
    setCatFormNewSub('');
    setCatError('');
    setIsCatUploading(false);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCatFormId(cat.id);
    setCatFormTitle(cat.title);
    setCatFormTitleEn(cat.titleEn || '');
    setCatFormSubtitle(cat.subtitle || '');
    setCatFormSubtitleEn(cat.subtitleEn || '');
    setCatFormDescription(cat.description || '');
    setCatFormDescriptionEn(cat.descriptionEn || '');
    setCatFormImage(cat.image || VARSAYILAN_VITRIN[cat.id] || '/images/ceramic-cover.jpg');
    setCatFormSubcategories(cat.subcategories ? [...cat.subcategories] : []);
    setCatFormNewSub('');
    setCatError('');
    setIsCatUploading(false);
    setIsCategoryModalOpen(true);
  };

  const handleAddSubcategoryTag = () => {
    const trimmed = catFormNewSub.trim();
    if (trimmed && !catFormSubcategories.includes(trimmed)) {
      setCatFormSubcategories(prev => [...prev, trimmed]);
      setCatFormNewSub('');
    }
  };

  const handleRemoveSubcategoryTag = (index: number) => {
    setCatFormSubcategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleCatImageUpload = async (file: File) => {
    try {
      setIsCatUploading(true);
      const adres = await gorselYukle(file, 'vitrin');
      setCatFormImage(adres);
    } catch (e) {
      console.error('Kategori görseli yüklenemedi', e);
      setCatError(yuklemeHatasi(e, language));
    } finally {
      setIsCatUploading(false);
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = (catFormId.trim() || slugify(catFormTitle)).trim();
    if (!finalId) {
      setCatError(language === 'tr' ? 'Lütfen geçerli bir kategori adı girin.' : 'Please enter a valid category name.');
      return;
    }

    if (!editingCategory && categories.some(c => c.id === finalId)) {
      setCatError(language === 'tr' ? 'Bu kategori kodu (slug) zaten mevcut. Farklı bir isim deneyin.' : 'A category with this ID already exists.');
      return;
    }

    const newCategoryItem: CategoryItem = {
      id: finalId,
      title: catFormTitle.trim() || finalId,
      titleEn: catFormTitleEn.trim() || undefined,
      subtitle: catFormSubtitle.trim() || undefined,
      subtitleEn: catFormSubtitleEn.trim() || undefined,
      description: catFormDescription.trim() || undefined,
      descriptionEn: catFormDescriptionEn.trim() || undefined,
      image: catFormImage || undefined,
      subcategories: catFormSubcategories.length > 0 ? catFormSubcategories : undefined
    };

    if (editingCategory) {
      onUpdateCategory(newCategoryItem);
    } else {
      onAddCategory(newCategoryItem);
    }

    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategoryPrompt = (cat: CategoryItem) => {
    const count = products.filter(p => p.category === cat.id).length;
    const msg = language === 'tr'
      ? `"${cat.title}" kategorisini silmek istediğinizden emin misiniz?` + (count > 0 ? `\n\nDikkat: Bu kategoriye ait ${count} adet ürün bulunmaktadır!` : '')
      : `Are you sure you want to delete category "${cat.title}"?` + (count > 0 ? `\n\nWarning: There are ${count} products in this category!` : '');

    if (confirm(msg)) {
      onDeleteCategory(cat.id);
    }
  };

  // --- VİTRİN (KAPAK) GÖRSELLERİ ---
  // Tek kaynak: kategorinin kendi görseli (categories.image). Bu sekme ile
  // Kategori Yönetimi'ndeki görsel alanı AYNI değeri düzenler.
  const vitrinGorseliKaydet = async (katId: string, gorsel: string) => {
    const kategori = categories.find((c) => c.id === katId);
    if (!kategori) return;
    setCoverLoadingKey(katId);
    try {
      const sonuc = await onUpdateCategory({ ...kategori, image: gorsel });
      if (sonuc !== false) {
        setCoverSuccessKey(katId);
        setTimeout(() => setCoverSuccessKey(null), 3000);
      }
    } finally {
      setCoverLoadingKey(null);
    }
  };

  const handleCoverUpload = async (katId: string, file: File) => {
    try {
      setCoverLoadingKey(katId);
      const adres = await gorselYukle(file, 'vitrin');
      await vitrinGorseliKaydet(katId, adres);
    } catch (err) {
      console.error('Vitrin görseli yüklenemedi', err);
      alert(yuklemeHatasi(err, language));
      setCoverLoadingKey(null);
    }
  };

  const handleCoverUrlSubmit = (katId: string) => {
    const url = coverUrlInputs[katId]?.trim();
    if (!url) return;
    setCoverUrlInputs((onceki) => ({ ...onceki, [katId]: '' }));
    vitrinGorseliKaydet(katId, url);
  };

  const handleCoverSelectPreset = (katId: string, presetUrl: string) => {
    setOpenPresetTrayKey(null);
    vitrinGorseliKaydet(katId, presetUrl);
  };

  const handleCoverResetSingle = (katId: string) => {
    const varsayilan = VARSAYILAN_VITRIN[katId];
    if (varsayilan) vitrinGorseliKaydet(katId, varsayilan);
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    const defaultCat = categories[0]?.id || 'seramik';
    const firstSub = categories.find(c => c.id === defaultCat)?.subcategories?.[0] || '';
    setEditingProduct(null);
    setFormCategory(defaultCat);
    setFormSubcategory(firstSub);
    setFormTitle('');
    setFormPrice('');
    setFormStory('');
    setFormCondition(language === 'tr' ? 'El Yapımı Sanatçı Eseri' : 'Handcrafted Artist Piece');
    setFormMaterial('');
    setFormDimensions('');
    setFormIsSecondHand(false);
    setFormStatus('yayinda');
    const presets = PRESET_IMAGES[defaultCat] || PRESET_IMAGES['seramik'];
    setFormImages([presets[0]?.url || '/images/ceramic-cover.jpg']);
    setFormPresetIndex(0);
    setImageSource('preset');
    setUploadError('');
    setIsUploading(false);
    setIsDragging(false);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormCategory(product.category);
    setFormSubcategory(product.subcategory || '');
    setFormTitle(product.title);
    setFormPrice(product.price.toString());
    setFormStory(product.story);
    setFormCondition(product.condition || '');
    setFormMaterial(product.material || '');
    setFormDimensions(product.dimensions || '');
    setFormIsSecondHand(product.isSecondHand ?? false);
    setFormStatus(product.status ?? 'yayinda');
    
    const initialImages = product.images && product.images.length > 0 ? product.images : [product.image];
    setFormImages(initialImages);
    
    // Check if image matches one of the presets
    const presets = PRESET_IMAGES[product.category];
    const matchIdx = presets?.findIndex(p => p.url === product.image) ?? -1;
    setFormPresetIndex(matchIdx >= 0 && initialImages.length === 1 ? matchIdx : null);
    setImageSource(matchIdx >= 0 && initialImages.length === 1 ? 'preset' : 'upload');
    setUploadError('');
    setIsUploading(false);
    setIsDragging(false);
    
    setIsFormOpen(true);
  };

  // File Upload Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = (Array.from(files) as File[]).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setUploadError(
        language === 'tr' 
          ? 'Lütfen geçerli görsel dosyaları seçin.' 
          : 'Please select valid image files.'
      );
      return;
    }

    setIsUploading(true);
    setUploadError('');

    // Fotoğraflar sırayla yüklenir; biri başarısız olsa bile diğerleri kaybolmaz.
    const hatalar: string[] = [];
    try {
      for (const file of imageFiles) {
        try {
          const adres = await gorselYukle(file, 'urunler');
          setFormImages(prev => [...prev, adres]);
          setFormPresetIndex(null);
        } catch (err) {
          console.error('Görsel yüklenemedi:', file.name, err);
          hatalar.push(`${file.name}: ${yuklemeHatasi(err, language)}`);
        }
      }
      if (hatalar.length > 0) setUploadError(hatalar.join(' · '));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const imageFiles = (Array.from(files) as File[]).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      setUploadError(
        language === 'tr' 
          ? 'Lütfen geçerli görsel dosyaları seçin.' 
          : 'Please select valid image files.'
      );
      return;
    }

    setIsUploading(true);
    setUploadError('');

    // Fotoğraflar sırayla yüklenir; biri başarısız olsa bile diğerleri kaybolmaz.
    const hatalar: string[] = [];
    try {
      for (const file of imageFiles) {
        try {
          const adres = await gorselYukle(file, 'urunler');
          setFormImages(prev => [...prev, adres]);
          setFormPresetIndex(null);
        } catch (err) {
          console.error('Görsel yüklenemedi:', file.name, err);
          hatalar.push(`${file.name}: ${yuklemeHatasi(err, language)}`);
        }
      }
      if (hatalar.length > 0) setUploadError(hatalar.join(' · '));
    } finally {
      setIsUploading(false);
    }
  };

  // Item Drag and Drop Reordering Handlers
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    setFormImages(prev => {
      const updated = [...prev];
      const temp = updated[draggedIndex];
      updated.splice(draggedIndex, 1);
      updated.splice(index, 0, temp);
      return updated;
    });
    setDraggedIndex(index);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
  };

  // Form Submit (Save / Edit)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formPrice || !formStory || formImages.length === 0 || !formImages[0]) {
      alert(
        language === 'tr'
          ? 'Lütfen tüm zorunlu alanları doldurun.'
          : 'Please fill in all required fields.'
      );
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert(
        language === 'tr'
          ? 'Lütfen geçerli bir fiyat girin.'
          : 'Please enter a valid price.'
      );
      return;
    }

    if (editingProduct) {
      // Editing
      const updated: Product = {
        ...editingProduct,
        title: formTitle,
        category: formCategory,
        subcategory: formSubcategory.trim() || undefined,
        price: priceNum,
        image: formImages[0],
        images: formImages,
        story: formStory,
        condition: formCondition || undefined,
        material: formMaterial || undefined,
        dimensions: formDimensions || undefined,
        isSecondHand: formIsSecondHand,
        status: formStatus,
      };
      onUpdateProduct(updated);
    } else {
      // Adding
      const created: Product = {
        id: `custom-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        subcategory: formSubcategory.trim() || undefined,
        price: priceNum,
        image: formImages[0],
        images: formImages,
        story: formStory,
        condition: formCondition || undefined,
        material: formMaterial || undefined,
        dimensions: formDimensions || undefined,
        isSecondHand: formIsSecondHand,
        status: formStatus,
        createdAt: new Date().toISOString()
      };
      onAddProduct(created);
    }

    setIsFormOpen(false);
  };

  // Delete product with customized alert
  const handleDelete = (product: Product) => {
    const message = language === 'tr'
      ? `"${product.title}" çöp kutusuna taşınsın mı?\n\nÜrün sitede artık görünmez. Yönetim panelindeki Çöp Kutusu sekmesinden istediğiniz zaman geri getirebilirsiniz.`
      : `Move "${product.title}" to the trash?\n\nIt will no longer be visible on the store. You can restore it any time from the Trash tab.`;
    if (confirm(message)) {
      onDeleteProduct(product.id);
    }
  };

  // --- Product Drag & Drop Reordering Handlers ---
  const handleProductDragStart = (e: React.DragEvent, id: string) => {
    setDraggedProductId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleProductDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProductId !== id) {
      setDragOverProductId(id);
    }
  };

  const handleProductDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = draggedProductId || e.dataTransfer.getData('text/plain');
    setDraggedProductId(null);
    setDragOverProductId(null);

    if (!sourceId || sourceId === targetId) return;

    const fromIndex = products.findIndex(p => p.id === sourceId);
    const toIndex = products.findIndex(p => p.id === targetId);

    if (fromIndex === -1 || toIndex === -1) return;

    const updated = [...products];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    if (onReorderProducts) {
      onReorderProducts(updated);
    }
  };

  const handleProductDragEnd = () => {
    setDraggedProductId(null);
    setDragOverProductId(null);
  };

  // Move product up or down by 1 position (Touch / 1-click fallback)
  const handleMoveProductStep = (productId: string, direction: 'up' | 'down') => {
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= products.length) return;

    const updated = [...products];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);

    if (onReorderProducts) {
      onReorderProducts(updated);
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.story.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const totalCategoriesCount = categories.length;
  const totalSubcategoriesCount = Array.from(
    new Set([
      ...categories.flatMap(c => c.subcategories || []),
      ...products.map(p => p.subcategory).filter(Boolean)
    ])
  ).length;

  // Giriş yapılmamışsa, yönetici değilse ya da şifre belirleme bağlantısıyla gelindiyse
  if (sifreYenilemeModu || !isAdmin) {
    return (
      <AdminLogin
        oturumEposta={oturumEposta}
        sifreYenilemeModu={sifreYenilemeModu}
        onSifreYenilendi={onSifreYenilendi}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige text-brand-charcoal font-sans">
      {/* Top Admin Header */}
      <div className="border-b border-brand-sand/40 bg-brand-sand/10 py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="group flex items-center gap-2 text-xs font-sans tracking-widest text-brand-warmgray hover:text-brand-charcoal transition-colors uppercase"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {language === 'tr' ? 'Mağazaya Geri Dön' : 'Back to Store'}
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] tracking-[0.3em] text-brand-terracotta uppercase font-bold">Didi Home</span>
            <h1 className="font-serif text-xl font-light text-brand-charcoal">
              {language === 'tr' ? 'Yönetim & Atölye Paneli' : 'Admin & Atelier Panel'}
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={yedekIndir}
              disabled={yedekIndiriliyor}
              className="flex items-center gap-1.5 text-xs font-sans tracking-widest text-brand-warmgray hover:text-brand-charcoal transition-colors uppercase disabled:opacity-50"
              title={language === 'tr' ? 'Tüm kataloğu bilgisayarınıza JSON dosyası olarak indirin' : 'Download the whole catalog as a JSON file'}
            >
              {yedekIndiriliyor ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span className="hidden sm:inline">{language === 'tr' ? 'YEDEK İNDİR' : 'BACKUP'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-sans tracking-widest text-brand-warmgray hover:text-brand-terracotta transition-colors uppercase"
              title={language === 'tr' ? 'Güvenli Çıkış' : 'Logout Securely'}
            >
              <LogOut size={13} />
              {language === 'tr' ? 'ÇIKIŞ' : 'LOGOUT'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-brand-sand/50 mb-8 gap-3 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-3 sm:px-5 font-sans text-xs font-medium tracking-widest uppercase transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'products'
                ? 'border-brand-terracotta text-brand-charcoal font-semibold'
                : 'border-transparent text-brand-warmgray hover:text-brand-charcoal'
            }`}
          >
            <Package size={15} />
            <span>{language === 'tr' ? 'Ürün Yönetimi' : 'Product Management'}</span>
            <span className="text-[10px] bg-brand-sand/50 px-2 py-0.5 rounded text-brand-charcoal font-normal">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-3 sm:px-5 font-sans text-xs font-medium tracking-widest uppercase transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'categories'
                ? 'border-brand-terracotta text-brand-charcoal font-semibold'
                : 'border-transparent text-brand-warmgray hover:text-brand-charcoal'
            }`}
          >
            <Tag size={15} />
            <span>{language === 'tr' ? 'Kategori Yönetimi' : 'Category Management'}</span>
            <span className="text-[10px] bg-brand-sand/50 px-2 py-0.5 rounded text-brand-charcoal font-normal">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('covers')}
            className={`pb-3 px-3 sm:px-5 font-sans text-xs font-medium tracking-widest uppercase transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'covers'
                ? 'border-brand-terracotta text-brand-charcoal font-semibold'
                : 'border-transparent text-brand-warmgray hover:text-brand-charcoal'
            }`}
          >
            <ImageIcon size={15} />
            <span>{language === 'tr' ? 'Kapak Fotoğrafları' : 'Cover Photos'}</span>
            <span className="text-[10px] bg-brand-terracotta text-white font-medium px-2 py-0.5 rounded-full shadow-xs">
              {categories.length} {language === 'tr' ? 'VİTRİN' : 'SHOWCASES'}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trash');
              copKutusunuYukle();
            }}
            className={`pb-3 px-3 sm:px-5 font-sans text-xs font-medium tracking-widest uppercase transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'trash'
                ? 'border-brand-terracotta text-brand-charcoal font-semibold'
                : 'border-transparent text-brand-warmgray hover:text-brand-charcoal'
            }`}
          >
            <Archive size={15} />
            <span>{language === 'tr' ? 'Çöp Kutusu' : 'Trash'}</span>
          </button>
        </div>

        {/* TAB 1: ÜRÜN YÖNETİMİ */}
        {activeTab === 'products' && (
          <div>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              <div className="bg-brand-beige border border-brand-sand/40 p-5 rounded-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-sand/20 rounded-full flex items-center justify-center text-brand-terracotta">
                  <Package size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-brand-warmgray tracking-widest uppercase block">
                    {language === 'tr' ? 'Katalogdaki Ürünler' : 'Catalog Products'}
                  </span>
                  <span className="text-xl font-serif font-semibold text-brand-charcoal">
                    {products.length} {language === 'tr' ? 'Adet' : 'Items'}
                  </span>
                </div>
              </div>

              <div className="bg-brand-beige border border-brand-sand/40 p-5 rounded-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-sand/20 rounded-full flex items-center justify-center text-brand-terracotta">
                  <DollarSign size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-brand-warmgray tracking-widest uppercase block">
                    {language === 'tr' ? 'Toplam Portföy Değeri' : 'Total Catalog Value'}
                  </span>
                  <span className="text-xl font-serif font-semibold text-brand-charcoal">
                    {totalValue.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                  </span>
                </div>
              </div>

              <div className="bg-brand-beige border border-brand-sand/40 p-5 rounded-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-sand/20 rounded-full flex items-center justify-center text-brand-terracotta">
                  <Sparkles size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-brand-warmgray tracking-widest uppercase block">
                    {language === 'tr' ? 'Ana Kategoriler' : 'Main Categories'}
                  </span>
                  <span className="text-xl font-serif font-semibold text-brand-charcoal">
                    {totalCategoriesCount} {language === 'tr' ? 'Kategori' : 'Categories'}
                  </span>
                </div>
              </div>

              <div className="bg-brand-beige border border-brand-sand/40 p-5 rounded-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-brand-sand/20 rounded-full flex items-center justify-center text-brand-terracotta">
                  <Layers size={18} />
                </div>
                <div>
                  <span className="text-[9px] text-brand-warmgray tracking-widest uppercase block">
                    {language === 'tr' ? 'Alt Sınıflandırmalar' : 'Subcategories'}
                  </span>
                  <span className="text-xl font-serif font-semibold text-brand-charcoal">
                    {totalSubcategoriesCount} {language === 'tr' ? 'Başlık' : 'Titles'}
                  </span>
                </div>
              </div>

            </div>

            {/* Search, Filter and Actions Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-brand-sand/10 border border-brand-sand/30 p-4 rounded-sm mb-6">
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-warmgray" />
                  <input
                    type="text"
                    placeholder={language === 'tr' ? 'Ürün adı, alt başlık veya açıklamasında ara...' : 'Search in product name, subcategory or description...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-brand-beige border border-brand-sand/60 focus:border-brand-charcoal pl-9 pr-4 py-2 rounded-[2px] text-xs text-brand-charcoal outline-none transition-all"
                  />
                </div>

                {/* Dynamic Category Filter dropdown */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-brand-beige border border-brand-sand/60 focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-xs text-brand-charcoal outline-none transition-all cursor-pointer"
                >
                  <option value="all">{language === 'tr' ? 'Tüm Kategoriler' : 'All Categories'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'en' && cat.titleEn ? cat.titleEn : cat.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleOpenAdd}
                  className="sm:hidden py-2 px-4 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs tracking-wider uppercase transition-colors rounded-[2px] flex items-center justify-center gap-1.5 font-medium shadow-sm"
                >
                  <Plus size={14} />
                  <span>{language === 'tr' ? 'YENİ ÜRÜN EKLE' : 'ADD PRODUCT'}</span>
                </button>
              </div>

              {/* Actions Buttons Group */}
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={handleOpenAdd}
                  className="py-2.5 px-4 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs tracking-widest uppercase transition-colors rounded-[2px] flex items-center gap-2 font-medium shrink-0 shadow-sm"
                >
                  <Plus size={14} />
                  <span>{language === 'tr' ? 'YENİ ÜRÜN EKLE' : 'ADD NEW PRODUCT'}</span>
                </button>
              </div>
            </div>

            {/* Products Management Table/List */}
            <div className="bg-brand-beige border border-brand-sand/40 rounded-sm overflow-hidden shadow-sm">
              {/* Informative Reordering Tip Banner */}
              <div className="flex items-center gap-2 text-[11px] text-brand-warmgray px-4 py-2.5 bg-brand-sand/20 border-b border-brand-sand/30 font-sans">
                <ArrowUpDown size={13} className="text-brand-terracotta shrink-0" />
                <span>
                  {language === 'tr' 
                    ? '💡 İpucu: Ürünleri basılı tutup yukarı-aşağı sürükleyerek veya yanlarındaki oklara basarak mağaza akışındaki sıralamasını anında değiştirebilirsiniz.' 
                    : '💡 Tip: Drag and drop products or use the arrows to instantly change their order in the storefront feed.'}
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <p className="text-sm text-brand-warmgray/80 italic">
                    {language === 'tr' ? 'Kriterlere uygun ürün bulunamadı.' : 'No products found matching the criteria.'}
                  </p>
                  <button
                    onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
                    className="mt-3 text-xs font-sans tracking-widest text-brand-terracotta underline hover:text-brand-charcoal transition-colors uppercase"
                  >
                    {language === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters'}
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-brand-sand/20 border-b border-brand-sand/40 text-brand-warmgray font-semibold tracking-wider uppercase text-[10px]">
                        <th className="py-4 px-3 w-10 text-center">#</th>
                        <th className="py-4 px-2 w-12 text-center">{language === 'tr' ? 'Sıra' : 'Move'}</th>
                        <th className="py-4 px-4 w-16">{language === 'tr' ? 'Görsel' : 'Image'}</th>
                        <th className="py-4 px-5">{language === 'tr' ? 'Ürün Adı' : 'Product Name'}</th>
                        <th className="py-4 px-5">{language === 'tr' ? 'Kategori & Alt Sınıf' : 'Category & Subcategory'}</th>
                        <th className="py-4 px-5">{language === 'tr' ? 'Fiyat' : 'Price'}</th>
                        <th className="py-4 px-5">{language === 'tr' ? 'Malzeme / Ölçü' : 'Material / Dimensions'}</th>
                        <th className="py-4 px-5 text-right">{language === 'tr' ? 'İşlemler' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-sand/20">
                      {filteredProducts.map((prod) => {
                        const globalIndex = products.findIndex(p => p.id === prod.id);
                        const isDraggingThis = draggedProductId === prod.id;
                        const isOverThis = dragOverProductId === prod.id;
                        const isFirst = globalIndex === 0;
                        const isLast = globalIndex === products.length - 1;

                        const catMatch = categories.find(c => c.id === prod.category);
                        const displayCat = catMatch 
                          ? (language === 'en' && catMatch.titleEn ? catMatch.titleEn : catMatch.title)
                          : prod.category;

                        return (
                          <tr
                            key={prod.id}
                            draggable
                            onDragStart={(e) => handleProductDragStart(e, prod.id)}
                            onDragOver={(e) => handleProductDragOver(e, prod.id)}
                            onDrop={(e) => handleProductDrop(e, prod.id)}
                            onDragEnd={handleProductDragEnd}
                            className={`transition-all duration-150 select-none ${
                              isDraggingThis
                                ? 'opacity-40 bg-brand-sand/40'
                                : isOverThis
                                ? 'bg-brand-terracotta/15 border-t-2 border-brand-terracotta'
                                : 'hover:bg-brand-sand/10'
                            }`}
                          >
                            {/* Sequence Number */}
                            <td className="py-3 px-3 text-center text-[11px] font-sans font-semibold text-brand-warmgray/70">
                              <span className="inline-block min-w-[20px] py-0.5 px-1 bg-brand-sand/30 rounded text-[10px] text-brand-charcoal">
                                {globalIndex + 1}
                              </span>
                            </td>

                            {/* Drag Handle & Up/Down Arrows */}
                            <td className="py-3 px-2 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                <div
                                  className="p-1 text-brand-warmgray/60 hover:text-brand-charcoal cursor-grab active:cursor-grabbing"
                                  title={language === 'tr' ? 'Sıralamak için basılı tutup sürükleyin' : 'Drag to reorder'}
                                >
                                  <GripVertical size={15} />
                                </div>
                                <div className="flex flex-col -space-y-1">
                                  <button
                                    type="button"
                                    disabled={isFirst}
                                    onClick={(e) => { e.stopPropagation(); handleMoveProductStep(prod.id, 'up'); }}
                                    className={`p-0.5 transition-colors ${isFirst ? 'text-brand-sand/40 cursor-not-allowed' : 'text-brand-warmgray hover:text-brand-charcoal hover:bg-brand-sand/30 rounded'}`}
                                    title={language === 'tr' ? 'Bir yukarı taşı' : 'Move up'}
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isLast}
                                    onClick={(e) => { e.stopPropagation(); handleMoveProductStep(prod.id, 'down'); }}
                                    className={`p-0.5 transition-colors ${isLast ? 'text-brand-sand/40 cursor-not-allowed' : 'text-brand-warmgray hover:text-brand-charcoal hover:bg-brand-sand/30 rounded'}`}
                                    title={language === 'tr' ? 'Bir aşağı taşı' : 'Move down'}
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Image Thumbnail */}
                            <td className="py-3 px-4">
                              <div className="w-9 h-12 bg-brand-sand/10 border border-brand-sand/30 rounded-[2px] overflow-hidden">
                                <img
                                  src={prod.image}
                                  alt={prod.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover pointer-events-none"
                                />
                              </div>
                            </td>

                            {/* Product Title */}
                            <td className="py-3 px-5">
                              <div className="font-serif text-sm font-medium text-brand-charcoal flex items-center gap-2 flex-wrap">
                                <span>{prod.title}</span>
                                {prod.status === 'taslak' && (
                                  <span className="text-[9px] font-sans tracking-widest uppercase bg-brand-sand/60 text-brand-warmgray px-1.5 py-0.5 rounded-[1px]">
                                    {language === 'tr' ? 'Taslak' : 'Draft'}
                                  </span>
                                )}
                                {prod.status === 'satildi' && (
                                  <span className="text-[9px] font-sans tracking-widest uppercase bg-brand-terracotta/15 text-brand-terracotta px-1.5 py-0.5 rounded-[1px]">
                                    {language === 'tr' ? 'Satıldı' : 'Sold'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-brand-warmgray max-w-[280px] truncate italic" title={prod.story}>
                                {prod.story}
                              </div>
                            </td>

                            {/* Product Category & Subcategory */}
                            <td className="py-3 px-5 text-brand-warmgray/90 font-medium tracking-wider text-[10px]">
                              <span className="uppercase block font-semibold text-brand-charcoal/90">{displayCat}</span>
                              {prod.subcategory && (
                                <span className="text-brand-terracotta font-medium inline-flex items-center gap-1 mt-0.5 bg-brand-terracotta/10 px-1.5 py-0.5 rounded-[1px]">
                                  <Tag size={9} />
                                  {prod.subcategory}
                                </span>
                              )}
                            </td>

                            {/* Price */}
                            <td className="py-3 px-5 font-serif font-medium text-brand-charcoal">
                              {prod.price.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                            </td>

                            {/* Material / Dimensions */}
                            <td className="py-3 px-5">
                              <div className="flex flex-col gap-0.5">
                                {prod.material && (
                                  <span className="text-[10px] text-brand-charcoal/85 font-medium tracking-wide">
                                    {prod.material}
                                  </span>
                                )}
                                {prod.dimensions && (
                                  <span className="text-[9px] text-brand-warmgray tracking-wide">
                                    {prod.dimensions}
                                  </span>
                                )}
                                {!prod.material && !prod.dimensions && (
                                  <span className="text-[10px] text-brand-warmgray/50 italic">-</span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(prod)}
                                  className="p-1.5 text-brand-warmgray hover:text-brand-charcoal hover:bg-brand-sand/20 rounded-full transition-colors"
                                  title={language === 'tr' ? 'Düzenle' : 'Edit'}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(prod)}
                                  className="p-1.5 text-brand-warmgray hover:text-brand-terracotta hover:bg-brand-sand/20 rounded-full transition-colors"
                                  title={language === 'tr' ? 'Sil' : 'Delete'}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: KATEGORİ YÖNETİMİ */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            {/* Categories Header & Actions */}
            <div className="bg-brand-sand/15 border border-brand-sand/40 p-6 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-brand-terracotta text-[10px] font-sans tracking-[0.25em] uppercase font-bold mb-1">
                  <Sparkles size={13} className="animate-pulse" />
                  <span>{language === 'tr' ? 'KATEGORİ & VİTRİN YÖNETİMİ' : 'CATEGORY & SHOWCASE MANAGEMENT'}</span>
                </div>
                <h2 className="font-serif text-2xl font-light text-brand-charcoal">
                  {language === 'tr' ? 'Koleksiyon Kategorileri & Alt Başlıklar' : 'Collection Categories & Subcategories'}
                </h2>
                <p className="text-xs text-brand-warmgray mt-1 max-w-2xl font-light">
                  {language === 'tr'
                    ? 'Sitenizdeki ürün kategorilerini ve alt sınıflandırmalarını (alt başlıkları) özelleştirin, yenilerini ekleyin veya düzenleyin.'
                    : 'Manage product categories and their subcategories, add new classifications, or customize showcase cards.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpenAddCategory}
                  className="py-2.5 px-4 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs tracking-widest uppercase transition-colors rounded-[2px] flex items-center gap-2 font-medium shrink-0 shadow-sm"
                >
                  <Plus size={14} />
                  <span>{language === 'tr' ? 'YENİ KATEGORİ EKLE' : 'ADD NEW CATEGORY'}</span>
                </button>
              </div>
            </div>

            {/* Categories Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, index) => {
                const count = products.filter(p => p.category === cat.id).length;
                const coverImg = cat.image || VARSAYILAN_VITRIN[cat.id] || '/images/ceramic-cover.jpg';
                const subcategories = cat.subcategories || [];

                return (
                  <div
                    key={cat.id}
                    className="bg-brand-beige border border-brand-sand/50 rounded-sm p-6 shadow-sm flex flex-col justify-between group hover:border-brand-charcoal/40 transition-all"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-mono bg-brand-sand/40 text-brand-charcoal px-2 py-0.5 rounded-[1px] tracking-wider font-medium">
                          #{cat.id}
                        </span>
                        <span className="text-[10px] font-sans text-brand-warmgray font-medium tracking-wide flex items-center gap-1">
                          <Package size={12} className="text-brand-terracotta" />
                          {count} {language === 'tr' ? 'Ürün Listeli' : 'Products Listed'}
                        </span>
                      </div>

                      {/* Cover Thumbnail Preview */}
                      <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden bg-brand-sand/20 border border-brand-sand/60 mb-4">
                        <img
                          src={coverImg}
                          alt={cat.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/40 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-2 text-white text-[9px] font-sans tracking-widest uppercase font-medium drop-shadow">
                          {language === 'tr' ? 'Vitrin Görseli' : 'Showcase Cover'}
                        </div>
                      </div>

                      {/* Category Info */}
                      <div>
                        <h3 className="font-serif text-xl font-light text-brand-charcoal">
                          {cat.title}
                        </h3>
                        {cat.titleEn && cat.titleEn !== cat.title && (
                          <p className="text-[11px] font-sans text-brand-warmgray italic mt-0.5">
                            EN: {cat.titleEn}
                          </p>
                        )}
                        {cat.subtitle && (
                          <p className="text-xs font-sans font-medium text-brand-terracotta mt-1.5">
                            {cat.subtitle}
                          </p>
                        )}
                        {cat.description && (
                          <p className="text-[11px] font-sans text-brand-warmgray/80 mt-2 line-clamp-2 font-light leading-relaxed">
                            {cat.description}
                          </p>
                        )}

                        {/* Subcategories (Alt Sınıflandırmalar) Pill List Preview */}
                        <div className="mt-4 pt-3 border-t border-brand-sand/40">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-sans text-brand-warmgray uppercase tracking-widest font-semibold flex items-center gap-1">
                              <Tag size={10} className="text-brand-terracotta" />
                              {language === 'tr' ? 'Alt Sınıflandırmalar' : 'Subcategories'}:
                            </span>
                            <span className="text-[9px] text-brand-warmgray/70">
                              {subcategories.length} {language === 'tr' ? 'adet' : 'items'}
                            </span>
                          </div>

                          {subcategories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {subcategories.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="bg-brand-sand/35 text-brand-charcoal text-[10px] font-sans px-2 py-0.5 rounded-[1px] font-medium"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-brand-warmgray/60 italic">
                              {language === 'tr' ? 'Henüz alt başlık eklenmemiş' : 'No subcategories yet'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-6 pt-4 border-t border-brand-sand/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="py-2 px-3 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs font-sans tracking-widest uppercase rounded-[1px] flex items-center gap-1.5 transition-colors font-medium flex-1 justify-center"
                      >
                        <Edit2 size={12} />
                        <span>{language === 'tr' ? 'DÜZENLE & ALT BAŞLIKLAR' : 'EDIT & SUBCATEGORIES'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCategoryPrompt(cat)}
                        className="p-2 border border-brand-sand hover:border-red-600 hover:text-red-700 text-brand-warmgray rounded-[1px] transition-colors"
                        title={language === 'tr' ? 'Kategoriyi Sil' : 'Delete Category'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: KAPAK FOTOĞRAFLARI YÖNETİMİ */}
        {/* TAB 4: ÇÖP KUTUSU */}
        {activeTab === 'trash' && (
          <div className="space-y-6">
            <div className="bg-brand-sand/15 border border-brand-sand/40 p-6 rounded-sm">
              <div className="flex items-center gap-2 text-brand-terracotta text-[10px] font-sans tracking-[0.25em] uppercase font-bold mb-1">
                <Archive size={13} />
                <span>{language === 'tr' ? 'ÇÖP KUTUSU' : 'TRASH'}</span>
              </div>
              <h2 className="font-serif text-2xl font-light text-brand-charcoal">
                {language === 'tr' ? 'Silinen Ürünler' : 'Deleted Products'}
              </h2>
              <p className="text-xs text-brand-warmgray mt-1 max-w-2xl font-light">
                {language === 'tr'
                  ? 'Sildiğiniz ürünler kalıcı olarak yok olmaz, burada saklanır. Geri getirdiğiniz ürün tüm bilgileri ve fotoğraflarıyla eski yerine döner.'
                  : 'Deleted products are not permanently removed; they are kept here. A restored product returns with all its details and photos.'}
              </p>
            </div>

            <div className="bg-brand-beige border border-brand-sand/40 rounded-sm overflow-hidden shadow-sm">
              {copYukleniyor ? (
                <div className="py-16 flex items-center justify-center gap-2 text-xs text-brand-warmgray">
                  <Loader2 size={16} className="animate-spin text-brand-terracotta" />
                  {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
                </div>
              ) : silinenler.length === 0 ? (
                <p className="text-center py-16 text-sm text-brand-warmgray/80 italic">
                  {language === 'tr' ? 'Çöp kutusu boş.' : 'The trash is empty.'}
                </p>
              ) : (
                <ul className="divide-y divide-brand-sand/20">
                  {silinenler.map((urun) => (
                    <li key={urun.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="w-9 h-12 bg-brand-sand/10 border border-brand-sand/30 rounded-[2px] overflow-hidden shrink-0">
                        <img src={urun.image} alt={urun.title} className="w-full h-full object-cover opacity-70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-sm font-medium text-brand-charcoal truncate">{urun.title}</div>
                        <div className="text-[10px] text-brand-warmgray">
                          {language === 'tr' ? 'Silinme' : 'Deleted'}:{' '}
                          {urun.deletedAt
                            ? new Date(urun.deletedAt).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })
                            : '-'}
                          {' · '}
                          {urun.price.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')} {t('cart.currency')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestore(urun)}
                        disabled={geriGetirilenId === urun.id}
                        className="py-2 px-3 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs tracking-widest uppercase transition-colors rounded-[2px] flex items-center gap-1.5 font-medium shrink-0 disabled:opacity-50"
                      >
                        {geriGetirilenId === urun.id ? <Loader2 size={13} className="animate-spin" /> : <Undo2 size={13} />}
                        <span>{language === 'tr' ? 'GERİ GETİR' : 'RESTORE'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'covers' && (
          <div className="space-y-8">
            {/* Covers Header & Quick Reset */}
            <div className="bg-brand-sand/15 border border-brand-sand/40 p-6 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-brand-terracotta text-[10px] font-sans tracking-[0.25em] uppercase font-bold mb-1">
                  <Sparkles size={13} className="animate-pulse" />
                  <span>{language === 'tr' ? 'VİTRİN & KAPAK YÖNETİMİ' : 'SHOWCASE & COVER MANAGEMENT'}</span>
                </div>
                <h2 className="font-serif text-2xl font-light text-brand-charcoal">
                  {language === 'tr' ? 'Ana Sayfa Vitrin Kapak Fotoğrafları' : 'Homepage Showcase Cover Photos'}
                </h2>
                <p className="text-xs text-brand-warmgray mt-1 max-w-2xl font-light">
                  {language === 'tr'
                    ? 'Ana sayfadaki ana vitrin kartlarının kapak görsellerini dilediğiniz zaman yükleyebilir, değiştirebilir veya hazır atölye fotoğraflarından seçebilirsiniz.'
                    : 'Easily customize the homepage category showcase cards anytime from your computer or curated presets.'}
                </p>
                <div className="mt-3 max-w-2xl">
                  <OranRehberi language={language} />
                  <p className="text-[11px] text-brand-warmgray/90 font-light flex items-start gap-1.5">
                    <Sparkles size={11} className="text-brand-terracotta shrink-0 mt-0.5" />
                    <span>
                      {language === 'tr'
                        ? 'Vitrin kapakları dikey 3:4 oranında gösterilir; önerilen boyut 1200 × 1600 piksel. Kartın alt kısmına yazı ve gölge geldiği için ürünü üst-orta bölgede konumlandırın.'
                        : 'Showcase covers are displayed in a vertical 3:4 frame; recommended size 1200 × 1600 px. Text and a gradient sit over the lower part, so keep the subject in the upper-middle area.'}
                    </span>
                  </p>
                </div>
              </div>

            </div>

            {/* Showcase Cover Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((cat, sira) => {
                // Kart metinleri kategoriden türetilir; yeni kategoriler otomatik eklenir
                const item = {
                  key: cat.id,
                  titleTr: cat.title,
                  titleEn: cat.titleEn || cat.title,
                  badgeTr: `Ana Sayfa Vitrin ${sira + 1}`,
                  badgeEn: `Homepage Showcase ${sira + 1}`,
                  aspectClass: 'aspect-[3/4]',
                  descTr: cat.subtitle || 'Ana sayfadaki dikey vitrin kartı görseli.',
                  descEn: cat.subtitleEn || cat.subtitle || 'Vertical showcase card image on the homepage.'
                };
                const varsayilan = VARSAYILAN_VITRIN[cat.id];
                const currentImg = cat.image || varsayilan || '/images/ceramic-cover.jpg';
                const isCustom = Boolean(varsayilan) && currentImg !== varsayilan;
                const isLoading = coverLoadingKey === item.key;
                const isSuccess = coverSuccessKey === item.key;
                const isPresetOpen = openPresetTrayKey === item.key;
                const hazirGorselVar = (COVER_PRESETS[item.key]?.length ?? 0) > 0;

                return (
                  <div
                    key={item.key}
                    className="bg-brand-beige border border-brand-sand/50 rounded-sm p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <span className="text-[9px] font-sans tracking-[0.2em] text-brand-terracotta uppercase font-semibold block mb-1">
                            {language === 'tr' ? item.badgeTr : item.badgeEn}
                          </span>
                          <h3 className="font-serif text-xl font-light text-brand-charcoal">
                            {language === 'tr' ? item.titleTr : item.titleEn}
                          </h3>
                          <p className="text-[11px] text-brand-warmgray/80 mt-1 font-light">
                            {language === 'tr' ? item.descTr : item.descEn}
                          </p>
                        </div>

                        {isCustom && (
                          <span className="bg-brand-terracotta/10 text-brand-terracotta text-[9px] font-sans tracking-widest px-2 py-0.5 rounded-[1px] uppercase font-medium shrink-0">
                            {language === 'tr' ? 'ÖZEL GÖRSEL' : 'CUSTOM'}
                          </span>
                        )}
                      </div>

                      {/* Live Image Preview */}
                      <div className="relative mb-5 group">
                        <div className={`w-full ${item.aspectClass} max-h-[320px] rounded-[2px] overflow-hidden bg-brand-sand/30 border border-brand-sand/60 relative flex items-center justify-center`}>
                          <img
                            src={currentImg}
                            alt={item.titleTr}
                            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-102"
                          />

                          {/* Ambient Overlay & Badge */}
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />
                          
                          <div className="absolute bottom-3 left-3 text-white text-[10px] font-sans tracking-widest uppercase font-medium drop-shadow-sm flex items-center gap-1.5 pointer-events-none">
                            <Eye size={12} className="text-brand-sand" />
                            <span>{language === 'tr' ? 'Aktif Kapak Görünümü' : 'Live Active Cover'}</span>
                          </div>

                          {/* Loading Overlay */}
                          {isLoading && (
                            <div className="absolute inset-0 bg-brand-charcoal/70 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                              <Loader2 className="animate-spin text-brand-terracotta" size={26} />
                              <span className="text-xs font-sans tracking-wider">
                                {language === 'tr' ? 'Görsel işleniyor ve kaydediliyor...' : 'Processing and saving image...'}
                              </span>
                            </div>
                          )}

                          {/* Success Overlay */}
                          {isSuccess && (
                            <div className="absolute top-3 right-3 bg-emerald-700/90 text-white text-[10px] font-sans tracking-widest px-2.5 py-1 rounded-[1px] shadow-md flex items-center gap-1.5 uppercase font-medium backdrop-blur-xs">
                              <CheckCircle2 size={12} />
                              <span>{language === 'tr' ? 'YAYINDA' : 'PUBLISHED'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls Area */}
                      <div className="space-y-3">
                        {/* 1. Direct File Upload Button */}
                        <div>
                          <input
                            type="file"
                            id={`cover-upload-${item.key}`}
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleCoverUpload(item.key, file);
                              }
                            }}
                            className="hidden"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`cover-upload-${item.key}`)?.click()}
                              disabled={isLoading}
                              className="flex-1 py-2.5 px-3 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs font-sans tracking-widest uppercase rounded-[2px] flex items-center justify-center gap-2 transition-all font-medium shadow-xs disabled:opacity-50"
                            >
                              <Upload size={13} className="text-brand-sand" />
                              <span>{language === 'tr' ? 'BİLGİSAYARDAN FOTOĞRAF YÜKLE' : 'UPLOAD FROM COMPUTER'}</span>
                            </button>

                            {hazirGorselVar && (
                            <button
                              type="button"
                              onClick={() => setOpenPresetTrayKey(isPresetOpen ? null : item.key)}
                              className={`py-2.5 px-3 border text-xs font-sans tracking-widest uppercase rounded-[2px] flex items-center justify-center gap-1.5 transition-all font-medium ${
                                isPresetOpen
                                  ? 'bg-brand-sand/50 border-brand-charcoal text-brand-charcoal'
                                  : 'border-brand-sand hover:border-brand-charcoal text-brand-charcoal bg-brand-sand/10'
                              }`}
                              title={language === 'tr' ? 'Hazır atölye fotoğraflarından seç' : 'Select from preset atelier gallery'}
                            >
                              <ImageIcon size={13} />
                              <span>{language === 'tr' ? 'GALERİ' : 'PRESETS'}</span>
                            </button>
                            )}
                          </div>
                        </div>

                        {/* Presets Gallery Drawer */}
                        {isPresetOpen && (
                          <div className="bg-brand-sand/25 p-3 rounded-[2px] border border-brand-sand/60 space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-brand-warmgray font-semibold tracking-wider uppercase">
                              <span>{language === 'tr' ? 'ÖNERİLEN ATÖLYE GÖRSELLERİ' : 'CURATED ATELIER PRESETS'}</span>
                              <button
                                onClick={() => setOpenPresetTrayKey(null)}
                                className="text-brand-warmgray hover:text-brand-charcoal"
                              >
                                <X size={12} />
                              </button>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {COVER_PRESETS[item.key]?.map((preset, pIdx) => {
                                const isSelected = currentImg === preset.url;
                                return (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => handleCoverSelectPreset(item.key, preset.url)}
                                    className={`relative aspect-[3/4] rounded-[1px] overflow-hidden border-2 transition-all ${
                                      isSelected
                                        ? 'border-brand-terracotta scale-95 shadow-sm'
                                        : 'border-transparent hover:border-brand-charcoal/40'
                                    }`}
                                    title={preset.label}
                                  >
                                    <img
                                      src={preset.url}
                                      alt={preset.label}
                                      className="w-full h-full object-cover"
                                    />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-brand-terracotta/20 flex items-center justify-center text-white">
                                        <Check size={14} className="stroke-[3] drop-shadow" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 2. Web URL Input */}
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <LinkIcon size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-warmgray" />
                            <input
                              type="text"
                              value={coverUrlInputs[item.key]}
                              onChange={(e) => setCoverUrlInputs(prev => ({ ...prev, [item.key]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCoverUrlSubmit(item.key);
                                }
                              }}
                              placeholder={language === 'tr' ? 'veya görsel linki yapıştırın (URL / dosya yolu)...' : 'or paste image URL / file path...'}
                              className="w-full bg-brand-beige border border-brand-sand/70 focus:border-brand-charcoal pl-7 pr-3 py-1.5 rounded-[2px] text-[11px] text-brand-charcoal outline-none transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCoverUrlSubmit(item.key)}
                            disabled={!coverUrlInputs[item.key]?.trim()}
                            className="px-3 py-1.5 bg-brand-sand/60 hover:bg-brand-charcoal hover:text-brand-beige text-brand-charcoal text-[11px] tracking-wider uppercase rounded-[2px] transition-colors font-medium disabled:opacity-40 disabled:pointer-events-none"
                          >
                            {language === 'tr' ? 'UYGULA' : 'APPLY'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Reset to default button */}
                    <div className="mt-5 pt-3 border-t border-brand-sand/40 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-brand-warmgray font-mono truncate max-w-[220px]" title={currentImg}>
                        {currentImg.length > 35 ? currentImg.substring(0, 35) + '...' : currentImg}
                      </span>

                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleCoverResetSingle(item.key)}
                          className="text-[10px] font-sans tracking-wider text-brand-warmgray hover:text-brand-terracotta uppercase flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw size={10} />
                          <span>{language === 'tr' ? 'Varsayılana Sıfırla' : 'Reset to Default'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Embedded Create/Edit Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-brand-charcoal/40 backdrop-blur-sm flex min-h-screen items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-xl bg-brand-beige rounded-sm shadow-2xl border border-brand-sand/50 p-6 sm:p-8"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-sand/40 rounded-full transition-colors duration-200"
              >
                <Plus size={18} className="rotate-45" />
              </button>

              <div className="mb-6 text-center">
                <span className="text-[9px] font-sans tracking-[0.3em] text-brand-terracotta uppercase block mb-1">
                  {language === 'tr' ? 'Vitrin & Kategori Yapısı' : 'Showcase & Category'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-brand-charcoal tracking-wide">
                  {editingCategory 
                    ? (language === 'tr' ? 'Kategoriyi Düzenle' : 'Edit Category') 
                    : (language === 'tr' ? 'Yeni Kategori Ekle' : 'Add New Category')}
                </h2>
                <div className="w-12 h-[1px] bg-brand-sand mx-auto mt-2"></div>
              </div>

              {catError && (
                <div className="mb-4 p-3 bg-brand-terracotta/10 border border-brand-terracotta/30 text-brand-terracotta text-xs rounded-[2px]">
                  {catError}
                </div>
              )}

              <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Title (TR) */}
                  <div>
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'KATEGORİ ADI (TR) *' : 'CATEGORY TITLE (TR) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={catFormTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCatFormTitle(val);
                        if (!editingCategory && !catFormId) {
                          setCatFormId(slugify(val));
                        }
                      }}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder={language === 'tr' ? 'Örn: Takı & Aksesuar' : 'e.g. Jewelry & Accessories'}
                    />
                  </div>

                  {/* Category Title (EN) */}
                  <div>
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'KATEGORİ ADI (EN)' : 'CATEGORY TITLE (EN)'}
                    </label>
                    <input
                      type="text"
                      value={catFormTitleEn}
                      onChange={(e) => setCatFormTitleEn(e.target.value)}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder={language === 'tr' ? 'Örn: Jewelry & Accessories' : 'e.g. Jewelry & Accessories'}
                    />
                  </div>
                </div>

                {/* Slug / Code */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                    {language === 'tr' ? 'KATEGORİ KODU / SLUG (URL & Sistem Kimliği) *' : 'CATEGORY CODE / SLUG (ID) *'}
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-warmgray font-mono text-sm">#</span>
                    <input
                      type="text"
                      required
                      disabled={!!editingCategory}
                      value={catFormId}
                      onChange={(e) => setCatFormId(slugify(e.target.value))}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-xs font-mono text-brand-charcoal outline-none transition-all disabled:bg-brand-sand/20 disabled:text-brand-warmgray"
                      placeholder="taki-aksesuar"
                    />
                  </div>
                  <p className="text-[10px] text-brand-warmgray/70 mt-1">
                    {language === 'tr' ? 'Küçük harf, rakam ve tire (-) içerebilir. Ürünler bu koda bağlanır.' : 'Lowercase letters, numbers and hyphens. Products link to this ID.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Subtitle TR */}
                  <div>
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'ALT BAŞLIK (TR)' : 'SUBTITLE (TR)'}
                    </label>
                    <input
                      type="text"
                      value={catFormSubtitle}
                      onChange={(e) => setCatFormSubtitle(e.target.value)}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder={language === 'tr' ? 'Örn: Doğal Taş & Pirinç Eserler' : 'e.g. Natural Stone & Brass Pieces'}
                    />
                  </div>

                  {/* Subtitle EN */}
                  <div>
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'ALT BAŞLIK (EN)' : 'SUBTITLE (EN)'}
                    </label>
                    <input
                      type="text"
                      value={catFormSubtitleEn}
                      onChange={(e) => setCatFormSubtitleEn(e.target.value)}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder="e.g. Natural Stone & Brass Pieces"
                    />
                  </div>
                </div>

                {/* Subcategories (Alt Sınıflandırmalar) Manager */}
                <div className="bg-brand-sand/20 border border-brand-sand/60 p-4 rounded-[2px] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-brand-charcoal font-semibold tracking-wide uppercase text-[11px] flex items-center gap-1.5">
                      <Tag size={13} className="text-brand-terracotta" />
                      <span>{language === 'tr' ? 'ALT SINIFLANDIRMALAR / ALT BAŞLIKLAR' : 'SUBCATEGORIES & CLASSIFICATIONS'}</span>
                    </label>
                    <span className="text-[10px] text-brand-warmgray font-mono">
                      {catFormSubcategories.length} {language === 'tr' ? 'Alt Başlık' : 'Subcategories'}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-warmgray font-light">
                    {language === 'tr' 
                      ? 'Bu kategori altındaki ürünleri sınıflandırmak ve filtrelemek için alt başlıklar ekleyin (Örn: Kaftan & Kimono, Vazo & Saksı, Şamdan & Mumluk vb.)'
                      : 'Add subcategories to classify and filter products under this category (e.g. Kaftan, Kimono, Vase, Candlestick etc.)'}
                  </p>

                  {/* Subcategories Pills */}
                  {catFormSubcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {catFormSubcategories.map((sub, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1.5 bg-brand-beige border border-brand-sand text-brand-charcoal text-xs px-2.5 py-1 rounded-[2px] font-medium shadow-2xs"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubcategoryTag(sIdx)}
                            className="text-brand-warmgray hover:text-brand-terracotta p-0.5 rounded-full hover:bg-brand-sand/30 transition-colors"
                            title={language === 'tr' ? 'Kaldır' : 'Remove'}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add new subcategory input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={catFormNewSub}
                      onChange={(e) => setCatFormNewSub(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubcategoryTag();
                        }
                      }}
                      placeholder={language === 'tr' ? 'Yeni alt başlık yazın (Örn: Vazo & Saksı, Kaftan & Kimono)...' : 'Type new subcategory name...'}
                      className="flex-1 bg-brand-beige border border-brand-sand focus:border-brand-charcoal px-3 py-1.5 rounded-[2px] text-xs text-brand-charcoal outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubcategoryTag}
                      disabled={!catFormNewSub.trim()}
                      className="px-3.5 py-1.5 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs uppercase tracking-wider rounded-[2px] font-medium flex items-center gap-1 disabled:opacity-40 transition-colors shrink-0"
                    >
                      <Plus size={13} />
                      <span>{language === 'tr' ? 'EKLE' : 'ADD'}</span>
                    </button>
                  </div>
                </div>

                {/* Description TR */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                    {language === 'tr' ? 'KATEGORİ AÇIKLAMASI (TR)' : 'CATEGORY DESCRIPTION (TR)'}
                  </label>
                  <textarea
                    rows={2}
                    value={catFormDescription}
                    onChange={(e) => setCatFormDescription(e.target.value)}
                    className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none resize-none transition-all"
                    placeholder={language === 'tr' ? 'Kategori sayfasına girildiğinde en üstte görünen şiirsel/özgün açıklama...' : 'Poetic description displayed at the top of the category page...'}
                  />
                </div>

                {/* Description EN */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                    {language === 'tr' ? 'KATEGORİ AÇIKLAMASI (EN)' : 'CATEGORY DESCRIPTION (EN)'}
                  </label>
                  <textarea
                    rows={2}
                    value={catFormDescriptionEn}
                    onChange={(e) => setCatFormDescriptionEn(e.target.value)}
                    className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none resize-none transition-all"
                    placeholder="English description for this category..."
                  />
                </div>

                {/* Category Cover Image */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                    {language === 'tr' ? 'KATEGORİ VİTRİN GÖRSELİ' : 'CATEGORY SHOWCASE IMAGE'}
                  </label>
                  
                  <div className="flex gap-3 items-center">
                    <div className="w-15 h-20 bg-brand-sand/30 border border-brand-sand/60 rounded-[2px] overflow-hidden shrink-0 flex items-center justify-center">
                      {catFormImage ? (
                        <img src={catFormImage} alt="Category Cover" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={18} className="text-brand-warmgray" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="cat-cover-file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCatImageUpload(file);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('cat-cover-file')?.click()}
                          disabled={isCatUploading}
                          className="py-1.5 px-3 bg-brand-charcoal text-brand-beige text-xs tracking-wider uppercase rounded-[2px] flex items-center gap-1.5"
                        >
                          {isCatUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                          <span>{language === 'tr' ? 'Fotoğraf Yükle' : 'Upload Image'}</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        value={catFormImage}
                        onChange={(e) => setCatFormImage(e.target.value)}
                        placeholder={language === 'tr' ? 'veya görsel linki yapıştırın...' : 'or paste image URL...'}
                        className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-2.5 py-1 rounded-[2px] text-xs text-brand-charcoal outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-brand-sand/40">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 py-3 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs tracking-widest uppercase transition-colors rounded-[2px]"
                  >
                    {language === 'tr' ? 'İPTAL ET' : 'CANCEL'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs tracking-widest uppercase transition-colors rounded-[2px]"
                  >
                    {editingCategory 
                      ? (language === 'tr' ? 'KATEGORİYİ GÜNCELLE' : 'UPDATE CATEGORY') 
                      : (language === 'tr' ? 'KATEGORİYİ YAYINLA' : 'PUBLISH CATEGORY')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Beautiful Create/Edit Product Modal inside AdminPanel */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto font-sans bg-brand-charcoal/40 backdrop-blur-sm flex min-h-screen items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-2xl bg-brand-beige rounded-sm shadow-2xl border border-brand-sand/50 p-6 sm:p-8"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 p-2 text-brand-charcoal/60 hover:text-brand-charcoal hover:bg-brand-sand/40 rounded-full transition-colors duration-200"
              >
                <Plus size={18} className="rotate-45" />
              </button>

              <div className="mb-6 text-center">
                <span className="text-[9px] font-sans tracking-[0.3em] text-brand-terracotta uppercase block mb-1">
                  {language === 'tr' ? 'Didi Home Atölyesi' : 'Didi Home Atelier'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-brand-charcoal tracking-wide">
                  {editingProduct 
                    ? (language === 'tr' ? 'Ürünü Düzenle' : 'Edit Product') 
                    : (language === 'tr' ? 'Yeni Ürün Ekle' : 'Add New Product')}
                </h2>
                <div className="w-12 h-[1px] bg-brand-sand mx-auto mt-2"></div>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
                {/* Dynamic Category Selector */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1.5 uppercase">
                    {language === 'tr' ? 'KATEGORİ *' : 'CATEGORY *'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormCategory(cat.id);
                          const matchingCat = categories.find(c => c.id === cat.id);
                          if (matchingCat?.subcategories && matchingCat.subcategories.length > 0) {
                            setFormSubcategory(matchingCat.subcategories[0]);
                          } else {
                            setFormSubcategory('');
                          }
                          const presets = PRESET_IMAGES[cat.id];
                          if (presets && presets.length > 0) {
                            setFormImages([presets[0].url]);
                            setFormPresetIndex(0);
                          }
                        }}
                        className={`py-2 px-3 border rounded-[2px] transition-all tracking-wider text-center uppercase ${
                          formCategory === cat.id
                            ? 'bg-brand-charcoal border-brand-charcoal text-brand-beige font-semibold'
                            : 'border-brand-sand hover:border-brand-charcoal text-brand-charcoal/70'
                        }`}
                      >
                        {language === 'en' && cat.titleEn ? cat.titleEn : cat.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Subcategory Selector */}
                {(() => {
                  const activeCatObj = categories.find(c => c.id === formCategory);
                  const availableSubs = activeCatObj?.subcategories || [];

                  return (
                    <div className="bg-brand-sand/20 border border-brand-sand/60 p-3 rounded-[2px] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-brand-charcoal font-semibold tracking-wide uppercase text-[10px] flex items-center gap-1.5">
                          <Tag size={11} className="text-brand-terracotta" />
                          <span>{language === 'tr' ? 'ALT SINIFLANDIRMA / BAŞLIK' : 'SUBCATEGORY CLASSIFICATION'}</span>
                        </label>
                        {formSubcategory && (
                          <span className="text-[10px] text-brand-terracotta font-medium">
                            {language === 'tr' ? 'Seçili' : 'Selected'}: {formSubcategory}
                          </span>
                        )}
                      </div>

                      {/* Subcategory Pills */}
                      {availableSubs.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {availableSubs.map((sub) => {
                            const isSelected = formSubcategory === sub;
                            return (
                              <button
                                key={sub}
                                type="button"
                                onClick={() => setFormSubcategory(sub)}
                                className={`px-2.5 py-1 text-xs rounded-[2px] border transition-all ${
                                  isSelected
                                    ? 'bg-brand-charcoal border-brand-charcoal text-brand-beige font-semibold shadow-2xs'
                                    : 'border-brand-sand bg-brand-beige hover:border-brand-charcoal/60 text-brand-charcoal/80'
                                }`}
                              >
                                {sub}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Custom Subcategory text input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={formSubcategory}
                          onChange={(e) => setFormSubcategory(e.target.value)}
                          placeholder={language === 'tr' ? 'veya özel alt başlık yazın (Örn: Limitli Seri, Minyatür)...' : 'or enter custom subcategory...'}
                          className="flex-1 bg-brand-beige border border-brand-sand focus:border-brand-charcoal px-2.5 py-1.5 rounded-[2px] text-xs text-brand-charcoal outline-none transition-all"
                        />
                        {formSubcategory && (
                          <button
                            type="button"
                            onClick={() => setFormSubcategory('')}
                            className="text-[11px] text-brand-warmgray hover:text-brand-terracotta uppercase tracking-wider px-1"
                          >
                            {language === 'tr' ? 'Temizle' : 'Clear'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Grid for Title and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'ÜRÜN ADI *' : 'PRODUCT NAME *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder={language === 'tr' ? 'Örn: Toprak Seramik Kase' : 'e.g. Clay Ceramic Bowl'}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'FİYAT (TL) *' : 'PRICE (TL) *'}
                    </label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder={language === 'tr' ? 'Örn: 950' : 'e.g. 950'}
                      min="1"
                    />
                  </div>
                </div>

                {/* Presets / Custom Image Selector */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1.5 uppercase flex items-center gap-1.5">
                    <ImageIcon size={12} className="text-brand-terracotta" />
                    {language === 'tr' ? 'ÜRÜN GÖRSELLERİ *' : 'PRODUCT IMAGES *'}
                  </label>

                  {/* Fotoğraf çekim ve ölçü rehberi */}
                  <div className="bg-brand-sand/20 border border-brand-sand/60 rounded-[2px] p-3 mb-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-brand-charcoal mb-2">
                      <Sparkles size={11} className="text-brand-terracotta" />
                      <span>{language === 'tr' ? 'GÖRSEL ORANI VE ÖLÇÜLER' : 'IMAGE RATIO & SIZES'}</span>
                    </div>

                    <OranRehberi language={language} />

                    <ul className="text-[11px] text-brand-warmgray font-light leading-relaxed space-y-1">
                      {(language === 'tr'
                        ? [
                            'Ürün fotoğrafları ve vitrin kapakları dikey 3:4 oranında gösterilir. Önerilen boyut: 1200 × 1600 piksel.',
                            'Kare (1:1) ve yatay (4:3) fotoğraflar da yüklenebilir: ürün sayfasında tam görünür, kartlarda 3:4 çerçeveye kırpılır.',
                            '16:9 ve 9:16 kartlarda çok kırpılır; zorunlu değilse kullanmayın.',
                            'İlk fotoğraf kapak olur. En iyi 3:4 kareyi sürükleyerek başa alın.',
                            'Ürünü kadrajın ortasına alın, kenarlarda pay bırakın. Doğal ışık ve sade açık arka plan en iyi sonucu verir.',
                            'Panel, yüklediğiniz görseli otomatik olarak en fazla 1200 × 1600 piksele küçültüp sıkıştırır; telefon fotoğrafları sorunsuz çalışır.',
                            'Ürün başına 3-6 fotoğraf idealdir: genel görünüm, detay/doku, kullanım hali.'
                          ]
                        : [
                            'Product photos and showcase covers are displayed in a vertical 3:4 frame. Recommended size: 1200 × 1600 px.',
                            'Square (1:1) and landscape (4:3) also work: shown in full on the product page, cropped to 3:4 on cards.',
                            '16:9 and 9:16 get heavily cropped on cards; avoid them unless necessary.',
                            'The first photo becomes the cover. Drag your best 3:4 shot to the first position.',
                            'Center the product and leave some margin. Natural daylight and a plain, light background work best.',
                            'The panel automatically resizes and compresses uploads to a maximum of 1200 × 1600 px; phone photos are fine.',
                            '3-6 photos per product is ideal: overall view, detail/texture, in use.'
                          ]
                      ).map((madde, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="text-brand-terracotta shrink-0">·</span>
                          <span>{madde}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tabs Selector */}
                  <div className="flex gap-4 border-b border-brand-sand/30 mb-4 text-[10px] uppercase tracking-widest font-semibold pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setImageSource('preset');
                        const presets = PRESET_IMAGES[formCategory];
                        if (formPresetIndex === null && presets && presets.length > 0) {
                          setFormImages([presets[0].url]);
                          setFormPresetIndex(0);
                        }
                      }}
                      className={`pb-1 px-1 transition-all border-b-2 -mb-[5px] ${
                        imageSource === 'preset'
                          ? 'border-brand-terracotta text-brand-charcoal font-bold'
                          : 'border-transparent text-brand-warmgray/70 hover:text-brand-charcoal'
                      }`}
                    >
                      {language === 'tr' ? 'HAZIR KOLEKSİYON GÖRSELLERİ' : 'PRESET COLLECTION IMAGES'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageSource('upload');
                        if (formPresetIndex !== null) {
                          setFormImages([]);
                          setFormPresetIndex(null);
                        }
                      }}
                      className={`pb-1 px-1 transition-all border-b-2 -mb-[5px] ${
                        imageSource === 'upload'
                          ? 'border-brand-terracotta text-brand-charcoal font-bold'
                          : 'border-transparent text-brand-warmgray/70 hover:text-brand-charcoal'
                      }`}
                    >
                      {language === 'tr' ? 'KENDİ FOTOĞRAFINI YÜKLE / URL' : 'UPLOAD PHOTO / URL'}
                    </button>
                  </div>
                  
                  {imageSource === 'preset' ? (
                    /* Preset Cards — yeni eklenen kategorilerde hazır görsel bulunmaz */
                    (PRESET_IMAGES[formCategory]?.length ?? 0) === 0 ? (
                      <div className="border border-dashed border-brand-sand/70 rounded-[2px] p-5 text-center">
                        <p className="text-[11px] text-brand-warmgray font-light">
                          {language === 'tr'
                            ? 'Bu kategori için hazır görsel bulunmuyor. Yandaki sekmeden kendi fotoğrafınızı yükleyin.'
                            : 'No preset images for this category. Use the other tab to upload your own photo.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setImageSource('upload')}
                          className="mt-2 text-[11px] font-sans tracking-widest text-brand-terracotta underline hover:text-brand-charcoal uppercase"
                        >
                          {language === 'tr' ? 'FOTOĞRAF YÜKLE' : 'UPLOAD PHOTO'}
                        </button>
                      </div>
                    ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {PRESET_IMAGES[formCategory].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormImages([preset.url]);
                            setFormPresetIndex(idx);
                          }}
                          className={`relative aspect-[3/4] rounded-[2px] overflow-hidden border-2 transition-all ${
                            formPresetIndex === idx
                              ? 'border-brand-terracotta scale-[0.98]'
                              : 'border-transparent hover:border-brand-sand'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          {formPresetIndex === idx && (
                            <div className="absolute inset-0 bg-brand-terracotta/15 flex items-center justify-center text-white">
                              <Check size={14} className="stroke-[3]" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      {/* Drag and Drop Container */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border border-dashed rounded-[2px] p-4 flex flex-col items-center justify-center transition-all min-h-[140px] cursor-pointer ${
                          isDragging
                            ? 'border-brand-terracotta bg-brand-terracotta/5'
                            : 'border-brand-sand/70 hover:border-brand-charcoal hover:bg-brand-sand/5'
                        }`}
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                      >
                        <input
                          type="file"
                          id="file-upload-input"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />

                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-brand-terracotta" size={24} />
                            <span className="text-brand-warmgray tracking-wide">
                              {language === 'tr' ? 'Fotoğraflar küçültülüp yükleniyor...' : 'Resizing and uploading images...'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-center py-2">
                            <Upload size={22} className="text-brand-warmgray mb-1" />
                            <p className="text-[11px] font-medium text-brand-charcoal">
                              {language === 'tr' ? 'Fotoğraf(lar) Seçmek İçin Tıklayın veya Sürükleyip Bırakın' : 'Click or Drag & Drop to Select Photo(s)'}
                            </p>
                            <p className="text-[9px] text-brand-warmgray/80 tracking-wide uppercase">
                              {language === 'tr' ? 'ÇOKLU SEÇİM YAPABİLİRSİNİZ · PNG, JPG, WEBP' : 'MULTIPLE SELECTION SUPPORTED · PNG, JPG, WEBP'}
                            </p>
                          </div>
                        )}
                      </div>

                      {uploadError && (
                        <p className="text-xs text-brand-terracotta font-medium tracking-wide">{uploadError}</p>
                      )}

                      {/* Display Selected Images Grid */}
                      {formImages.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="block text-[9px] text-brand-warmgray font-semibold uppercase tracking-wider">
                              {language === 'tr' 
                                ? `YÜKLÜ FOTOĞRAFLAR (${formImages.length} ADET) · İlk fotoğraf kapak olur` 
                                : `LOADED PHOTOS (${formImages.length}) · First photo is cover`}
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormImages([])}
                              className="text-[10px] text-red-600 hover:text-red-700 underline font-medium tracking-wide flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 size={11} />
                              <span>{language === 'tr' ? 'Tüm Eski Fotoğrafları Sil' : 'Clear All Photos'}</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {formImages.map((imgUrl, idx) => (
                              <motion.div
                                key={imgUrl}
                                layout
                                draggable
                                onDragStart={(e) => handleItemDragStart(e as unknown as React.DragEvent, idx)}
                                onDragOver={(e) => handleItemDragOver(e, idx)}
                                onDragEnd={handleItemDragEnd}
                                className={`relative aspect-[3/4] rounded-[2px] overflow-hidden border bg-brand-sand/10 group cursor-grab active:cursor-grabbing transition-all select-none ${
                                  draggedIndex === idx 
                                    ? 'border-brand-terracotta opacity-40 shadow-inner scale-95' 
                                    : 'border-brand-sand hover:shadow-sm hover:border-brand-charcoal/40'
                                }`}
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Product ${idx}`}
                                  draggable={false}
                                  className="w-full h-full object-cover cursor-pointer select-none"
                                  onClick={() => {
                                    if (idx > 0) {
                                      setFormImages(prev => {
                                        const updated = [...prev];
                                        const [item] = updated.splice(idx, 1);
                                        updated.unshift(item);
                                        return updated;
                                      });
                                    }
                                  }}
                                />
                                {idx === 0 ? (
                                  <div className="absolute top-1 left-1 bg-brand-terracotta text-brand-beige text-[8px] font-sans font-medium px-1.5 py-0.5 rounded-[1px] uppercase tracking-wider shadow-sm select-none">
                                    {language === 'tr' ? 'Kapak' : 'Cover'}
                                  </div>
                                ) : (
                                  <div 
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-[8px] font-sans uppercase tracking-widest text-center px-1 select-none"
                                    onClick={() => {
                                      setFormImages(prev => {
                                        const updated = [...prev];
                                        const [item] = updated.splice(idx, 1);
                                        updated.unshift(item);
                                        return updated;
                                      });
                                    }}
                                  >
                                    {language === 'tr' ? 'Kapak Yap' : 'Make Cover'}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFormImages(prev => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-brand-charcoal/80 text-brand-beige rounded-full hover:bg-brand-charcoal transition-colors shadow-sm z-10"
                                >
                                  <X size={10} />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* URL Input as alternative fallback */}
                      <div className="space-y-1">
                        <label className="block text-[9px] text-brand-warmgray font-semibold uppercase tracking-wider">
                          {language === 'tr' ? 'VEYA DOĞRUDAN GÖRSEL WEB LİNKİ (URL)' : 'OR DIRECT WEB IMAGE LINK (URL)'}
                        </label>
                        <input
                          type="url"
                          required={formImages.length === 0}
                          value={formImages[0] && formImages[0].startsWith('http') ? formImages[0] : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormImages(prev => {
                              const updated = [...prev];
                              if (updated.length > 0) {
                                updated[0] = val;
                              } else {
                                updated.push(val);
                              }
                              return updated;
                            });
                            setFormPresetIndex(null);
                          }}
                          className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                          placeholder={language === 'tr' ? 'https://images.unsplash.com/... gibi bir görsel adresi yapıştırın' : 'Paste an image address like https://images.unsplash.com/...'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Story / Description */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                    {language === 'tr' ? 'ÜRÜNÜN HİKAYESİ / AÇIKLAMA *' : 'THE STORY OF PRODUCT / DESCRIPTION *'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formStory}
                    onChange={(e) => setFormStory(e.target.value)}
                    className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none resize-none transition-all"
                    placeholder={language === 'tr' ? 'Üretim aşaması, dokusu veya geçmişini anlatan derinlikli hikayesi...' : 'A soulful story describing the crafting process, texture, or history...'}
                  />
                </div>

                {/* Yayın durumu */}
                <div>
                  <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1.5 uppercase">
                    {language === 'tr' ? 'YAYIN DURUMU' : 'STATUS'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { deger: 'yayinda', tr: 'Yayında', en: 'Published', notTr: 'Sitede görünür', notEn: 'Visible on store' },
                      { deger: 'taslak', tr: 'Taslak', en: 'Draft', notTr: 'Sitede görünmez', notEn: 'Hidden from store' },
                      { deger: 'satildi', tr: 'Satıldı', en: 'Sold', notTr: 'Görünür, satın alınamaz', notEn: 'Visible, not purchasable' }
                    ] as const).map((secenek) => (
                      <button
                        key={secenek.deger}
                        type="button"
                        onClick={() => setFormStatus(secenek.deger)}
                        className={`py-2 px-2 border rounded-[2px] transition-all text-center ${
                          formStatus === secenek.deger
                            ? 'bg-brand-charcoal border-brand-charcoal text-brand-beige'
                            : 'border-brand-sand hover:border-brand-charcoal text-brand-charcoal/70'
                        }`}
                      >
                        <span className="block tracking-wider uppercase font-semibold">
                          {language === 'tr' ? secenek.tr : secenek.en}
                        </span>
                        <span className="block text-[9px] mt-0.5 opacity-75 font-light">
                          {language === 'tr' ? secenek.notTr : secenek.notEn}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Specifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'MALZEME / MATERYAL' : 'MATERIAL'}
                    </label>
                    <input
                      type="text"
                      value={formMaterial}
                      onChange={(e) => setFormMaterial(e.target.value)}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder={language === 'tr' ? 'Örn: %100 Saf İpek, Şamot Çamuru' : 'e.g. 100% Pure Silk, Chamotte Clay'}
                    />
                  </div>

                  <div>
                    <label className="block text-brand-charcoal/80 font-medium tracking-wide mb-1 uppercase">
                      {language === 'tr' ? 'BOYUTLAR / ÖLÇÜLER' : 'DIMENSIONS'}
                    </label>
                    <input
                      type="text"
                      value={formDimensions}
                      onChange={(e) => setFormDimensions(e.target.value)}
                      className="w-full bg-transparent border border-brand-sand focus:border-brand-charcoal px-3 py-2 rounded-[2px] text-sm text-brand-charcoal outline-none transition-all"
                      placeholder={language === 'tr' ? 'Örn: Yükseklik: 25 cm, Çap: 18 cm' : 'e.g. Height: 25 cm, Dia: 18 cm'}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-brand-sand/40">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-3 border border-brand-sand hover:border-brand-charcoal text-brand-charcoal text-xs tracking-widest uppercase transition-colors rounded-[2px]"
                  >
                    {language === 'tr' ? 'İPTAL ET' : 'CANCEL'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-charcoal hover:bg-brand-charcoal/90 text-brand-beige text-xs tracking-widest uppercase transition-colors rounded-[2px]"
                  >
                    {editingProduct 
                      ? (language === 'tr' ? 'DEĞİŞİKLİKLERİ KAYDET' : 'SAVE CHANGES') 
                      : (language === 'tr' ? 'ÜRÜNÜ YAYINLA' : 'PUBLISH PRODUCT')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
