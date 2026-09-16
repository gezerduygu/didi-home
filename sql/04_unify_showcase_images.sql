-- =====================================================================
-- Didi Home · Vitrin görsellerini tek kaynakta topla
-- Çalıştırma: node scripts/run-sql.mjs sql/04_unify_showcase_images.sql
--
-- Sorun: Ana sayfa ilk 3 kategori için settings.covers değerini, panel ise
-- categories.image değerini kullanıyordu. İki değer farklı olduğunda panelden
-- yapılan değişiklik ana sayfaya yansımıyordu.
--
-- Çözüm: Tek kaynak categories.image. Değer olarak ziyaretçinin ŞU AN gördüğü
-- görsel (settings.covers) alınır; sitede görünen hiçbir şey değişmez.
-- Eski categories.image değerleri revisions tablosuna otomatik yazılır.
-- =====================================================================
begin;

update public.categories c
   set image = s.value ->> m.anahtar
  from public.settings s,
       (values ('houte-couture', 'hauteCoutureCover'),
               ('seramik',       'ceramicCover'),
               ('ev-to-home',    'homeCover')) as m(kategori, anahtar)
 where s.key = 'covers'
   and c.id = m.kategori
   and s.value ->> m.anahtar is not null
   and c.image is distinct from s.value ->> m.anahtar;

select c.id,
       case when c.image like 'data:%' then 'base64 ' || (length(c.image) / 1024) || ' KB' else c.image end as yeni_gorsel,
       (select count(*) from public.revisions r where r.table_name = 'categories' and r.row_id = c.id) as gecmis_kaydi
from public.categories c
order by c.sort_order;

commit;
