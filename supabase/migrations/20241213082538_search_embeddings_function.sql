create or replace function get_matched_pages (
  query_embedding vector(1024),
  match_limit int
)
returns table (name text, path text, max_similarity float)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query  select name, path, MAX(1 - (embedding <=> query_embedding)) AS 
  max_similarity
  from pages
  JOIN page_sections
  ON pages.id = page_sections.page_id
  GROUP BY name, path
  ORDER BY max_similarity DESC
  limit match_limit;
end
$$;


-- create or replace function get_matched_pages (
--   query_embedding vector(1024),
--   match_limit int
-- )
-- returns table (name text, path text, page_section_id bigint, max_similarity float)
-- language plpgsql
-- as $$
-- #variable_conflict use_column
-- begin
--   return query
--   select
--     pages.name,
--     pages.path,
--     subquery.page_section_id,
--     subquery.max_similarity
--   from pages
--   join (
--     select
--       page_sections.page_id,
--       page_sections.id as page_section_id,
--       MAX(1 - (page_sections.embedding <=> query_embedding)) as max_similarity
--     from page_sections
--     group by page_sections.page_id, page_sections.id
--   ) as subquery
--   on pages.id = subquery.page_id
--   order by subquery.max_similarity desc
--   limit match_limit;
-- end
-- $$;