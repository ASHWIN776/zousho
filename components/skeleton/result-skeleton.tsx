import { Skeleton } from "@/components/ui/skeleton";
import { ItemGroup, ItemSeparator } from "@/components/ui/item";

function RowSkeleton() {
  return (
    <div className="flex items-start gap-2 sm:gap-4 py-3 sm:py-4 sm:px-4 px-2">
      {/* Unread dot */}
      <div className="w-2 h-2 rounded-full shrink-0 mt-2 bg-transparent" />

      {/* Avatar */}
      <Skeleton className="h-6 w-6 rounded shrink-0 mt-0.5" />

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Right side */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 shrink-0">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export default function ResultSkeleton() {
  return (
    <ItemGroup className="gap-0 has-data-[size=sm]:gap-0 has-data-[size=xs]:gap-0">
      {[1, 2, 3, 4, 5, 6].map((_, index) => (
        <div key={index}>
          {index > 0 && <ItemSeparator />}
          <RowSkeleton />
        </div>
      ))}
    </ItemGroup>
  );
}
