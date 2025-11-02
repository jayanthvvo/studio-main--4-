"use client";

// --- MODIFICATION: Removed Bell and Search icons ---
import { PanelLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
// --- MODIFICATION: Removed Input ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarItems } from "./sidebar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRouter } from "next/navigation";
// MODIFICATION: Import the useAuth hook
import { useAuth } from "@/contexts/auth-context";

export default function SupervisorHeader() {
  const supervisorAvatar =
    PlaceHolderImages.find((p) => p.id === "supervisor-avatar")?.imageUrl ??
    "https://picsum.photos/seed/5/100/100";
  const router = useRouter();
  // MODIFICATION: Get the displayName from the auth context
  const { displayName } = useAuth();

  const handleLogout = () => {
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/dashboard/profile");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0 border-r-0">
          <div className="flex h-full flex-col">
            <SidebarItems />
          </div>
        </SheetContent>
      </Sheet>

      {/* --- MODIFICATION: Removed Search Bar --- */}
      <div className="ml-auto flex-1 md:grow-0">
        {/* Search bar removed */}
      </div>
      {/* --- END MODIFICATION --- */}
      
      {/* --- MODIFICATION: Removed Notification Bell --- */}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="overflow-hidden rounded-full h-9 w-9"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={supervisorAvatar}
                alt="Supervisor"
                data-ai-hint="professor portrait"
              />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* MODIFICATION: Display the dynamic name */}
          <DropdownMenuLabel>
            {displayName || "Supervisor Profile"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile}>Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}