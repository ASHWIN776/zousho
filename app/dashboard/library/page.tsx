import AddUrlContainer from "@/components/AddUrlContainer";
import SearchContainer from "@/components/SearchContainer";
import Link from "next/link";

export default function Index() {
  return (
    <main className="flex flex-col gap-y-6 justify-center items-center h-full">
      <span className="text-3xl">Recall It Back!</span>
      <div className="flex gap-x-10 border border-slate-400 rounded-md p-4 h-[500px] w-[1000px]">
        <AddUrlContainer />
        <div className="w-[2px] bg-white"></div>
        <SearchContainer />
      </div>
      <Link href="/chat">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Chat with all your knowledge! 🤖
        </button>
      </Link>
    </main>
  );
}
