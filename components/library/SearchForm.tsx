"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormEvent } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SearchForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("query") as string;
    const type = formData.get("type") as "all" | "website" | "note";

    const params = new URLSearchParams(searchParams);

    params.set("query", query);
    params.set("type", type);

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch}>
        <div className="flex space-x-4">
          <Input 
            name="query"
            type="text" 
            defaultValue={searchParams.get("query") ?? ""}
            placeholder="Search your knowledge" 
            className="flex-grow dark:bg-zinc-800/50 dark:border-zinc-700"
          />
          <Select 
            name="type"
            defaultValue={searchParams.get("type") ?? "all"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="note">Note</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-foreground">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </form>
  )
}