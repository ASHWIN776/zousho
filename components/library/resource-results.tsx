import { ContentType } from "@/lib/types";
import { fetchPages, searchQuery } from "@/lib/actions";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";
import ResourceRow from "./resource-card";

interface Props {
  query?: string
  type: ContentType
}

export default async function ResourceResults({
  query,
  type
}: Props) {
  const pages = query ? await searchQuery(query, type) : await fetchPages(type);

  // If there are no pages in the library
  if(pages.length === 0) {
    return (
      <div className="text-center">
        {
          query ? (
            <span>
              No content found for <span className="font-bold">{query}</span>
            </span>
          ) :
          (
            <span  className="flex flex-col gap-y-2 justify-center items-center">
              No content found in your library
            </span>
          )
        }
      </div>
    )
  }

  // If there are pages in the library
  return (
    <ItemGroup className="gap-0 has-data-[size=sm]:gap-0 has-data-[size=xs]:gap-0">
      {pages.map((page, index) => (
        <div key={index}>
          {index > 0 && <ItemSeparator />}
          <ResourceRow
            page={page}
            showSimilarity={!!query}
          />
        </div>
      ))}
    </ItemGroup>
  )
}
