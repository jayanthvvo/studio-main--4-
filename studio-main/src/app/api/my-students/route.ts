// src/app/api/my-students/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// GET students for the currently logged-in supervisor
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const supervisorUid = decodedToken.uid;

    const client = await clientPromise;
    const db = client.db("thesisFlowDB");

    // 1. Find the supervisor's user document to get their MongoDB ObjectId
    const supervisor = await db.collection("users").findOne({ uid: supervisorUid });
    if (!supervisor || supervisor.role !== 'supervisor') {
      return NextResponse.json({ error: 'Supervisor profile not found or invalid role.' }, { status: 404 });
    }
    const supervisorId = supervisor._id;

    // 2. Find all dissertations assigned to this supervisor
    const dissertations = await db.collection("dissertations").find({ supervisorId: supervisorId }).toArray();
    if (!dissertations.length) {
      return NextResponse.json([]); // No students assigned
    }

    // 3. Get an array of the student IDs from these dissertations
    const studentIds = dissertations.map(d => d.studentId);
    
    // 4. Find and return all users who are these students
    const students = await db.collection("users").find(
        { _id: { $in: studentIds } },
        // Only return the fields we need
        { projection: { uid: 1, displayName: 1, email: 1, avatarUrl: 1 } }
    ).toArray();
    
    return NextResponse.json(students);

  } catch (error) {
    console.error("Failed to fetch supervisor's students:", error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
