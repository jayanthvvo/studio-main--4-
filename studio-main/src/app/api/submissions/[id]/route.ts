// src/app/api/submissions/[id]/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// GET function to fetch a single submission
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization');
  const submissionId = params.id;

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ObjectId.isValid(submissionId)) {
    return NextResponse.json({ error: 'Invalid Submission ID.' }, { status: 400 });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const requestorUid = decodedToken.uid;
    
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");

    const submissionObjectId = new ObjectId(submissionId);
    const submission = await db.collection("submissions").findOne({ _id: submissionObjectId });

    if (!submission) {
        return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    const requestor = await db.collection("users").findOne({ uid: requestorUid });
    if (!requestor) {
        return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    if (submission.student.uid === requestorUid) {
        return NextResponse.json(submission);
    }
    
    if (requestor.role === 'supervisor') {
        const dissertation = await db.collection("dissertations").findOne({
            studentId: submission.student._id,
            supervisorId: requestor._id
        });

        if (dissertation) {
            return NextResponse.json(submission);
        }
    }

    return NextResponse.json({ error: 'Forbidden: You do not have permission to view this submission.' }, { status: 403 });

  } catch (error) {
    console.error("!!!!!!!!!! FAILED TO FETCH SUBMISSION !!!!!!!!!!:", error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

// --- NEW PATCH FUNCTION ---
// This handles the supervisor's feedback submission from the ReviewForm
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const authHeader = request.headers.get('Authorization');
    const submissionId = params.id;

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!ObjectId.isValid(submissionId)) {
        return NextResponse.json({ error: 'Invalid Submission ID.' }, { status: 400 });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        const supervisorUid = decodedToken.uid;
        
        const client = await clientPromise;
        const db = client.db("thesisFlowDB");

        const supervisor = await db.collection("users").findOne({ uid: supervisorUid });
        if (!supervisor || supervisor.role !== 'supervisor') {
            return NextResponse.json({ error: 'Forbidden: Only supervisors can submit reviews.' }, { status: 403 });
        }
        
        const { feedback, grade } = await request.json();
        if (!feedback || !grade) {
            return NextResponse.json({ error: 'Feedback and grade are required.' }, { status: 400 });
        }

        const submissionObjectId = new ObjectId(submissionId);
        const result = await db.collection("submissions").updateOne(
            { _id: submissionObjectId },
            { $set: { feedback, grade, status: 'Reviewed' } }
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json({ error: 'Submission not found or not modified.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Review submitted successfully.' });
    } catch (error) {
        console.error("!!!!!!!!!! FAILED TO UPDATE SUBMISSION (REVIEW) !!!!!!!!!!:", error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}


// DELETE function for student submissions
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('Authorization');
  const submissionIdToDelete = params.id;

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ObjectId.isValid(submissionIdToDelete)) {
    return NextResponse.json({ error: 'Invalid Submission ID.' }, { status: 400 });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    
    const client = await clientPromise;
    const db = client.db("thesisFlowDB");

    const submissionObjectId = new ObjectId(submissionIdToDelete);
    const submission = await db.collection("submissions").findOne({ _id: submissionObjectId });

    if (!submission) {
        return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    if (submission.student.uid !== uid) {
        return NextResponse.json({ error: 'Forbidden: You can only delete your own submissions.' }, { status: 403 });
    }

    await db.collection("submissions").deleteOne({ _id: submissionObjectId });

    const milestoneToRevert = await db.collection("milestones").findOne({ submissionId: submissionIdToDelete });
    
    if (milestoneToRevert) {
        await db.collection("milestones").updateOne(
            { _id: milestoneToRevert._id },
            { $set: { status: 'In Progress', submissionId: null } }
        );

        const allMilestones = await db.collection("milestones").find({ studentId: milestoneToRevert.studentId }).sort({ _id: 1 }).toArray();
        const revertedIndex = allMilestones.findIndex(m => m._id.equals(milestoneToRevert._id));

        if (revertedIndex !== -1 && revertedIndex + 1 < allMilestones.length) {
            const nextMilestone = allMilestones[revertedIndex + 1];
            if (nextMilestone.status === 'Pending') {
                await db.collection("milestones").updateOne(
                    { _id: nextMilestone._id },
                    { $set: { status: 'Upcoming' } }
                );
            }
        }
    }

    return NextResponse.json({ message: 'Submission deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error("!!!!!!!!!! SUBMISSION DELETION ERROR !!!!!!!!!!:", error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}