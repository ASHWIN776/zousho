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
import { saveNote, saveUrl } from '@/lib/actions'
import { ContentType } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export function AddContentDialog() {
  const [contentType, setContentType] = useState<'website' | 'note'>('website')
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const contentType = formData.get("type") as ContentType;

    console.log(contentType);
    setIsLoading(true);

    try {
      if (contentType === "website") {
        await handleUrl(formData);
      } else {
        await handleNotes(formData);
      }

      setOpen(false);
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: (error as Error).message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false);
    }
  }

  const handleUrl = async (formData: FormData) => {
    const url = formData.get("url") as string;

    if(url){
      await saveUrl(url);
    }
  }

  const handleNotes = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const note = formData.get("note") as string;

    console.log(title, note);

    if(note && title){
      await saveNote(title, note);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <SidebarMenuButton className="hover:bg-primary/90 hover:text-primary-foreground" asChild tooltip="Add">
          <Button className="w-full group-data-[collapsible=icon]:w-8 bg-foreground text-background">
            <Plus className="shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Add</span>
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
                Please wait
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

