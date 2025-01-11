alter table pages add column checksum text not null default '';

drop function if exists add_page(text, text, text, page_section_data[], page_type, text);

create or replace function add_page (
  user_id_input text,
  name_input text,
  page_content text,
  page_section_data_input page_section_data[],
  type_input page_type,
  path_input text,
  checksum_input text
) 
returns bigint as 
$$
declare
  section_data page_section_data;
  page_id bigint;
begin

  -- Assert that path is provided for website pages
  IF type_input = 'website' AND path_input IS NULL THEN
    RAISE EXCEPTION 'Path is required for website pages';
  END IF;

  -- Insert page
  insert into pages (name, path, type, user_id, content, checksum)
  values (name_input, path_input, type_input, user_id_input, page_content, checksum_input)
  returning id into page_id;

  -- Insert page sections 
  foreach section_data in array page_section_data_input
  loop
    insert into page_sections (page_id, content, embedding)
    values (page_id, section_data.content, section_data.embedding);
  end loop;

  return page_id;
end;
$$ language plpgsql;
