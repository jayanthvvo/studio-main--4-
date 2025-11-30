// src/components/layout/supervisor/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookCopy, 
  LayoutDashboard, 
  User, 
  GanttChartSquare, 
  MessageSquare, 
  ChevronRight,
  Loader2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ThesisFlowLogo } from "../../logo";
import { useMessaging } from "@/contexts/messaging-context";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

// Nav items
export const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/submissions", icon: BookCopy, label: "Submissions" },
  { href: "/dashboard/timeline", icon: GanttChartSquare, label: "Timeline" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
];

export function SidebarItems() {
  const pathname = usePathname();
  const { openChat } = useMessaging();
  const { user } = useAuth();
  const { setOpenMobile, isMobile } = useSidebar();
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const token = await user.getIdToken();
        // --- FIXED TYPO HERE: changed constPX to const ---
        const res = await fetch("/api/my-students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.error("Failed to load students for sidebar", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  const handleStudentClick = (student: any) => {
    openChat({
      _id: student._id || student.uid, // Fallback if _id is missing
      displayName: student.displayName,
      avatarUrl: student.avatarUrl
    });
    // Close sidebar on mobile when a selection is made
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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

          {/* Messages Collapsible Section */}
          <Collapsible className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip="Messages">
                  <MessageSquare />
                  <span>Messages</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {loading ? (
                     <SidebarMenuSubItem>
                        <span className="flex items-center text-muted-foreground text-xs px-2 py-1">
                          <Loader2 className="h-3 w-3 animate-spin mr-2"/> Loading...
                        </span>
                     </SidebarMenuSubItem>
                  ) : students.length === 0 ? (
                     <SidebarMenuSubItem>
                        <span className="text-muted-foreground text-xs px-2 py-1">No students assigned</span>
                     </SidebarMenuSubItem>
                  ) : (
                    students.map((student) => (
                      <SidebarMenuSubItem key={student.uid || student._id}>
                        <SidebarMenuSubButton onClick={() => handleStudentClick(student)} className="cursor-pointer">
                          <span>{student.displayName}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

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