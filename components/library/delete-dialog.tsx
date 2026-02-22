"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deletePage } from "@/lib/actions"
import { Page } from "@/lib/types"
import { Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Props {
  page: Page
}

export default function DeleteContentDialog({
  page,
}: Props) {

  const handleDelete = async (id: Page["id"]) => {
    const { data, error } = await deletePage(id);

    if(error) {
      toast.error(error);
    } else {
      toast.success(
        <span>
          <span className='font-bold'>{data!.name}</span> has been removed from your library
        </span>
      )
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="flex items-start"
      >
        <Trash2 className="w-4 h-4 text-red-500 hover:text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-y-2">
            <span>
              This action cannot be undone. This will permanently delete the following content: 
            </span>
            <span>
              {
                page.path 
                ?
                  <Link 
                    href={page.path}
                    className="font-bold"
                  >
                    {` ${page.name}`}
                  </Link>
                : 
                  <span className="font-bold">  {` ${page.name}`}
                  </span>
              }
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-foreground hover:bg-destructive/90"
            onClick={() => handleDelete(page.id)}
          >Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}