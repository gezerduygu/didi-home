/**
 * Didi Home · Veri erişim katmanı (Aşama 1)
 *
 * Eski `data.ts` tüm kataloğu tek bir JSON olarak okuyup yazıyordu. Bu dosya
 * onun yerini alır ve PROJECT.md'deki "Altın kurallar"ı uygular:
 *
 *   · Her ürün ayrı satır → bir ürünü kaydetmek diğerlerini etkilemez.
 *   · Kayıt beklenir (await) ve sonucu doğrulanır; "kaydedildi" mesajı ancak
 *     gerçekten kaydedilince gösterilir.
 *   · Silme = çöp kutusu (deleted_at). Kalıcı silme ayrı ve bilinçli bir işlemdir.
 *   · Veri gelmezse örnek/demo katalog GÖSTERİLMEZ; hata yukarı bildirilir.
 */

import { supabase } from './supabase';
import { Product, CategoryItem, CoverSettings, ProductStatus, Order, OrderItem, OrderStatus } from './types';

export const DEFAULT_COVERS: CoverSettings = {
  hauteCoutureCover: '/images/haute-couture-cover.jpg',
  ceramicCover: '/images/ceramic-cover.jpg',
  homeCover: '/images/ev-illustration.jpg',
  homeDesignBanner: '/images/ev-to-home-cover.jpg'
};

/** Kullanıcıya gösterilebilir hata. */
export class StoreError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StoreError';
  }
}

// =====================================================================
// Satır ↔ uygulama tipi dönüşümleri
// =====================================================================

interface ProductRow {
  id: string;
  title: string;
  title_en: string | null;
  category_id: string;
  subcategory: string | null;
  price: number | string;
  image: string | null;
  images: string[] | null;
  story: string | null;
  story_en: string | null;
  condition: string | null;
  condition_en: string | null;
  material: string | null;
  material_en: string | null;
  dimensions: string | null;
  dimensions_en: string | null;
  is_second_hand: boolean;
  status: ProductStatus;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

const bos = (v: string | undefined | null) => (v && v.trim() ? v.trim() : null);

function rowToProduct(r: ProductRow): Product {
  const images = r.images ?? [];
  return {
    id: r.id,
    title: r.title,
    titleEn: r.title_en ?? undefined,
    category: r.category_id,
    subcategory: r.subcategory ?? undefined,
    price: Number(r.price),
    image: r.image ?? images[0] ?? '',
    images,
    story: r.story ?? '',
    storyEn: r.story_en ?? undefined,
    condition: r.condition ?? undefined,
    conditionEn: r.condition_en ?? undefined,
    material: r.material ?? undefined,
    materialEn: r.material_en ?? undefined,
    dimensions: r.dimensions ?? undefined,
    dimensionsEn: r.dimensions_en ?? undefined,
    isSecondHand: r.is_second_hand,
    status: r.status,
    sortOrder: r.sort_order,
    deletedAt: r.deleted_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function productToRow(p: Product): Omit<ProductRow, 'updated_at' | 'deleted_at'> {
  const images = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
  return {
    id: p.id,
    title: p.title.trim(),
    title_en: bos(p.titleEn),
    category_id: p.category,
    subcategory: bos(p.subcategory),
    price: p.price,
    image: p.image || images[0] || null,
    images,
    story: bos(p.story),
    story_en: bos(p.storyEn),
    condition: bos(p.condition),
    condition_en: bos(p.conditionEn),
    material: bos(p.material),
    material_en: bos(p.materialEn),
    dimensions: bos(p.dimensions),
    dimensions_en: bos(p.dimensionsEn),
    is_second_hand: Boolean(p.isSecondHand),
    status: p.status ?? 'yayinda',
    sort_order: p.sortOrder ?? 0,
    created_at: p.createdAt || new Date().toISOString()
  };
}

interface CategoryRow {
  id: string;
  title: string;
  title_en: string | null;
  subtitle: string | null;
  subtitle_en: string | null;
  description: string | null;
  description_en: string | null;
  image: string | null;
  subcategories: string[] | null;
  sort_order: number;
  deleted_at: string | null;
}

const rowToCategory = (r: CategoryRow): CategoryItem => ({
  id: r.id,
  title: r.title,
  titleEn: r.title_en ?? undefined,
  subtitle: r.subtitle ?? undefined,
  subtitleEn: r.subtitle_en ?? undefined,
  description: r.description ?? undefined,
  descriptionEn: r.description_en ?? undefined,
  image: r.image ?? undefined,
  subcategories: r.subcategories ?? []
});

const categoryToRow = (c: CategoryItem, sortOrder = 0) => ({
  id: c.id,
  title: c.title.trim(),
  title_en: bos(c.titleEn),
  subtitle: bos(c.subtitle),
  subtitle_en: bos(c.subtitleEn),
  description: bos(c.description),
  description_en: bos(c.descriptionEn),
  image: c.image || null,
  subcategories: c.subcategories ?? [],
  sort_order: sortOrder
});

// =====================================================================
// OKUMA
// =====================================================================

/** Mağazada görünecek ürünler (taslaklar ve çöp kutusu hariç). */
export async function listVisibleProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .in('status', ['yayinda', 'satildi'])
    .order('sort_order', { ascending: true });

  if (error) throw new StoreError('Ürünler yüklenemedi: ' + error.message, error);
  return (data as ProductRow[]).map(rowToProduct);
}

/** Yönetim panelindeki liste: taslaklar dahil, çöp kutusu hariç. */
export async function listAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) throw new StoreError('Ürünler yüklenemedi: ' + error.message, error);
  return (data as ProductRow[]).map(rowToProduct);
}

/** Çöp kutusundaki ürünler (son silinen önce). */
export async function listDeletedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (error) throw new StoreError('Çöp kutusu okunamadı: ' + error.message, error);
  return (data as ProductRow[]).map(rowToProduct);
}

export async function listCategories(): Promise<CategoryItem[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) throw new StoreError('Kategoriler yüklenemedi: ' + error.message, error);
  return (data as CategoryRow[]).map(rowToCategory);
}

export async function getCovers(): Promise<CoverSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'covers')
    .maybeSingle();

  if (error) throw new StoreError('Kapak ayarları yüklenemedi: ' + error.message, error);
  return { ...DEFAULT_COVERS, ...((data?.value as Partial<CoverSettings>) ?? {}) };
}

// =====================================================================
// YAZMA — hepsi sonucu doğrular, hata durumunda StoreError fırlatır
// =====================================================================

/** Ürün ekler veya günceller. Kaydedilen kaydın son halini geri döndürür. */
export async function saveProduct(product: Product): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .upsert(productToRow(product), { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    if (error.code === '23503') {
      throw new StoreError('Bu ürünün kategorisi bulunamadı. Önce kategoriyi oluşturun.', error);
    }
    throw new StoreError('Ürün kaydedilemedi: ' + error.message, error);
  }
  return rowToProduct(data as ProductRow);
}

/** Ürünü çöp kutusuna taşır (kalıcı silmez). */
export async function softDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new StoreError('Ürün silinemedi: ' + error.message, error);
}

/** Çöp kutusundaki ürünü geri getirir. */
export async function restoreProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').update({ deleted_at: null }).eq('id', id);
  if (error) throw new StoreError('Ürün geri getirilemedi: ' + error.message, error);
}

/** Sıralamayı kaydeder. Yalnızca sort_order sütununa dokunur. */
export async function saveProductOrder(orderedIds: string[]): Promise<void> {
  const sonuclar = await Promise.all(
    orderedIds.map((id, i) => supabase.from('products').update({ sort_order: i }).eq('id', id))
  );
  const hatali = sonuclar.find((r) => r.error);
  if (hatali?.error) throw new StoreError('Sıralama kaydedilemedi: ' + hatali.error.message, hatali.error);
}

export async function saveCategory(category: CategoryItem, sortOrder = 0): Promise<CategoryItem> {
  const { data, error } = await supabase
    .from('categories')
    .upsert(categoryToRow(category, sortOrder), { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new StoreError('Kategori kaydedilemedi: ' + error.message, error);
  return rowToCategory(data as CategoryRow);
}

/**
 * Kategoriyi çöp kutusuna taşır. İçinde ürün varsa engeller —
 * aksi halde ürünler sitede görünmez ama veritabanında "yetim" kalırdı.
 */
export async function softDeleteCategory(id: string): Promise<void> {
  const { count, error: sayimHatasi } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
    .is('deleted_at', null);

  if (sayimHatasi) throw new StoreError('Kategori kontrol edilemedi: ' + sayimHatasi.message, sayimHatasi);
  if (count && count > 0) {
    throw new StoreError(
      `Bu kategoride ${count} ürün var. Önce ürünleri başka bir kategoriye taşıyın ya da silin.`
    );
  }

  const { error } = await supabase
    .from('categories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new StoreError('Kategori silinemedi: ' + error.message, error);
}

export async function saveCovers(covers: CoverSettings): Promise<CoverSettings> {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ key: 'covers', value: covers }, { onConflict: 'key' })
    .select('value')
    .single();

  if (error) throw new StoreError('Kapak ayarları kaydedilemedi: ' + error.message, error);
  return { ...DEFAULT_COVERS, ...(data.value as Partial<CoverSettings>) };
}

// =====================================================================
// SİPARİŞLER (yalnızca yönetici okuyabilir — sql/02_security.sql)
// =====================================================================

interface OrderRow {
  id: string;
  siparis_no: string | null;
  created_at: string;
  customer_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  note: string | null;
  items: OrderItem[] | null;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  status: OrderStatus;
}

const rowToOrder = (r: OrderRow): Order => ({
  id: r.id,
  siparisNo: r.siparis_no,
  createdAt: r.created_at,
  customerName: r.customer_name,
  email: r.email,
  phone: r.phone,
  city: r.city,
  address: r.address,
  note: r.note,
  items: r.items ?? [],
  subtotal: Number(r.subtotal),
  shipping: Number(r.shipping),
  total: Number(r.total),
  status: r.status
});

/** Siparişler, en yenisi en üstte. */
export async function listOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw new StoreError('Siparişler yüklenemedi: ' + error.message, error);
  return (data as OrderRow[]).map(rowToOrder);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select('id');
  if (error) throw new StoreError('Sipariş durumu güncellenemedi: ' + error.message, error);
  if (!data || data.length === 0) {
    throw new StoreError('Sipariş durumu güncellenemedi (yetki yok ya da sipariş bulunamadı).');
  }
}

// =====================================================================
// YEDEKLEME
// =====================================================================

/** Tüm kataloğu tek bir JSON nesnesi olarak döndürür (panelden indirmek için). */
export async function exportAll(): Promise<{
  disaAktarmaTarihi: string;
  kategoriler: CategoryItem[];
  urunler: Product[];
  kapaklar: CoverSettings;
}> {
  const [kategoriler, urunler, kapaklar] = await Promise.all([
    listCategories(),
    listAllProducts(),
    getCovers()
  ]);
  return { disaAktarmaTarihi: new Date().toISOString(), kategoriler, urunler, kapaklar };
}
