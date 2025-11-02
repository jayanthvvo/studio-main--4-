"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
// --- MODIFICATION: Removed Search icon ---
import { Menu } from "lucide-react";
// --- MODIFICATION: Removed Input ---
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// **FIX: Correctly import the AdminSidebar component**
import { AdminSidebar } from "./sidebar";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function AdminHeader() {
  const router = useRouter();
  const { displayName } = useAuth();

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          {/* **FIX: Use the correct component name here** */}
          <AdminSidebar />
        </SheetContent>
      </Sheet>
      
      {/* --- MODIFICATION: Removed search bar form --- */}
      <div className="w-full flex-1">
        {/* Search bar removed */}
      </div>
      {/* --- END MODIFICATION --- */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="overflow-hidden rounded-full h-9 w-9"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="Admin"
              />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            {displayName || "Admin Account"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}