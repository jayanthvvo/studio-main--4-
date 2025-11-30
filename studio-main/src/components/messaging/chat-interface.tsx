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
import { useMessaging } from "@/contexts/messaging-context";
import { useAuth } from "@/contexts/auth-context";

interface ChatInterfaceProps {
    perspective?: 'student' | 'supervisor'; // Made optional
}

export function ChatInterface({ perspective = 'supervisor' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const { chatPartner } = useMessaging();
  const { displayName, user } = useAuth(); // Get user for token

  const studentAvatar = PlaceHolderImages.find(p => p.id === 'avatar-1')?.imageUrl ?? "https://picsum.photos/seed/1/100/100";
  const supervisorAvatar = PlaceHolderImages.find(p => p.id === 'supervisor-avatar')?.imageUrl ?? "https://picsum.photos/seed/5/100/100";

  const selfSender = perspective;
  
  const otherParty = {
    name: chatPartner?.displayName || (perspective === 'supervisor' ? 'Student' : 'Supervisor'),
    avatar: chatPartner?.avatarUrl || (perspective === 'supervisor' ? studentAvatar : supervisorAvatar),
    fallback: chatPartner?.displayName?.substring(0, 2).toUpperCase() || (perspective === 'supervisor' ? 'ST' : 'SU'),
    hint: perspective === 'supervisor' ? 'student portrait' : 'professor portrait',
  };

  useEffect(() => {
    if (!chatPartner || !user) return;

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const token = await user.getIdToken();
        // Pass the partnerId to fetch specific conversation
        const response = await fetch(`/api/messages?partnerId=${chatPartner._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [chatPartner, user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !chatPartner || !user) return;

    setIsSending(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Send partnerId instead of sender role
        body: JSON.stringify({ text: newMessage, partnerId: chatPartner._id }),
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
          ) : !chatPartner ? (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <p>Select a student from the submissions table to start messaging.</p>
             </div>
          ) : messages.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <p>No messages yet. Say hello!</p>
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
            disabled={isSending || !chatPartner}
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim() || !chatPartner}>
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