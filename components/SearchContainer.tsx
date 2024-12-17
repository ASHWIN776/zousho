"use client"

import { searchQuery } from "@/lib/actions";
import { IDLE_STATUS } from "@/lib/contants";
import { ResultType } from "@/lib/types";
import React, { useState } from "react";

export default function SearchContainer() {
  const [searchResults, setSearchResults] = useState<ResultType[]>([]);
  const [status, setStatus] = useState(IDLE_STATUS);

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("query") as string;
    const contentType = formData.get("type") as "all" | "website" | "note";

    setStatus("Searching for the query");
    const results = await searchQuery(query, contentType);
    setStatus(IDLE_STATUS);

    if (results) {
      setSearchResults(results);
    }
  }

  return (
    <div className="grow flex flex-col gap-y-4">
      <span>Search Content Here!</span>
      <form 
        onSubmit={search}
        className="flex flex-col gap-y-3"
      >
        <div className="flex gap-x-2">
          <label htmlFor="">Content Type: </label>

          <div className="flex gap-x-1">
            <input 
              type="radio" 
              name="type" 
              id="all" 
              value="all"
              defaultChecked
            />
            <label htmlFor="website">All</label>
          </div>

          <div className="flex gap-x-1">
            <input 
              type="radio" 
              name="type" 
              id="website" 
              value="website"
            />
            <label htmlFor="website">Website</label>
          </div>

          <div className="flex gap-x-1">
            <input 
              type="radio" 
              name="type" 
              id="note" 
              value="note" 
            />
            <label htmlFor="note">Personal Note</label>
          </div>
        </div>

        <input
          name="query"
          className="p-4 border border-gray-300 rounded-lg w-96" 
          type="text" 
          placeholder="Search" 
        />

        <button
          disabled={status !== IDLE_STATUS} 
          className="p-4 bg-blue-500 text-white rounded-lg disabled:opacity-40">
          Search
        </button>
      </form>
      <span>{status}</span>
      <div className="flex flex-col gap-y-4">
        <span className="text-xl self-center">Results</span>
        <div className="flex flex-col gap-y-1 overflow-y-auto">
          {
            searchResults.map((page, index) => (
              <a
                key={index} 
                href={page.path}>{index + 1}. {page.name} - {page.max_similarity.toFixed(2)}</a>
            ))
          }
        </div>
      </div>
    </div>
  )
}