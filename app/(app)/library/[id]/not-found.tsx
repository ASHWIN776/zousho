import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  
  return (
    <div className="flex flex-col gap-y-2 justify-center items-center h-full">
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="text-white">The page you are looking for does not exist or has been moved.</p>
      <Link href="/library" className="text-white">
        <Button>
        Go back to library
        </Button>
      </Link>
    </div>
  )
}