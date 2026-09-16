-- =====================================================================
-- Didi Home · Aşama 4 — Sipariş numarası ayrı sütunda
-- Çalıştırma: node scripts/run-sql.mjs sql/06_orders_no.sql
-- DH-20260916-A7F biçimindeki numara WhatsApp mesajıyla aynıdır; panelde
-- müşteriden gelen mesajla kayıt bu numarayla eşleştirilir.
-- =====================================================================
alter table public.orders add column if not exists siparis_no text;
create index if not exists orders_siparis_no_idx on public.orders (siparis_no);

select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'orders' order by ordinal_position;
