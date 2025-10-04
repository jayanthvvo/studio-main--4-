import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';

// GET submissions for the currently logged-in student
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    
    // Find submissions where the student's UID matches
    const submissions = await db.collection("submissions").find({ "student.uid": uid }).toArray();
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Failed to fetch student submissions:", error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}