import { Card } from "../ui/card";

function ResourceCardSkeleton() {
  return (
    <Card className="p-6 dark:bg-zinc-800/50 dark:border-zinc-700 transition-colors rounded-md">
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center mb-1">
            {/* Title skeleton */}
            <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3 animate-pulse" />
            {/* External link skeleton */}
            <div className="w-3 h-3 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          </div>
          {/* Date skeleton */}
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 animate-pulse mb-2" />
          {/* Genre skeleton */}
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 animate-pulse mb-4" />
        </div>
        <div className="flex items-center justify-between">
          {/* Similarity percentage skeleton */}
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 animate-pulse" />
          {/* Button skeleton */}
          <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-24 animate-pulse" />
        </div>
      </div>
    </Card>
  )
}

export default function ResultSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((_, index) => (
        <ResourceCardSkeleton key={index} />
      ))}
    </div>
  )
}