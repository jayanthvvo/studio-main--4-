// src/contexts/messaging-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define a type for the user profile info we'll pass around
interface ChatPartner {
  _id: string;
  displayName: string;
  avatarUrl?: string;
}

interface MessagingContextType {
  isChatOpen: boolean;
  chatPartner: ChatPartner | null;
  openChat: (partner: ChatPartner) => void;
  closeChat: () => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);

  const openChat = (partner: ChatPartner) => {
    setChatPartner(partner);
    setIsChatOpen(true);
  };
  
  const closeChat = () => {
    setIsChatOpen(false);
    setChatPartner(null); // Clear the partner on close
  };

  return (
    <MessagingContext.Provider value={{ isChatOpen, chatPartner, openChat, closeChat }}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};