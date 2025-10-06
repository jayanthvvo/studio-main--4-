// src/app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { adminAuth } from '@/lib/firebase-admin';

const MONGODB_URI = process.env.MONGODB_URI;

export async function POST(request: Request) {
  if (!MONGODB_URI) {
    console.error('!!!!!!!!!! MONGODB_URI is not defined in .env.local !!!!!!!!!!');
    return NextResponse.json({ error: 'Database configuration error.' }, { status: 500 });
  }
  
  const client = new MongoClient(MONGODB_URI);
  // MODIFICATION: Add displayName to the destructured request body
  const { email, password, role, displayName } = await request.json();

  if (role !== 'student' && role !== 'supervisor') {
    return NextResponse.json({ error: 'A valid role must be provided.' }, { status: 400 });
  }
  // MODIFICATION: Add validation for displayName
  if (!email || !password || !displayName) {
    return NextResponse.json({ error: 'Email, password, and full name must be provided.' }, { status: 400 });
  }

  try {
    // MODIFICATION: Add displayName to the user creation payload for Firebase Auth
    const userRecord = await adminAuth.createUser({ email, password, displayName });
    
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      role: role,
      // MODIFICATION: Use the provided displayName
      displayName: displayName,
      createdAt: new Date(),
    };

    await client.connect();
    const db = client.db("thesisFlowDB");
    await db.collection("users").insertOne(userProfile);

    return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
  } catch (error: any) {
    console.error("!!!!!!!!!! REGISTRATION API ERROR !!!!!!!!!!:", error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'This email address is already in use.' }, { status: 409 });
    }
    if (error.name === 'MongoNetworkError') {
         return NextResponse.json({ error: 'Could not connect to the database.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred during registration.' }, { status: 500 });
  } finally {
    await client.close();
  }
}