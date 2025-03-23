import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  
  return (
    <div className="flex flex-col gap-y-8 justify-center items-center h-full">
      <div className="flex flex-col gap-y-1 items-center">
        <h1 className="text-4xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist or has been moved.</p>
      </div>
      <Button asChild>
        <Link href="/library">
          Go back to library
        </Link>
      </Button>
    </div>
  )
}