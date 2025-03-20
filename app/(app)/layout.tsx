import Navbar from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grow flex flex-col">
      <Navbar />
      <div className="lg:w-[1000px] mx-auto">
        {children}
      </div>
    </main>
  )
}
