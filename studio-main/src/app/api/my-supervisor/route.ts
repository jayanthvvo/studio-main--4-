// src/app/api/my-supervisor/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// GET supervisor for the currently logged-in student
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const studentUid = decodedToken.uid;

    const client = await clientPromise;
    const db = client.db("thesisFlowDB");

    // 1. Find the student's user document
    const student = await db.collection("users").findOne({ uid: studentUid });
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student profile not found or invalid role.' }, { status: 404 });
    }
    const studentId = student._id;

    // 2. Find the dissertation assigned to this student
    const dissertation = await db.collection("dissertations").findOne({ studentId: studentId });
    if (!dissertation) {
      return NextResponse.json({ error: 'No dissertation found for this student.' }, { status: 404 });
    }

    // 3. Get the supervisor ID from the dissertation
    const supervisorId = dissertation.supervisorId;

    // 4. Find and return the supervisor's user document
    const supervisor = await db.collection("users").findOne(
        { _id: supervisorId },
        // Only return the fields we need
        { projection: { _id: 1, uid: 1, displayName: 1, email: 1, avatarUrl: 1 } }
    );

    if (!supervisor) {
        return NextResponse.json({ error: 'Supervisor not found.' }, { status: 404 });
    }
    
    return NextResponse.json(supervisor);

  } catch (error) {
    console.error("Failed to fetch student's supervisor:", error);
    return NextResponse.json({ error: 'Failed to fetch supervisor' }, { status: 500 });
  }
}