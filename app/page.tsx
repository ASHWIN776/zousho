import AddUrlContainer from "@/components/AddUrlContainer";
import SearchContainer from "@/components/SearchContainer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Index() {
  return (
    <main className="flex flex-col justify-center items-center h-full gap-y-4">
      <div className="flex flex-col justify-center items-center gap-y-1">
        <span className="text-3xl">Recall</span>
        <div className="text-zinc-400 text-md flex flex-col items-center">
          <span>Document your learnings easily</span>
          <span>Recall it whenever you need!</span>
        </div>
      </div>
      <Link href="/dashboard">
        <Button>Try the App</Button>
      </Link>
    </main>
  );
}
