// src/components/layout/student/header.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThesisFlowLogo } from "@/components/logo";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookCopy, MessageSquare, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { useMessaging } from "@/contexts/messaging-context";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function StudentHeader() {
  const studentAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl ?? "https://picsum.photos/seed/1/100/100";
  const router = useRouter();
  const { isChatOpen, openChat, closeChat } = useMessaging();
  const { user, displayName } = useAuth();
  const [isFetchingSupervisor, setIsFetchingSupervisor] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    router.push('/login');
  };
  
  // --- MODIFICATION: Added handler for profile click ---
  const handleProfile = () => {
    router.push('/student/profile');
  };
  // --- END MODIFICATION ---

  const handleOpenChat = async () => {
    if (!user) return;
    setIsFetchingSupervisor(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/my-supervisor', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not find your assigned supervisor.');
      }
      const supervisor = await response.json();
      openChat({
        _id: supervisor._id,
        displayName: supervisor.displayName,
        avatarUrl: supervisor.avatarUrl
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsFetchingSupervisor(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
       <Link href="/student/dashboard" className="flex items-center gap-2">
            <ThesisFlowLogo className="w-8 h-8 text-primary" />
            <span className="text-xl font-semibold font-headline">ThesisFlow</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium ml-10">
            <Link href="/student/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <BookCopy className="h-5 w-5" />
                My Submissions
            </Link>
             <Sheet open={isChatOpen} onOpenChange={(isOpen) => !isOpen && closeChat()}>
              <SheetTrigger asChild>
                <Button variant="link" className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto" onClick={handleOpenChat} disabled={isFetchingSupervisor}>
                    {isFetchingSupervisor ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageSquare className="h-5 w-5" />}
                    Messages
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] p-0 border-l">
                  <ChatInterface perspective="student" />
              </SheetContent>
            </Sheet>
        </nav>

      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="overflow-hidden rounded-full h-9 w-9">
              <Avatar className="h-9 w-9">
                <AvatarImage src={studentAvatar} alt="Student" data-ai-hint="student portrait" />
                <AvatarFallback>{displayName?.substring(0,2).toUpperCase() || 'ST'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{displayName || 'Student Profile'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* --- MODIFICATION: Added onClick handler --- */}
            <DropdownMenuItem onClick={handleProfile}>Profile</DropdownMenuItem>
            {/* --- END MODIFICATION --- */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}