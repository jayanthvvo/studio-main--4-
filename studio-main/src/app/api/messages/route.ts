// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const partnerId = searchParams.get('partnerId');

  if (!partnerId) {
    return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const client = await clientPromise;
    const db = client.db('thesisFlowDB');
    const user = await db.collection("users").findOne({ uid });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query = {};
    const partnerObjectId = new ObjectId(partnerId);

    // Filter messages based on the role of the requester
    if (user.role === 'supervisor') {
        query = { supervisorId: user._id, studentId: partnerObjectId };
    } else if (user.role === 'student') {
        query = { studentId: user._id, supervisorId: partnerObjectId };
    } else {
        // Admin or other
        return NextResponse.json([]);
    }

    const messages = await db.collection('messages').find(query).sort({ timestamp: 1 }).toArray();
    
    const formattedMessages = messages.map((message) => ({
      ...message,
      id: message._id.toString(),
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { text, partnerId } = await req.json();

    if (!text || !partnerId) {
      return NextResponse.json({ error: 'Missing text or partnerId' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('thesisFlowDB');
    const user = await db.collection("users").findOne({ uid });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const partnerObjectId = new ObjectId(partnerId);
    let newMessage: any = {
      text,
      timestamp: new Date(),
    };

    // Set sender and IDs based on the role of the user sending the message
    if (user.role === 'supervisor') {
        newMessage.sender = 'supervisor';
        newMessage.supervisorId = user._id;
        newMessage.studentId = partnerObjectId;
    } else {
        newMessage.sender = 'student';
        newMessage.studentId = user._id;
        newMessage.supervisorId = partnerObjectId;
    }

    const result = await db.collection('messages').insertOne(newMessage);

    const insertedMessage = {
      ...newMessage,
      id: result.insertedId.toString(),
      _id: result.insertedId,
    };

    return NextResponse.json(insertedMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}