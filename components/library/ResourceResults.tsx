import { ContentType } from "@/lib/types";
import ResourceCard from "./ResourceCard";
import { fetchPages, searchQuery } from "@/lib/actions";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { AddContentDialog } from "../sidebar/AddContentDialog";

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
      <div className="text-center text-white">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pages.map((page, index) => (
        <ResourceCard 
          key={index}
          page={page}
        />
      ))}
    </div>
  )
}