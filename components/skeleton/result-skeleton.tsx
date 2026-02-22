import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function RowSkeleton() {
  return (
    <TableRow className="h-12">
      <TableCell>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-48 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-16 animate-pulse" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function ResultSkeleton() {
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
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <RowSkeleton key={index} />
        ))}
      </TableBody>
    </Table>
  );
}
