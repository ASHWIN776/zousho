import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Page } from "@/lib/types";
import { format } from 'date-fns'
import { formatTitle } from "@/lib/helper";
import DeleteContentDialog from "./delete-dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
  page: Page
  showSimilarity: boolean
}

export default function ResourceRow({ page, showSimilarity }: Props) {
  const { name: title, path, max_similarity: similarity, created_at, id } = page;
  const similarityPercentage = similarity ? (similarity * 100).toFixed(2) : undefined;

  return (
    <TableRow className="h-12 hover:bg-transparent">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <span>{formatTitle(title)}</span>
          {showSimilarity && similarityPercentage && (
            <Badge variant="secondary">{similarityPercentage}% match</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {format(created_at, 'MMMM d, yyyy')}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-x-4">
          <Link
            href={path ?? `/library/${id}`}
            target={path ? "_blank" : "_self"}
          >
            <ExternalLink className="h-4 w-4 text-blue-500 hover:text-blue-600" />
          </Link>
          <DeleteContentDialog page={page} />
        </div>
      </TableCell>
    </TableRow>
  )
}
