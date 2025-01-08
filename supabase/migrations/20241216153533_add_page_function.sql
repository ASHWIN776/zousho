alter table pages alter column path drop not null;

create type page_section_data as (
  content text,
  embedding vector(1024)
);

create or replace function add_page (
  user_id_input text,
  name_input text,
  page_content text,
  page_section_data_input page_section_data[],
  type_input page_type,
  path_input text
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
  insert into pages (name, path, type, user_id, content)
  values (name_input, path_input, type_input, user_id_input, page_content)
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