"use client"

import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  {
    title: "Library",
    url: "/library"
  },
  {
    title: "Chat",
    url: "/chat"
  }
]

export default function Navbar() {
  const pathname = usePathname();
  const isCurrentPath = (path: string) => pathname.startsWith(path);

  return (
    <nav className="h-16 px-20 flex items-center justify-between border-b border-dashed">
      <NavigationMenu>
        <NavigationMenuList className="gap-6">
          <NavigationMenuItem>
            <Link href="/" className="text-lg">
              Recall
            </Link>
          </NavigationMenuItem>
          <NavigationMenuList className="gap-4">
            {
              links.map(navLink => (
                <NavigationMenuItem key={navLink.title} className="text-sm">
                  <Link
                    href={navLink.url}
                    className={isCurrentPath(navLink.url) ? "text-foreground" : "transition-colors hover:text-foreground text-foreground/80"}>
                    {navLink.title}
                  </Link>
                </NavigationMenuItem>
              ))
            }
          </NavigationMenuList>
            
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-x-4">
        <Link href="/add-content">
          <Button disabled={isCurrentPath("/add-content")} className="text-sm" size="sm">
            <Plus/>
            Add Content
          </Button>
        </Link>
        <ThemeToggle />
        <UserButton
          appearance={{
            elements: {
              userButtonBox: "flex flex-row-reverse items-center gap-x-1",
              userButtonOuterIdentifier: "group-data-[collapsible=icon]:hidden text-base"
            }
          }}
        />
      </div>
    </nav>
  )
}