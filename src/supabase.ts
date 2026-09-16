import { createClient } from '@supabase/supabase-js';
import { Product, CategoryItem, CoverSettings } from './types';
import { DEFAULT_CATEGORIES, INITIAL_PRODUCTS, DEFAULT_COVERS } from './data';

// Supabase Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qamtitryhoffjbdxvgar.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXRpdHJ5aG9mZmpiZHh2Z2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODI4ODUsImV4cCI6MjEwMjQ1ODg4NX0._iLwxCXM7Esh_OpGY35ONxEf7rDUJu85KqacVhMN8Mc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generic fetcher with cloud-first priority & local fallback
export async function fetchStoreData<T>(key: 'products' | 'categories' | 'covers', fallbackData: T): Promise<T> {
  try {
    const { data, error } = await supabase
      .from('store_data')
      .select('value')
      .eq('key', key)
      .single();

    if (!error && data?.value) {
      // Önbellek yazma işi data.ts'de tek bir yerden yapılır (bkz. PROJECT.md).
      return data.value as T;
    }

    // NOT: Kayıt bulunamadığında otomatik "tohumlama" bilerek yapılmaz.
    // Aksi halde geçici bir okuma hatası, örnek verinin gerçek kataloğun
    // üzerine yazılmasına yol açabilir (bkz. PROJECT.md → Altın kurallar).
    if (error) {
      console.warn(`[Supabase] "${key}" okunamadı:`, error.message);
    }
  } catch (err) {
    console.warn(`[Supabase] Error fetching ${key} from cloud, using fallback:`, err);
  }

  // Fallback to locally cached copy, then to defaults
  try {
    const local = localStorage.getItem(`didi_home_${key}`);
    if (local) {
      return JSON.parse(local) as T;
    }
  } catch (e) {
    console.warn('localStorage read error', e);
  }

  return fallbackData;
}

// Generic saver with cloud sync & local caching
export async function saveStoreData<T>(key: 'products' | 'categories' | 'covers', value: T): Promise<boolean> {
  // Yerel önbellek data.ts tarafından yazılır; burada yalnızca bulut kaydı yapılır.
  try {
    const { error } = await supabase
      .from('store_data')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      console.error(`[Supabase] Error saving ${key} to cloud:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[Supabase] Exception while saving ${key}:`, err);
    return false;
  }
}
