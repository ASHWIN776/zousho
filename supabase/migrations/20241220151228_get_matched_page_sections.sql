create or replace function get_matched_page_sections(
  user_id_input text,
  query_embedding vector(1024),
  match_limit int,
  type_input page_type DEFAULT NULL
)
returns table (page_id bigint, section_id bigint, section_content text, similarity float)
language plpgsql
as $$
begin
  return query select pages.id, page_sections.id, page_sections.content, 1 - (embedding <=> query_embedding) as similarity
  from pages 
  JOIN page_sections
  ON pages.id = page_sections.page_id
  WHERE pages.user_id = user_id_input
    AND (type_input IS NULL OR pages.type = type_input)
  ORDER BY similarity DESC
  limit match_limit;
end
$$