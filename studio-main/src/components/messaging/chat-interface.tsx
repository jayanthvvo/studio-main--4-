// src/components/messaging/chat-interface.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SendHorizonal, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, FormEvent } from "react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SheetHeader, SheetTitle } from "../ui/sheet";
import type { Message } from "@/lib/types";


interface ChatInterfaceProps {
    perspective: 'student' | 'supervisor';
}

export function ChatInterface({ perspective = 'supervisor' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const studentAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl ?? "https://picsum.photos/seed/1/100/100";
  const supervisorAvatar = PlaceHolderImages.find(p => p.id === 'supervisor-avatar')?.imageUrl ?? "https://picsum.photos/seed/5/100/100";

  const selfSender = perspective;
  const otherParty = perspective === 'supervisor' ? { name: 'Alice Johnson', avatar: studentAvatar, fallback: 'AJ', hint: 'woman portrait' } : { name: 'Dr. Evelyn Reed', avatar: supervisorAvatar, fallback: 'S', hint: 'professor portrait' };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newMessage, sender: selfSender }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="p-4 border-b">
        <div className="flex items-center">
            <Avatar className="h-9 w-9 mr-4">
                <AvatarImage src={otherParty.avatar} alt={otherParty.name} data-ai-hint={otherParty.hint} />
                <AvatarFallback>{otherParty.fallback}</AvatarFallback>
            </Avatar>
            <SheetTitle>{otherParty.name}</SheetTitle>
        </div>
      </SheetHeader>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id || message._id}
                className={cn(
                  "flex items-end gap-2",
                  message.sender === selfSender ? "justify-end" : ""
                )}
              >
                {message.sender !== selfSender && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={otherParty.avatar} alt={otherParty.name} data-ai-hint={otherParty.hint} />
                    <AvatarFallback>{otherParty.fallback}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg p-3 text-sm",
                    message.sender === selfSender
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.text}</p>
                  <p className={cn("text-xs mt-1 text-right", message.sender === selfSender ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {message.sender === selfSender && (
                  <Avatar className="h-8 w-8">
                    {selfSender === 'student' ? (
                      <AvatarImage src={studentAvatar} alt="Student" data-ai-hint="woman portrait" />
                    ) : (
                      <AvatarImage src={supervisorAvatar} alt="Supervisor" data-ai-hint="professor portrait" />
                    )}
                    <AvatarFallback>{selfSender === 'student' ? 'AJ' : 'S'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizonal className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}