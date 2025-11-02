"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// --- MODIFICATION: Removed Settings icon ---
import { BookCopy, LayoutDashboard, MessageSquare, User, GanttChartSquare } from "lucide-react"; 
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { ThesisFlowLogo } from "../../logo";
import { ChatInterface } from "../../messaging/chat-interface";
import { useMessaging } from "@/contexts/messaging-context";

// --- MODIFICATION: Removed settings link from navItems ---
export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/submissions", icon: BookCopy, label: "Submissions" },
  { href: "/dashboard/timeline", icon: GanttChartSquare, label: "Timeline" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];
// --- END MODIFICATION ---

export function SidebarItems() {
  const pathname = usePathname();
  const { isChatOpen, openChat, closeChat } = useMessaging();

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
          <SidebarMenuItem>
             <Sheet open={isChatOpen} onOpenChange={(isOpen) => isOpen ? openChat() : closeChat()}>
              <SheetTrigger asChild>
                <SidebarMenuButton tooltip={{ children: 'Messages' }} className="w-full justify-start">
                    <MessageSquare />
                    <span>Messages</span>
                </SidebarMenuButton>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] p-0 border-l">
                  <ChatInterface perspective="supervisor" />
              </SheetContent>
            </Sheet>
          </SidebarMenuItem>
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