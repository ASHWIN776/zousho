import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { MoveRight } from "lucide-react";

export default async function Index() {
  return (
    <main className="flex flex-col justify-center items-center h-full gap-y-5">
      <div className="flex flex-col justify-center items-center gap-y-1">
        <span className="text-9xl">Recall</span>
        <div className="text-zinc-400 text-md flex flex-col items-center">
          <span>Save what catches your eye</span>
          <span>Recall it anytime</span>
        </div>
      </div>
      <SignedIn>
        <Link href="/library">
          <Button>
            Try the App
            <MoveRight />
          </Button>
        </Link>
      </SignedIn>
      <SignedOut>
        <div className="flex gap-x-3">
          <Link href="/sign-in">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </SignedOut>
    </main>
  );
}
