import Navbar from "@/components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen flex flex-col">
      <Navbar />
      <div className="overflow-y-auto">
        <div className="lg:w-[1000px] mx-auto max-h-[calc(100vh-64px)] h-full">
          {children}
        </div>
      </div>
    </main>
  )
}
