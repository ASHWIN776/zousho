import { Calendar, Library, Bot, Search, Settings, Plus } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Item from "./Item"
import { AddContentDialog } from "./AddContentDialog"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Chat",
    url: "/dashboard",
    icon: Bot,
  },
  {
    title: "Library",
    url: "/dashboard/library",
    icon: Library,
  }
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="text-center py-4">
          <Link
            href="/"
            className="text-lg text-center"
          >
            <span>R</span>
            <span className="group-data-[collapsible=icon]:hidden">ecall</span>
          </Link>  
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <AddContentDialog />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Options</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <Item 
                  key={item.title} 
                  title={item.title}
                  url={item.url}
                  icon={<item.icon />}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="py-1">
          <UserButton 
            showName
            appearance={{
              elements: {
                userButtonBox: "flex flex-row-reverse items-center gap-x-1",
                userButtonOuterIdentifier: "group-data-[collapsible=icon]:hidden text-base"
              }
            }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
