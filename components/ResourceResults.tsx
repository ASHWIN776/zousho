import ResourceCard from "./ResourceCard";
import { fetchPages } from "@/lib/actions";

export default async function ResourceResults() {
  const pages = await fetchPages();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {pages.map((page, index) => (
      <ResourceCard 
        key={index}
        title={page.name}
        path={page.path}
      />
    ))}
  </div>
  )
}