import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// This is the GET function for /api/submissions/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } } // The params object is passed by Next.js
) {
  try {
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");
    const { id } = params; // <-- Correct way to destructure the id

    // Check if the provided ID is a valid MongoDB ObjectId format
    if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid submission ID format.' }, { status: 400 });
    }

    // Find the single document that matches the _id
    const submission = await db.collection("submissions").findOne({ _id: new ObjectId(id) });

    // If no submission is found, return a 404 error
    if (!submission) {
        return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    // If found, return the submission data
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Failed to fetch submission:", error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}