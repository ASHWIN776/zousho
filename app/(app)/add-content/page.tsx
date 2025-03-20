"use client"

import { useRef, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { scrapeUrl } from "@/lib/actions"
import { CodeBlock } from "@/components/code-block"
import ReactMarkdown from "react-markdown"

// Lazy load the editor component
const Editor = dynamic(() => import("@/components/editor"), { ssr: false })

export default function AddContentPage() {
  const [contentType, setContentType] = useState<"website" | "pdf" | "note">("website")
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState(null)
  const [extractedContent, setExtractedContent] = useState<string | null>(null)

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
        console.log("Fetching website data from:", url)

        const { success, data } = await scrapeUrl(url);
        if (success && data) {
          console.log("Fetched website data:", data.markdown)
          setTitle(data.title);
          setExtractedContent(data.markdown);
        }
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

  // TODO: Simplify this
  const renderDynamicInput = () => {
    switch (contentType) {
      case "website":
        return (
          <div className="space-y-2 grow">
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
                variant="outline"
                onClick={handleGetData} 
                disabled={!url || isLoading}
              >
                {isLoading ? "Loading..." : "Get Data"}
              </Button>
            </div>
          </div>
        )
      case "pdf":
        return (
          <div className="space-y-2 grow">
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
                variant="outline"
                onClick={handleGetData} 
                disabled={!file || isLoading}
              >
                {isLoading ? "Loading..." : "Get Data"}
              </Button>
            </div>
          </div>
        )
      case "note":
        return (
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
        )
    }
  }

  const renderDynamicContent = () => {
    if(contentType === "website" || contentType === "pdf") {
      return (
        <div className="min-h-[800px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg dark:bg-zinc-800/50 dark:border-zinc-700 p-12">
          {
            extractedContent ? (
              <ReactMarkdown
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;
                  return !isInline ? (
                    <CodeBlock
                      language={match[1]}
                      value={String(children).replace(/\n$/, '')}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {extractedContent}
            </ReactMarkdown>
            ) : null
          }
        </div>
      )
    }

    return <Editor />
  }

  return (
    <div>
      <div className="px-4 py-8">
        <div className="space-y-8 text-white">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-4xl font-semibold">
                <span className="bg-gradient-to-r text-foreground">Add Content</span>
              </h1>
              <span className="text-sm text-muted-foreground">
                You can import content to the library from websites, PDFs, or even write your own notes.
            </span>
            </div>
            <Button
              className="w-[100px]"
              disabled={!(title && (extractedContent || content))}
              onClick={() => {
                // TODO: Implement save functionality
                console.log("Saving content:", {
                  type: contentType,
                  title,
                  url,
                  content: extractedContent || content
                })
              }}
            >
              Save
            </Button>
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
                    setExtractedContent(null);
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

              {renderDynamicInput()}
            </div>

            {
              contentType !== "note" 
              ? (
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
              )
              : null
            }
            
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