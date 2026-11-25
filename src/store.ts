/**
 * Didi Home · Veri okuma katmanı
 *
 * Site yalnızca OKUR: yayındaki ürünler ve kategoriler. Yönetim paneli 2026-11-25'te
 * kaldırıldı; ürün/kategori/görsel değişiklikleri artık tarayıcıdan değil, yapay zekâ
 * asistanıyla yerelden (scripts/ + SUPABASE_DB_URL) yapılır. Bkz. ANTIGRAVITY-DEVIR.md.
 *
 * Veri gelmezse örnek/demo katalog GÖSTERİLMEZ; hata yukarı bildirilir (Altın kural 4).
 * Sipariş kaydı ayrı dosyadadır: src/orders.ts.
 */

import { supabase } from './supabase';
import { Product, CategoryItem, ProductStatus } from './types';

/** Kullanıcıya gösterilebilir hata. */
export class StoreError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'StoreError';
  }
}

// =====================================================================
// Satır → uygulama tipi dönüşümleri
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

export async function listCategories(): Promise<CategoryItem[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) throw new StoreError('Kategoriler yüklenemedi: ' + error.message, error);
  return (data as CategoryRow[]).map(rowToCategory);
}
