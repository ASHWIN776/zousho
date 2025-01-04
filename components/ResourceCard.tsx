import { ExternalLink, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import Link from "next/link";

interface Props {
  title: string;
  path: string | null;
}

export default function ResourceCard({
  title,
  path,
}: Props) {
  return (
    <Card className="p-6 dark:bg-zinc-800/50 dark:border-zinc-700 transition-colors rounded-md">
      <div className="flex items-start space-x-4">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-1">
            <span className="text-md font-semibold text-secondary-foreground">{title}</span>
            <Link
              href={path ?? "#"} 
              target="_blank"
            >
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </Link>
          </div>
          <p className="text-xs text-zinc-300 mb-2">{new Date().toLocaleDateString()}</p>
          <p className="text-xs text-zinc-400 mb-4">Genre</p>
          <div className="flex items-center justify-end">
            <Button className="bg-foreground text-xs">
              <Plus /> 
              Search Group
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}