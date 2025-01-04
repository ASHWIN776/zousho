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
import { Button } from "../ui/button"
import Item from "./Item"

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
            <SidebarMenuButton asChild tooltip="Add">
              <Button variant="outline" className="w-full group-data-[collapsible=icon]:w-8 bg-foreground text-background">
                <Plus className="shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Add</span>
              </Button>
            </SidebarMenuButton>
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
