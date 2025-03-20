"use client"

import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    title: "Chat",
    url: "/chat"
  },
  {
    title: "Library",
    url: "/library"
  }
]

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="h-16 px-20 flex items-center justify-between border-b border-dashed">
      <NavigationMenu>
        <NavigationMenuList className="gap-6">
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className="text-lg">
                Recall
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          {
            links.map(navLink => (
              <NavigationMenuItem key={navLink.title} className="text-sm">
                <Link href={navLink.url} legacyBehavior passHref>
                  <NavigationMenuLink className={pathname === navLink.url ? "text-foreground" : "transition-colors hover:text-foreground text-foreground/80"}>
                    {navLink.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))
          }
        </NavigationMenuList>
      </NavigationMenu>
      <Link href="/add-content">
        <Button disabled={pathname === "/add-content"} className="text-sm" size="sm">
          <Plus/>
          Add Content
        </Button>
      </Link>
    </nav>
  )
}