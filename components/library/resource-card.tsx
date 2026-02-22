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
    <TableRow className="h-12">
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
        <div className="flex items-center gap-1">
          <Link
            href={path ?? `/library/${id}`}
            target={path ? "_blank" : "_self"}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <DeleteContentDialog page={page} />
        </div>
      </TableCell>
    </TableRow>
  )
}
