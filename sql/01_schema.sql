-- =====================================================================
-- Didi Home · Aşama 1 — Veri modeli
-- Supabase → SQL Editor içine yapıştırıp "Run" deyin. Bir kez çalıştırılır.
-- Mevcut store_data tablosuna DOKUNMAZ; veriler taşındıktan sonra o tablo
-- yedek olarak bir süre daha durur.
-- =====================================================================

-- ---------- Yardımcı: updated_at damgası ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Sürüm geçmişi (geri alma için) ----------
-- Her güncelleme ve silmede kaydın ÖNCEKİ hali buraya yazılır.
create table if not exists public.revisions (
  id          bigserial primary key,
  table_name  text        not null,
  row_id      text        not null,
  action      text        not null,
  data        jsonb       not null,
  changed_at  timestamptz not null default now()
);
create index if not exists revisions_lookup_idx on public.revisions (table_name, row_id, changed_at desc);

create or replace function public.record_revision()
returns trigger language plpgsql as $$
begin
  insert into public.revisions (table_name, row_id, action, data)
  values (tg_table_name, old.id::text, tg_op, to_jsonb(old));
  return coalesce(new, old);
end $$;

-- ---------- Kategoriler ----------
create table if not exists public.categories (
  id             text primary key,
  title          text not null,
  title_en       text,
  subtitle       text,
  subtitle_en    text,
  description    text,
  description_en text,
  image          text,
  subcategories  text[] not null default '{}',
  sort_order     int    not null default 0,
  deleted_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- Ürünler ----------
create table if not exists public.products (
  id             text primary key,
  title          text not null,
  title_en       text,
  category_id    text not null references public.categories(id) on update cascade on delete restrict,
  subcategory    text,
  price          numeric(12,2) not null default 0 check (price >= 0),
  image          text,                       -- kapak görseli
  images         text[] not null default '{}',
  story          text,
  story_en       text,
  condition      text,
  condition_en   text,
  material       text,
  material_en    text,
  dimensions     text,
  dimensions_en  text,
  is_second_hand boolean not null default false,
  -- taslak: sitede görünmez | yayinda: görünür | satildi: görünür ama sepete eklenemez
  status         text not null default 'yayinda' check (status in ('taslak','yayinda','satildi')),
  sort_order     int  not null default 0,
  deleted_at     timestamptz,                -- çöp kutusu (kalıcı silme değil)
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_visible_idx  on public.products (deleted_at, status, sort_order);

-- ---------- Ayarlar (kapak görselleri vb.) ----------
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- Siparişler ----------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  customer_name text not null,
  email         text,
  phone         text,
  city          text,
  address       text,
  note          text,
  items         jsonb not null,              -- [{id, title, price, quantity}]
  subtotal      numeric(12,2) not null default 0,
  shipping      numeric(12,2) not null default 0,
  total         numeric(12,2) not null default 0,
  -- yeni: henüz ilgilenilmedi | goruldu | hazirlaniyor | kargolandi | iptal
  status        text not null default 'yeni' check (status in ('yeni','goruldu','hazirlaniyor','kargolandi','iptal'))
);
create index if not exists orders_recent_idx on public.orders (created_at desc);

-- ---------- Tetikleyiciler ----------
drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

drop trigger if exists categories_revision on public.categories;
create trigger categories_revision before update or delete on public.categories
  for each row execute function public.record_revision();

drop trigger if exists products_revision on public.products;
create trigger products_revision before update or delete on public.products
  for each row execute function public.record_revision();

-- ---------- Kontrol ----------
select 'Tablolar hazır' as durum,
       (select count(*) from public.categories) as kategori_sayisi,
       (select count(*) from public.products)   as urun_sayisi;
