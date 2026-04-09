import { fetchPage } from "@/lib/actions";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default async function Page({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;
  const { data, error } = await fetchPage(id);

  if(error || !data){
    notFound();
  }

  return (
    <div className="px-4 py-8 max-w-(--breakpoint-lg) mx-auto">
      <div className="space-y-12">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-2xl sm:text-4xl font-semibold">
            {data.name}
          </h1>
          <span className="text-muted-foreground text-sm">
            {data.author && `${data.author} · `}
            {format(data.created_at, 'MMMM d, yyyy')}
          </span>
        </div>

        <div className="min-h-[800px] w-full max-w-(--breakpoint-lg) border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg dark:bg-zinc-800/50 dark:border-zinc-700 p-4 sm:p-8 md:p-12">
          <ReactMarkdown>{data.content.replace(/\n/g, "\n\n")}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}