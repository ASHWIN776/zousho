import { ContentType } from "@/lib/types";
import ResourceCard from "./ResourceCard";
import { fetchPages, searchQuery } from "@/lib/actions";

interface Props {
  query?: string
  type: ContentType
}

export default async function ResourceResults({
  query,
  type
}: Props) {
  const pages = query ? await searchQuery(query, type) : await fetchPages(type);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {pages.map((page, index) => (
      <ResourceCard 
        key={index}
        title={page.name}
        path={page.path}
        similarity={page.max_similarity}
      />
    ))}
  </div>
  )
}