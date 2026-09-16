-- =====================================================================
-- Didi Home · Aşama 3 — Fotoğraf deposu (Supabase Storage)
-- Çalıştırma: node scripts/run-sql.mjs sql/05_storage.sql
--
-- "gorseller" klasörü:
--   · Herkes görselleri adresinden görüntüleyebilir (public bucket)
--   · Yalnızca yönetici yükleyebilir / güncelleyebilir
--   · SİLME kuralı yok: yüklenen dosya API üzerinden silinemez
--     (bir ürün silinse bile fotoğrafı kaybolmaz; çöp kutusundan geri gelir)
--   · En fazla 5 MB, yalnızca JPEG / PNG / WebP
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gorseller', 'gorseller', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "yonetici gorsel yukler" on storage.objects;
create policy "yonetici gorsel yukler" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gorseller' and public.is_admin());

drop policy if exists "yonetici gorsel gunceller" on storage.objects;
create policy "yonetici gorsel gunceller" on storage.objects
  for update to authenticated
  using (bucket_id = 'gorseller' and public.is_admin())
  with check (bucket_id = 'gorseller' and public.is_admin());

select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'gorseller';
