"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// **FIX: Correctly import the AdminSidebar component**
import { AdminSidebar } from "./sidebar";
import { useRouter } from "next/navigation";
// --- MODIFICATION: Added necessary imports ---
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
// --- END MODIFICATION ---

export default function AdminHeader() {
  const router = useRouter();
  // --- MODIFICATION: Get auth state ---
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

  const handleProfile = () => {
    router.push("/dashboard/profile");
  };
  // --- END MODIFICATION ---

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
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/DELETED-w-1/3"
            />
          </div>
        </form>
      </div>
      {/* --- MODIFICATION: Replaced Avatar link with Dropdown Menu --- */}
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
          <DropdownMenuItem onClick={handleProfile}>Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* --- END MODIFICATION --- */}
    </header>
  );
}