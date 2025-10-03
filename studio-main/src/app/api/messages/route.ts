// A mock API route for messages.
import {NextRequest, NextResponse} from 'next/server';
import {messages} from '@/lib/data';
import type {Message} from '@/lib/types';

export async function GET() {
  // In a real app, you'd fetch this from a database.
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const {text, sender} = await req.json();

  if (!text || !sender) {
    return NextResponse.json(
      {error: 'Missing text or sender'},
      {status: 400}
    );
  }

  const newMessage: Message = {
    id: (messages.length + 1).toString(),
    text,
    sender,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // In a real app, you'd save this to a database.
  messages.push(newMessage);

  return NextResponse.json(newMessage, {status: 201});
}
