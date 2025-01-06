drop function if exists get_matched_pages(vector(1024), int, page_type);

-- This function is used to get the matched pages based on the query embedding, match limit, and page type(If NULL, all the page_types will be considered for the search).
create or replace function get_matched_pages (
  query_embedding vector(1024),
  match_limit int,
  type_input page_type DEFAULT NULL
)
returns table (id bigint, name text, path text, max_similarity float, created_at timestamptz)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query  select pages.id, name, path, MAX(1 - (embedding <=> query_embedding)), pages.created_at AS 
  max_similarity
  from pages
  JOIN page_sections
  ON pages.id = page_sections.page_id
  WHERE 1 = 1 
    AND (type_input IS NULL OR pages.type = type_input)
  GROUP BY pages.id, name, path, pages.created_at
  ORDER BY max_similarity DESC
  limit match_limit;
end
$$;