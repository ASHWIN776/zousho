import Results from "@/components/library/resource-results";
import SmartBar from "@/components/library/smart-bar";
import ResultSkeleton from "@/components/skeleton/result-skeleton";
import { ContentType } from "@/lib/types";
import { Suspense } from "react";

interface SearchParamsType {
  query?: string;
  type?: string
}

export default async function Page({
  searchParams
}: {
  searchParams: Promise<SearchParamsType>
}) {
  const query = (await searchParams)?.query;
  const type = ((await searchParams)?.type ?? "all") as ContentType;

  return (
    <div className="flex-1 px-4 py-8">
    <div className="space-y-8 text-white">
      <h1 className="text-4xl font-semibold">
        <span className="bg-gradient-to-r text-foreground">Library</span>
      </h1>

      {/* Smart Bar */}
      <Suspense fallback={<div className="h-9" />}>
        <SmartBar />
      </Suspense>

      {/* Search Results */}
      <Suspense
        key={query + type}
        fallback={<ResultSkeleton />}
      >
        <Results query={query} type={type} />
      </Suspense>
    </div>
  </div>
  );
}
