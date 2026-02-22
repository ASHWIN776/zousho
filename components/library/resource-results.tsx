import { ContentType } from "@/lib/types";
import { fetchPages, searchQuery } from "@/lib/actions";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Table>
      <TableHeader>
        <TableRow className="h-12">
          <TableHead>Title</TableHead>
          <TableHead>Date Added</TableHead>
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map((page, index) => (
          <ResourceRow
            key={index}
            page={page}
            showSimilarity={!!query}
          />
        ))}
      </TableBody>
    </Table>
  )
}
