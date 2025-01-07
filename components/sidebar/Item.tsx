"use client";

import { ReactNode } from "react";
import { SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { usePathname } from "next/navigation";

interface Props {
  title: string;
  url: string;
  icon: ReactNode
}

export default function Item({
  title, 
  url,
  icon,
}: Props) {
  const pathname = usePathname();

  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton 
        asChild
        isActive={pathname === url}
      >
        <a href={url}>
          {icon}
          <span>{title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}