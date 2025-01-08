"use client";

import { ReactNode } from "react";
import { SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
        <Link href={url}>
          {icon}
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}