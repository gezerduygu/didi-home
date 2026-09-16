-- =====================================================================
-- Didi Home · Eski store_data tablosunu arşive al
-- Çalıştırma: node scripts/run-sql.mjs sql/03_archive_store_data.sql
--
-- store_data, veriler yeni tablolara taşınmadan önceki (tek JSON) yapıdır.
-- Uygulama artık bu tabloyu kullanmıyor. SİLİNMİYOR: yedek olarak duruyor.
-- Yalnızca API erişimi tamamen kapatılıyor (ne okunabilir ne yazılabilir).
-- Doğrudan veritabanı bağlantısıyla (scripts/) okunmaya devam edebilir.
-- =====================================================================

-- Önce mevcut kuralları göster
select policyname as kaldirilan_kural, cmd as islem, roles
from pg_policies
where schemaname = 'public' and tablename = 'store_data';

-- Tüm API kurallarını kaldır (RLS açık + kural yok = erişim yok)
do $$
declare k record;
begin
  for k in select policyname from pg_policies where schemaname = 'public' and tablename = 'store_data' loop
    execute format('drop policy %I on public.store_data', k.policyname);
  end loop;
end $$;

alter table public.store_data enable row level security;

comment on table public.store_data is
  'ARŞİV (2026-09-16): Eski tek-JSON veri yapısı. Veriler products/categories/settings tablolarına taşındı. API erişimi kapalı; yedek olarak saklanıyor.';

select 'store_data arşivlendi' as durum,
       (select count(*) from pg_policies where schemaname = 'public' and tablename = 'store_data') as kalan_kural,
       (select count(*) from public.store_data) as saklanan_satir;
