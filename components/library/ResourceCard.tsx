import { ExternalLink, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import Link from "next/link";
import { Page } from "@/lib/types";
import { format } from 'date-fns'
import { formatTitle } from "@/lib/helper";

interface Props {
  page: Page
}

export default function ResourceCard({ page }: Props) {
  const { name: title, path, max_similarity: similarity, created_at } = page;
  const similarityPercentage = similarity ? (similarity * 100).toFixed(2) : undefined;

  return (
    <Card className="p-6 dark:bg-zinc-800/50 dark:border-zinc-700 transition-colors rounded-md">
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-md font-semibold text-secondary-foreground">{formatTitle(title)}</span>
            <Link
              href={path ?? "#"} 
              target="_blank"
            >
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
          <p className="text-xs text-zinc-300 mb-2">{format(created_at, 'MMMM d, yyyy')}</p>
          <p className="text-xs text-zinc-400 mb-4">Genre</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">{
            similarityPercentage ? 
            `${similarityPercentage}% match` : 
            undefined
          }</span>
          <Button className="bg-foreground text-xs">
            <Plus /> 
            Chat Group
          </Button>
        </div>
      </div>
    </Card>
  )
}