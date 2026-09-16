-- =====================================================================
-- Didi Home · Aşama 2 — Güvenlik kuralları (Row Level Security)
-- Çalıştırma: node scripts/run-sql.mjs sql/02_security.sql
-- Tekrar çalıştırmak güvenlidir.
--
-- Özet:
--   Ziyaretçi (anon)  : yayındaki ürünleri, kategorileri ve ayarları OKUR.
--                       Sipariş EKLEYEBİLİR ama siparişleri OKUYAMAZ.
--   Yönetici          : her şeyi okur, ekler, günceller.
--   KİMSE             : API üzerinden kalıcı silme yapamaz (DELETE kuralı yok).
--                       Silme = deleted_at doldurmak (çöp kutusu).
-- =====================================================================

-- ---------- Yönetici kimdir? ----------
-- Yeni yönetici eklemek için bu listeye e-posta eklemek yeterli.
create or replace function public.is_admin()
returns boolean
language sql stable
set search_path = public
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = any (array[
    'gezerduygu@gmail.com'
  ]);
$$;

-- Sürüm geçmişi tetikleyicisi RLS'ten etkilenmemeli; yönetici bir ürünü
-- güncellediğinde eski hali mutlaka revisions tablosuna yazılabilsin.
create or replace function public.record_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.revisions (table_name, row_id, action, data)
  values (tg_table_name, old.id::text, tg_op, to_jsonb(old));
  return coalesce(new, old);
end $$;

-- ---------- RLS'i aç ----------
alter table public.products   enable row level security;
alter table public.categories enable row level security;
alter table public.settings   enable row level security;
alter table public.orders     enable row level security;
alter table public.revisions  enable row level security;

-- ---------- ÜRÜNLER ----------
drop policy if exists "ziyaretci yayindaki urunleri okur" on public.products;
create policy "ziyaretci yayindaki urunleri okur" on public.products
  for select using (deleted_at is null and status in ('yayinda', 'satildi'));

drop policy if exists "yonetici tum urunleri okur" on public.products;
create policy "yonetici tum urunleri okur" on public.products
  for select to authenticated using (public.is_admin());

drop policy if exists "yonetici urun ekler" on public.products;
create policy "yonetici urun ekler" on public.products
  for insert to authenticated with check (public.is_admin());

drop policy if exists "yonetici urun gunceller" on public.products;
create policy "yonetici urun gunceller" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- KATEGORİLER ----------
drop policy if exists "ziyaretci kategorileri okur" on public.categories;
create policy "ziyaretci kategorileri okur" on public.categories
  for select using (deleted_at is null);

drop policy if exists "yonetici tum kategorileri okur" on public.categories;
create policy "yonetici tum kategorileri okur" on public.categories
  for select to authenticated using (public.is_admin());

drop policy if exists "yonetici kategori ekler" on public.categories;
create policy "yonetici kategori ekler" on public.categories
  for insert to authenticated with check (public.is_admin());

drop policy if exists "yonetici kategori gunceller" on public.categories;
create policy "yonetici kategori gunceller" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- AYARLAR ----------
drop policy if exists "ziyaretci ayarlari okur" on public.settings;
create policy "ziyaretci ayarlari okur" on public.settings
  for select using (true);

drop policy if exists "yonetici ayar ekler" on public.settings;
create policy "yonetici ayar ekler" on public.settings
  for insert to authenticated with check (public.is_admin());

drop policy if exists "yonetici ayar gunceller" on public.settings;
create policy "yonetici ayar gunceller" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- SİPARİŞLER ----------
-- Ziyaretçi yalnızca "yeni" durumunda sipariş ekleyebilir; hiçbir siparişi göremez.
drop policy if exists "ziyaretci siparis ekler" on public.orders;
create policy "ziyaretci siparis ekler" on public.orders
  for insert with check (status = 'yeni');

drop policy if exists "yonetici siparisleri okur" on public.orders;
create policy "yonetici siparisleri okur" on public.orders
  for select to authenticated using (public.is_admin());

drop policy if exists "yonetici siparis gunceller" on public.orders;
create policy "yonetici siparis gunceller" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- SÜRÜM GEÇMİŞİ ----------
drop policy if exists "yonetici gecmisi okur" on public.revisions;
create policy "yonetici gecmisi okur" on public.revisions
  for select to authenticated using (public.is_admin());

-- ---------- Kontrol ----------
select c.relname as tablo,
       c.relrowsecurity as rls_acik,
       (select count(*) from pg_policies p where p.tablename = c.relname and p.schemaname = 'public') as kural_sayisi
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
order by 1;
