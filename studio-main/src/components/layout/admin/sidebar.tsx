"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThesisFlowLogo } from "@/components/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Settings, LayoutDashboard, FolderKanban } from "lucide-react";
// **FIX: Import the shared Sidebar component**
import { Sidebar } from "@/components/ui/sidebar";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    // **FIX: Use the Sidebar component which handles positioning automatically**
    <Sidebar>
      <div className="flex items-center justify-center h-16 border-b px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <ThesisFlowLogo className="h-6 w-6" />
          <span className="">ThesisFlow</span>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="grid items-start px-4 text-sm font-medium">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                pathname === href && "bg-muted text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </Sidebar>
  );
}