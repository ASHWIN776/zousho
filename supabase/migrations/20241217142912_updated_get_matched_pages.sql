-- This function is used to get the matched pages based on the query embedding, match limit, and page type(If NULL, all the page_types will be considered for the search).
create or replace function get_matched_pages (
  query_embedding vector(1024),
  match_limit int,
  type_input page_type DEFAULT NULL
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
  WHERE 1 = 1 
    AND (type_input IS NULL OR pages.type = type_input)
  GROUP BY name, path
  ORDER BY max_similarity DESC
  limit match_limit;
end
$$;
