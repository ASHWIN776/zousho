create type page_type as enum (
  'website',
  'note',
  'media'
);

alter table pages
add column 
type page_type not null default 'website';