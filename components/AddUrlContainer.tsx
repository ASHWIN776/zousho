"use client"

import { saveNote, saveUrl } from "@/lib/actions";
import { IDLE_STATUS } from "@/lib/contants";
import { Page } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function AddUrlContainer() {
  const [contentType, setContentType] = useState("website");
  const [pages, setPages] = useState<Page[]>([]);
  const [status, setStatus] = useState(IDLE_STATUS);
  const supabase = createClient();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contentType = formData.get("type") as string;
    
    if (contentType === "website") {
      await handleUrl(formData);
    } else {
      await handleNotes(formData);
    }

    setStatus(IDLE_STATUS);
    fetchPages();
  }

  const handleUrl = async (formData: FormData) => {
    const url = formData.get("url") as string;

    if (!url) return;

    setStatus("Fetching Data and saving to the database");
    await saveUrl(url);
  }

  const handleNotes = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const note = formData.get("note") as string;

    if (!note || !title) return;

    setStatus("Saving Note to the database");
    await saveNote(title, note);
  }

  const onContentTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContentType(event.target.value);
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
        className="flex flex-col gap-y-3"
      >
        <div className="flex gap-x-2">
          <label htmlFor="">Content Type: </label>

          <div className="flex gap-x-1">
            <input 
              type="radio" 
              name="type" 
              id="website" 
              value="website" 
              checked={contentType === "website"} 
              onChange={onContentTypeChange}
            />
            <label htmlFor="website">Website</label>
          </div>

          <div className="flex gap-x-1">
            <input 
              type="radio" 
              name="type" 
              id="note" 
              value="note" 
              checked={contentType === "note"}
              onChange={onContentTypeChange} 
            />
            <label htmlFor="note">Personal Note</label>
          </div>
        </div>
        
        {
          // For website show input field, for note show textarea
          contentType === "website" ?
            <input
              name="url"
              defaultValue={""}
              className="p-4 border border-gray-300 rounded-lg w-96" 
              type="text" 
              placeholder="Enter URL" 
            />
          : 
          <>
            <input 
              name="title"
              className="p-4 border border-gray-300 rounded-lg"
              placeholder="Enter Title"
              type="text"
            />
            <textarea 
              name="note" 
              className="p-4 border border-gray-300 rounded-lg" 
              placeholder="Enter Note" 
            />
          </>
        }

        <button
          disabled={status !== IDLE_STATUS} 
          className="p-4 bg-blue-500 text-white rounded-lg disabled:opacity-40">
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