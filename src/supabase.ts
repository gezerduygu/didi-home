import { createClient } from '@supabase/supabase-js';

/**
 * Supabase istemcisi.
 *
 * Bu iki değer tarayıcıya zaten gönderilen, herkese açık değerlerdir (gizli değildir).
 * Verinin güvenliği, veritabanındaki RLS kurallarıyla sağlanır: sql/02_security.sql
 *
 * Yayında Vercel ortam değişkenlerinden okunur; tanımlı değilse aşağıdaki
 * proje değerleri kullanılır.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qamtitryhoffjbdxvgar.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXRpdHJ5aG9mZmpiZHh2Z2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODI4ODUsImV4cCI6MjEwMjQ1ODg4NX0._iLwxCXM7Esh_OpGY35ONxEf7rDUJu85KqacVhMN8Mc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
