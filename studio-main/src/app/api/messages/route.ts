// src/app/api/messages/route.ts
import {NextRequest, NextResponse} from 'next/server';
import clientPromise from '@/lib/mongodb';
import {Message} from '@/lib/types';
import { WithId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('thesisFlowDB');
    const messages = await db.collection('messages').find({}).sort({timestamp: 1}).toArray();
    
    const formattedMessages = messages.map((message: WithId<any>) => ({
      ...message,
      id: message._id.toString(),
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({error: 'Failed to fetch messages'}, {status: 500});
  }
}

export async function POST(req: NextRequest) {
  try {
    const {text, sender} = await req.json();

    if (!text || !sender) {
      return NextResponse.json({error: 'Missing text or sender'}, {status: 400});
    }

    const newMessage: Omit<Message, 'id' | '_id'> = {
      text,
      sender,
      timestamp: new Date(),
    };

    const client = await clientPromise;
    const db = client.db('thesisFlowDB');
    const result = await db.collection('messages').insertOne(newMessage);

    const insertedMessage = {
      ...newMessage,
      id: result.insertedId.toString(),
      _id: result.insertedId,
    };

    return NextResponse.json(insertedMessage, {status: 201});
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({error: 'Failed to send message'}, {status: 500});
  }
}