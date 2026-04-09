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
import { Button } from "../ui/button"
import { DropdownMenuItem } from "../ui/dropdown-menu"

interface Props {
  page: Page
  variant?: "icon" | "button" | "dropdown"
}

export default function DeleteContentDialog({
  page,
  variant = "icon",
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
      <AlertDialogTrigger asChild>
        {variant === "dropdown" ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        ) : (
          <Button variant="destructive" size="sm">
            <Trash2 />
            Delete
          </Button>
        )}
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
            onClick={() => handleDelete(page.id)}
          >Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}