"use client"

import { useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Editor from "@/components/editor"

export default function AddContentPage() {
  const [contentType, setContentType] = useState<"website" | "pdf" | "note">("website")
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState(null)
  const [extractedContent, setExtractedContent] = useState(null)

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const resetFileInput = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetData = async () => {
    setIsLoading(true)
    try {
      if (contentType === "website" && url) {
        // TODO: Add website data fetching logic
        console.log("Fetching website data from:", url)
      } else if (contentType === "pdf" && file) {
        // TODO: Add PDF processing logic
        console.log("Processing PDF:", file.name)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderDynamicInput = () => {
    switch (contentType) {
      case "website":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="url" 
                  type="url" 
                  placeholder="https://example.com" 
                  value={url}
                  className="dark:bg-zinc-800/50 dark:border-zinc-700"
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button 
                  onClick={handleGetData} 
                  disabled={!url || isLoading}
                >
                  {isLoading ? "Loading..." : "Get Data"}
                </Button>
              </div>
            </div>
          </div>
        )
      case "pdf":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf">Upload PDF</Label>
              <div className="flex gap-2">
                <Input 
                  id="pdf" 
                  type="file" 
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="dark:bg-zinc-800/50 dark:border-zinc-700"
                />
                <Button 
                  onClick={handleGetData} 
                  disabled={!file || isLoading}
                >
                  {isLoading ? "Loading..." : "Get Data"}
                </Button>
              </div>
            </div>
          </div>
        )
      case "note":
        return null
    }
  }

  const renderDynamicContent = () => {
    if(contentType === "website" || contentType === "pdf") {
      return (
        <div className="min-h-[800px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg dark:bg-zinc-800/50 dark:border-zinc-700">
          {extractedContent}
        </div>
      )
    }

    return <Editor />
  }

  return (
    <div>
      <div className="px-4 py-8">
        <div className="space-y-8 text-white">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-4xl font-semibold">
              <span className="bg-gradient-to-r text-foreground">Add Content</span>
            </h1>
            <span className="text-sm text-muted-foreground">
              You can import content to the library from websites, PDFs, or from your own notes.
            </span>
          </div>

          <form className="flex flex-col gap-y-6">
            <div className="flex gap-4">
              <div className="w-[300px] space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select 
                  value={contentType}
                  onValueChange={(value: "website" | "pdf" | "note") => {
                    setContentType(value)
                    setTitle("")
                    resetFileInput();
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grow space-y-2">
                <Label htmlFor="content-title">Title</Label>
                <Input 
                  id="content-title" 
                  type="text" 
                  placeholder="Enter content title"
                  value={title}
                  className="dark:bg-zinc-800/50 dark:border-zinc-700"
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {renderDynamicInput()}
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              {renderDynamicContent()}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}