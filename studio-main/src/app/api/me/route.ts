// src/app/api/me/route.ts
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { adminAuth } from '@/lib/firebase-admin'; // <-- Import from our new utility file

// --- MongoDB Connection Setup ---
const MONGODB_URI = process.env.MONGODB_URI;

export async function GET(request: Request) {
  if (!MONGODB_URI) {
    console.error('!!!!!!!!!! MONGODB_URI is not defined in .env.local !!!!!!!!!!');
    return NextResponse.json({ error: 'Database configuration error.' }, { status: 500 });
  }

  const client = new MongoClient(MONGODB_URI);
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Use the pre-initialized adminAuth instance
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    await client.connect();
    const db = client.db("thesisFlowDB");
    const userProfile = await db.collection("users").findOne({ uid: uid });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('!!!!!!!!!! /api/me ERROR !!!!!!!!!!:', error);
    return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
  } finally {
    await client.close();
  }
}

export async function PATCH(request: Request) {
  if (!MONGODB_URI) {
    console.error('!!!!!!!!!! MONGODB_URI is not defined in .env.local !!!!!!!!!!');
    return NextResponse.json({ error: 'Database configuration error.' }, { status: 500 });
  }

  const client = new MongoClient(MONGODB_URI);
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { displayName } = await request.json();

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return NextResponse.json({ error: 'A valid display name is required.' }, { status: 400 });
    }

    // Update in Firebase Authentication
    await adminAuth.updateUser(uid, { displayName });

    // Update in MongoDB
    await client.connect();
    const db = client.db("thesisFlowDB");
    const result = await db.collection("users").updateOne(
      { uid: uid },
      { $set: { displayName: displayName.trim() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User profile not found in the database.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('!!!!!!!!!! /api/me PATCH ERROR !!!!!!!!!!:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  } finally {
    await client.close();
  }
}