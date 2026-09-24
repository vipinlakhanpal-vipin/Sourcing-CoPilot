alter table customers drop constraint if exists customers_status_check;
update customers set status = 'active' where status = 'archived';
alter table customers add constraint customers_status_check check (status in ('active', 'inactive', 'pending'));
