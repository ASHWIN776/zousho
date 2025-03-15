'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from 'lucide-react'
import { SidebarMenuButton } from '../ui/sidebar'
import { checkDuplicate, generateTextEmbedding, saveNote, saveWebsite, scrapeUrl } from '@/lib/actions'
import { ContentType } from '@/lib/types'
import { toast } from 'sonner'

export function AddContentDialog() {
  const [contentType, setContentType] = useState<'website' | 'note'>('website')
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState("idle")
  const [open, setOpen] = useState(false)

  const getFormValues = (formData: FormData) => {
    const contentType = formData.get("type") as ContentType;
    const url = formData.get("url") as string;
    const title = formData.get("title") as string;
    const note = formData.get("note") as string;

    return { contentType, url, title, note }
  }

  const assertInputs = (formData: FormData): boolean => {
    const { contentType, url, title, note } = getFormValues(formData);

    if (contentType === "website" && !url) {
      toast.error("Please enter a valid URL");
      return false;
    } else if (contentType === "note" && (!title || !note)) {
      toast.error("Please enter both title and note");
      return false;
    }

    return true;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (!assertInputs(formData)) return;
    setIsLoading(true);

    const result = await handleContent(formData);
    setIsLoading(false);

    if (!result) {
      return;
    }

    const { data, error } = result;

    if(error) {
      toast.error(error);
    } else {
      setOpen(false);
      toast.success(
        <span>
          <span className='font-bold'>{data!.name}</span> has been added to your library
        </span>
      )
    }
  }

  const handleUrl = async (formData: FormData) => {
    const { url } = getFormValues(formData);

    setStatusText("Extracting content...");

    const {success: scrapeSuccess, data: scrapedData} = await scrapeUrl(url);

    if (!scrapeSuccess || !scrapedData) {
      toast.error("Failed to get content");
      return;
    }

    setStatusText("Checking content...");

    const { title, markdown } = scrapedData;
    const { isDuplicate, error: checkError, checksum } = await checkDuplicate(markdown);

    if (isDuplicate) {
      toast.error(checkError || "Content already exists");
      return;
    }

    setStatusText("Generating embeddings...");

    const embeddings = await generateTextEmbedding(markdown);

    if (!embeddings) {
      toast.error("Failed to generate embeddings");
      return;
    }

    setStatusText("Saving content...");

    const { data, error: saveError } = await saveWebsite(markdown, title, url, checksum!, embeddings);

    return { data, error: saveError };
  }

  const handleNote = async (formData: FormData) => {
    const { title, note } = getFormValues(formData);
    
    setStatusText("Checking for duplicates...");
    const { isDuplicate, error: checkError, checksum } = await checkDuplicate(note);

    if (isDuplicate) {
      toast.error(checkError || "Content already exists");
      return;
    }

    setStatusText("Saving Content...");
    const embeddings = await generateTextEmbedding(note);

    if (!embeddings) {
      toast.error("Failed to generate embeddings");
      return;
    }

    const { data, error: saveError } = await saveNote(title, note, checksum!, embeddings);

    return { data, error: saveError };
  }

  const handleContent = async (formData: FormData) => {
    const { contentType, url, title, note } = getFormValues(formData);

    if (contentType === "website") {
      return handleUrl(formData);
    } else {
      return handleNote(formData);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <SidebarMenuButton className="hover:bg-primary/90 hover:text-primary-foreground" asChild tooltip="Add Content">
          <Button className="w-full group-data-[collapsible=icon]:w-8 bg-foreground text-background">
            <Plus className="shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Add Content</span>
          </Button>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Content</DialogTitle>
        </DialogHeader>
        <form 
          onSubmit={handleSubmit}
          className="flex flex-col justify-between h-[250px]">
          <div className='flex flex-col gap-y-4'>
            <Select
              name='type'
              value={contentType}
              onValueChange={(value: 'website' | 'note') => setContentType(value)}
            >
              <SelectTrigger defaultValue={contentType}>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            {contentType === 'website' ? (
              <Input  
                name='url'
                placeholder="Enter website URL" 
              />
            ) : (
              <>
                <div className="flex flex-col gap-y-2">
                  <Input
                    name='title'
                    placeholder="Enter note title" 
                  />
                  <Textarea 
                    name="note"
                    placeholder="Enter note content" 
                  />
                </div>
              </>
            )}
          </div>
          <Button 
            disabled={isLoading}
            type="submit" className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {statusText}
              </>
            ) : (
              'Save'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
