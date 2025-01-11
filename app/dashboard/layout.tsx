import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="grow flex flex-col">
        <SidebarTrigger />
        <div className="grow lg:w-[937.438px] mx-auto">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
