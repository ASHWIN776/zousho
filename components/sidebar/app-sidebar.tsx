import { Calendar, Library, Bot, Search, Settings, Plus } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Item from "./Item"
import { AddContentDialog } from "./AddContentDialog"

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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-md text-center"
            asChild>
              <span>Recall</span>  
            </SidebarMenuButton>  
          </SidebarMenuItem>
        </SidebarMenu>
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
    </Sidebar>
  )
}
