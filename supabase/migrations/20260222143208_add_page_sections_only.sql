CREATE OR REPLACE FUNCTION add_page_sections(
  page_id_input bigint,
  page_section_data_input page_section_data[]
)
RETURNS void AS $$
DECLARE
  section_data page_section_data;
BEGIN
  FOREACH section_data IN ARRAY page_section_data_input
  LOOP
    INSERT INTO page_sections (page_id, content, embedding)
    VALUES (page_id_input, section_data.content, section_data.embedding);
  END LOOP;
END;
$$ LANGUAGE plpgsql;
