import Results from "@/components/library/ResourceResults";
import SearchForm from "@/components/library/SearchForm";
import { ContentType } from "@/lib/types";

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
      <Results 
        query={query}
        type={type}
      />
    </div>
  </div>
  );
}
