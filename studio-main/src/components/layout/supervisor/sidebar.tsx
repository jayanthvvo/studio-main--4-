"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// --- MODIFICATION: Removed MessageSquare icon ---
import { BookCopy, LayoutDashboard, User, GanttChartSquare } from "lucide-react"; 
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
// --- MODIFICATION: Removed Sheet and ChatInterface ---
import { ThesisFlowLogo } from "../../logo";
// --- MODIFICATION: Removed useMessaging import ---

// Nav items remain the same
export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/submissions", icon: BookCopy, label: "Submissions" },
  { href: "/dashboard/timeline", icon: GanttChartSquare, label: "Timeline" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function SidebarItems() {
  const pathname = usePathname();
  // --- MODIFICATION: Removed useMessaging hook ---

  return (
    <>
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
            <ThesisFlowLogo className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold font-headline">ThesisFlow</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {/* --- MODIFICATION: The entire "Messages" SidebarMenuItem block has been removed --- */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto border-t">
      </SidebarFooter>
    </>
  );
}


export default function SupervisorAppSidebar() {
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="hidden md:flex flex-col">
      <SidebarItems />
    </Sidebar>
  );
}