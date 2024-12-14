import AddUrlContainer from "@/components/AddUrlContainer";
import SearchContainer from "@/components/SearchContainer";

export default function Index() {
  return (
    <main className="flex justify-center items-center h-full">
      <div className="flex gap-x-10 border border-slate-400 rounded-md p-4 h-[500px]">
        <AddUrlContainer />
        <div className="w-[2px] bg-white"></div>
        <SearchContainer />
      </div>
    </main>
  );
}
