-- =====================================================================
-- GEÇİCİ: Canlı site eski koddayken store_data'yı YALNIZCA OKUNUR yap.
-- Yeni kod yayına alındıktan sonra sql/03_archive_store_data.sql tekrar
-- çalıştırılarak bu kural da kaldırılacak.
-- =====================================================================
drop policy if exists "gecici: canli site icin salt okuma" on public.store_data;
create policy "gecici: canli site icin salt okuma" on public.store_data
  for select using (true);

select policyname, cmd from pg_policies where schemaname = 'public' and tablename = 'store_data';
