import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Link from "next/link";
import { Page } from "@/lib/types";
import { format } from 'date-fns'
import { formatTitle } from "@/lib/helper";
import { deletePage } from "@/lib/actions";
import { toast } from "sonner";
import DeleteContentDialog from "./DeleteDialog";

interface Props {
  page: Page
}

export default function ResourceCard({ page }: Props) {
  const { name: title, path, max_similarity: similarity, created_at, id } = page;
  const similarityPercentage = similarity ? (similarity * 100).toFixed(2) : undefined;

  return (
    <Card className="p-6 dark:bg-zinc-800/50 dark:border-zinc-700 transition-colors rounded-md">
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between mb-1">
            <Link
              className="text-md font-semibold text-secondary-foreground"
              href={path ?? `/library/${id}`}
              target={path ? "_blank" : "_self"}
            >
              {formatTitle(title)}
            </Link>
            <DeleteContentDialog
              page={page}
            />
          </div>
          <p className="text-xs text-zinc-300 mb-2">{format(created_at, 'MMMM d, yyyy')}</p>
          <p className="text-xs text-zinc-400 mb-4">{page.type.slice(0, 1).toUpperCase() + page.type.slice(1)}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">{
            similarityPercentage ? 
            `${similarityPercentage}% match` : 
            undefined
          }</span>
          <Button 
            className="bg-foreground text-xs"
            disabled
          >
            <Plus /> 
            Chat Group
          </Button>
        </div>
      </div>
    </Card>
  )
}