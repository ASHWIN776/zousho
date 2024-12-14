"use client"

import { saveUrl } from "@/lib/actions";
import { IDLE_STATUS } from "@/lib/contants";
import { Page } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function AddUrlContainer() {
  const [pages, setPages] = useState<Page[]>([]);
  const [status, setStatus] = useState(IDLE_STATUS);
  const supabase = createClient();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const url = formData.get("url") as string;

    console.log("URL", url);

    if (!url) return;
    setStatus("Fetching Data and saving to the database");

    await saveUrl(url);
    setStatus(IDLE_STATUS);
    fetchPages();
  }

  const fetchPages = async () => {
    const { data: pages, error } = await supabase.from("pages").select().returns<Page[]>();

    if (error) {
      console.error(error);
    }

    setPages(pages ?? []);
  }

  useEffect(() => {
    console.log("Running Use Effect");
    fetchPages();
  }, []);

  return (
    <div className="grow flex flex-col gap-y-4">
      <span>Save Content Here!</span>
      <form 
        onSubmit={onSubmit}
        className="flex justify-center items-center"
      >
        <input
          name="url"
          defaultValue={""}
          className="p-4 border border-gray-300 rounded-lg w-96" 
          type="text" 
          placeholder="Enter URL" 
        />

        <button
          disabled={status !== IDLE_STATUS} 
          className="p-4 bg-blue-500 text-white rounded-lg ml-2 disabled:opacity-40">
          Submit
        </button>
      </form>
      <span>{status}</span>
      <span className="text-xl self-center">Pages Added - {pages.length}</span>
      <div className="flex flex-col gap-y-4 overflow-y-auto">
        <div className="flex flex-col gap-y-1">
          {
            pages.map((page, index) => (
              <a
                key={index} 
                href={page.path} target="_blank">{index + 1}. {page.name}
              </a>
            ))
          }
        </div>
      </div>
    </div>
  )
}