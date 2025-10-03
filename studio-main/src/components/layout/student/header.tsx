
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
import { BookCopy, MessageSquare } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { useMessaging } from "@/contexts/messaging-context";

export default function StudentHeader() {
  const studentAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl ?? "https://picsum.photos/seed/1/100/100";
  const router = useRouter();
  const { isChatOpen, openChat, closeChat } = useMessaging();

  const handleLogout = () => {
    router.push('/login');
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
             <Sheet open={isChatOpen} onOpenChange={(isOpen) => isOpen ? openChat() : closeChat()}>
              <SheetTrigger asChild>
                <Button variant="link" className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto">
                    <MessageSquare className="h-5 w-5" />
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
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Alice Johnson</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
