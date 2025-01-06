import Results from "@/components/library/ResourceResults";
import SearchForm from "@/components/library/SearchForm";
import ResultSkeleton from "@/components/skeleton/ResultSkeleton";
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
    <div className="flex-1 mx-auto px-4 py-8 w-[937.438px]">
    <div className="space-y-8 text-white">
      <h1 className="text-4xl font-semibold">
        <span className="bg-gradient-to-r text-foreground">Library</span>
      </h1>

      {/* Search Form */}
      <SearchForm />

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
