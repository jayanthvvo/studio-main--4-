import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// GET a single submission by its ID (remains the same)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    const { id } = params;

    if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid submission ID format.' }, { status: 400 });
    }

    const submission = await db.collection("submissions").findOne({ _id: new ObjectId(id) });

    if (!submission) {
        return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Failed to fetch submission:", error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

// **NEW**: PATCH function to add feedback and a grade to a submission
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.split('Bearer ')[1];

  try {
    // 1. Verify the user is a logged-in supervisor
    const decodedToken = await adminAuth.verifyIdToken(token);
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    const supervisor = await db.collection("users").findOne({ uid: decodedToken.uid });

    if (!supervisor || supervisor.role !== 'supervisor') {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const { id } = params;
    const { feedback, grade } = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid submission ID format.' }, { status: 400 });
    }
    if (!feedback || !grade) {
        return NextResponse.json({ error: 'Feedback and grade are required fields.' }, { status: 400 });
    }

    // 2. Find the submission by its ID and update it in the database
    const result = await db.collection("submissions").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          feedback: feedback,
          grade: grade,
          status: 'Reviewed' // Also update the submission's status
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Submission not found or no changes were made.' }, { status: 404 });
    }

    // 3. Return a success response
    return NextResponse.json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error("!!!!!!!!!! SUBMISSION UPDATE ERROR !!!!!!!!!!:", error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}