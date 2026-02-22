"use client"

import Link from "next/link";
import { ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { Page, PageStatus } from "@/lib/types";
import { format } from 'date-fns'
import { formatTitle } from "@/lib/helper";
import DeleteContentDialog from "./delete-dialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePageStatus } from "@/hooks/use-page-status";

function getFaviconUrl(path: string | null): string | null {
  if (!path) return null;
  try {
    const domain = new URL(path).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

interface Props {
  page: Page
  showSimilarity: boolean
}

export default function ResourceRow({ page, showSimilarity }: Props) {
  const { name: title, path, max_similarity: similarity, created_at, id, status: initialStatus } = page;
  const similarityPercentage = similarity ? (similarity * 100).toFixed(2) : undefined;
  const faviconUrl = getFaviconUrl(path);

  // Subscribe to realtime status updates only for pages still indexing
  const realtimeStatus = usePageStatus(initialStatus === "indexing" ? id : null);
  const status: PageStatus = realtimeStatus ?? initialStatus;

  return (
    <TableRow className={`h-12 hover:bg-transparent ${status === "indexing" ? "opacity-70" : ""}`}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              width={16}
              height={16}
              className="shrink-0"
            />
          )}
          <span>{formatTitle(title)}</span>
          {status === "indexing" && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Indexing
            </Badge>
          )}
          {status === "failed" && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Failed
            </Badge>
          )}
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
