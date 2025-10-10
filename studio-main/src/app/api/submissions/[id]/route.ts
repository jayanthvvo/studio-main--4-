// src/app/api/submissions/[id]/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { adminAuth } from '@/lib/firebase-admin';
import { ObjectId } from 'mongodb';

// --- NEW DELETE FUNCTION ---
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

    // 1. Find the submission to ensure the user owns it
    const submission = await db.collection("submissions").findOne({ _id: submissionObjectId });

    if (!submission) {
        return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    if (submission.student.uid !== uid) {
        return NextResponse.json({ error: 'Forbidden: You can only delete your own submissions.' }, { status: 403 });
    }

    // 2. Delete the submission
    await db.collection("submissions").deleteOne({ _id: submissionObjectId });

    // 3. Revert the corresponding milestone
    const milestoneToRevert = await db.collection("milestones").findOne({ submissionId: submissionIdToDelete });
    
    if (milestoneToRevert) {
        // Set the completed milestone back to 'In Progress'
        await db.collection("milestones").updateOne(
            { _id: milestoneToRevert._id },
            { $set: { status: 'In Progress', submissionId: null } }
        );

        // Find the next milestone (which was set to 'Pending') and revert it back to 'Upcoming'
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