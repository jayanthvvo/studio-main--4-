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
