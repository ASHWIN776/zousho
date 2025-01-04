import Results from "@/components/ResourceResults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Index() {
  return (
    <div className="flex-1 mx-auto px-4 py-8 w-[937.438px]">
    <div className="space-y-8 text-white">
      <h1 className="text-4xl font-semibold">
        <span className="bg-gradient-to-r text-foreground">Library</span>
      </h1>

      {/* Search Form */}
      <div className="flex space-x-4">
        <Input 
          type="text" 
          placeholder="Search your knowledge" 
          className="flex-grow dark:bg-zinc-800/50 dark:border-zinc-700"
        />
        <Button className="bg-foreground hover:bg-blue-700">
          <Search className="w-4 h-4" />
          Search
        </Button>
      </div>

      {/* Search Results */}
      <Results />
    </div>
  </div>
  );
}
